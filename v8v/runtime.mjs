import {chromium} from 'playwright';
import crypto from 'node:crypto';
import {validateUrl,resolveAndValidateUrl,redactAction} from './policy.mjs';

const sessions=new Map();
const SESSION_TTL_MS=Number(process.env.SESSION_TTL_MS||15*60*1000);
const MAX_SESSIONS=Number(process.env.MAX_SESSIONS||2);

let browserPromise;
async function browser(){
  if(!browserPromise){
    browserPromise=chromium.launch({
      headless:true,
      args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']
    });
  }
  return browserPromise;
}

function now(){return Date.now();}
function touch(session){session.lastUsed=now();}
function trace(session,type,data={}){
  session.trace.push({at:new Date().toISOString(),type,...data});
  if(session.trace.length>200)session.trace.splice(0,session.trace.length-200);
}

async function cleanup(){
  const cutoff=now()-SESSION_TTL_MS;
  for(const [id,s] of sessions){
    if(s.lastUsed<cutoff){
      try{await s.context.close();}catch{}
      sessions.delete(id);
    }
  }
}
setInterval(()=>cleanup().catch(()=>{}),60_000).unref();

function normalizePolicy({allowedDomains=[],blockDomains=[],allowPrivateNetwork=false}={}){
  return {
    allowedDomains:Array.isArray(allowedDomains)?allowedDomains.slice(0,50):[],
    blockDomains:Array.isArray(blockDomains)?blockDomains.slice(0,50):[],
    allowPrivateNetwork:allowPrivateNetwork===true
  };
}

export async function createSession({startUrl,allowedDomains=[],blockDomains=[],allowPrivateNetwork=false,storageState,viewport}={}){
  await cleanup();
  if(sessions.size>=MAX_SESSIONS)throw new Error('SESSION_LIMIT_REACHED');
  const policy=normalizePolicy({allowedDomains,blockDomains,allowPrivateNetwork});
  const b=await browser();
  const context=await b.newContext({
    viewport:viewport&&Number(viewport.width)&&Number(viewport.height)?{width:Number(viewport.width),height:Number(viewport.height)}:{width:1280,height:800},
    storageState:storageState||undefined,
    ignoreHTTPSErrors:false
  });

  const publicHostCache=new Map();
  await context.route('**/*',async route=>{
    const req=route.request();
    const raw=req.url();
    if(!/^https?:/i.test(raw))return route.continue();
    try{
      const host=new URL(raw).hostname.toLowerCase();
      const mainDocument=req.resourceType()==='document'&&req.frame()===req.frame().page().mainFrame();

      if(mainDocument){
        validateUrl(raw,{...policy,enforceDomain:true});
      }

      if(!publicHostCache.has(host)){
        await resolveAndValidateUrl(raw,{...policy,enforceDomain:false});
        publicHostCache.set(host,true);
      }

      return route.continue();
    }catch{
      return route.abort('blockedbyclient');
    }
  });

  const page=await context.newPage();
  const id=crypto.randomUUID();
  const session={id,context,page,policy,lastUsed:now(),createdAt:now(),trace:[],lastScreenshot:null};
  sessions.set(id,session);
  trace(session,'session_created',{policy});

  if(startUrl){
    const safe=await resolveAndValidateUrl(startUrl,{...policy,enforceDomain:true});
    await page.goto(safe,{waitUntil:'domcontentloaded',timeout:20_000});
    trace(session,'navigate',{url:safe});
  }

  return summarizeSession(session);
}

export function getSession(id){
  const s=sessions.get(id);
  if(!s)throw new Error('SESSION_NOT_FOUND');
  touch(s);
  return s;
}

export async function closeSession(id){
  const s=getSession(id);
  await s.context.close();
  sessions.delete(id);
  return {ok:true,id};
}

async function annotate(page){
  return page.evaluate(()=>{
    const els=[...document.querySelectorAll('a,button,input,textarea,select,[role="button"],[role="link"],[contenteditable="true"]')]
      .filter(el=>{
        const r=el.getBoundingClientRect();
        const st=getComputedStyle(el);
        return r.width>0&&r.height>0&&st.visibility!=='hidden'&&st.display!=='none';
      })
      .slice(0,160);

    return els.map((el,i)=>{
      const id='v8v-'+(i+1);
      const selector='[data-v8v-id="'+id+'"]';
      el.setAttribute('data-v8v-id',id);
      return {
        id,
        selector,
        tag:el.tagName.toLowerCase(),
        type:el.getAttribute('type')||null,
        text:(el.innerText||el.value||el.getAttribute('aria-label')||el.getAttribute('placeholder')||'').trim().replace(/\s+/g,' ').slice(0,220),
        placeholder:el.getAttribute('placeholder')||null,
        ariaLabel:el.getAttribute('aria-label')||null,
        name:el.getAttribute('name')||null,
        href:el.href||null,
        disabled:!!el.disabled,
        checked:typeof el.checked==='boolean'?el.checked:undefined
      };
    });
  });
}

export async function snapshotSession(id,{textLimit=30_000}={}){
  const s=getSession(id);
  const {page}=s;
  const elements=await annotate(page);
  const title=await page.title();
  const text=(await page.locator('body').innerText({timeout:5_000}).catch(()=>'' )).replace(/\s+/g,' ').trim().slice(0,Math.min(Number(textLimit||30_000),30_000));

  const links=elements
    .filter(x=>x.tag==='a'&&x.href)
    .slice(0,100)
    .map((x,index)=>({index,text:x.text,href:x.href,selector:x.selector,v8vId:x.id}));

  const controls=elements
    .slice(0,150)
    .map((x,index)=>({index,tag:x.tag,type:x.type,text:x.text,href:x.href,disabled:x.disabled,selector:x.selector,v8vId:x.id}));

  const snap={id,url:page.url(),title,text,links,controls,elements};
  trace(s,'snapshot',{url:snap.url,elements:elements.length});
  return snap;
}

function locatorFor(page,action){
  if(action.v8vId)return page.locator('[data-v8v-id="'+String(action.v8vId).replace(/"/g,'')+'"]').first();
  if(action.selector)return page.locator(String(action.selector)).first();
  throw new Error('LOCATOR_REQUIRED');
}

export async function navigateSession(id,url,{timeoutMs=20_000,waitUntil='domcontentloaded'}={}){
  const s=getSession(id);
  const safe=await resolveAndValidateUrl(url,{...s.policy,enforceDomain:true});
  await s.page.goto(safe,{waitUntil,timeout:Number(timeoutMs||20_000)});
  trace(s,'navigate',{url:safe});
  touch(s);
  return snapshotSession(id);
}

export async function extractSession(id,selector){
  const s=getSession(id);
  if(!selector)return snapshotSession(id);
  const loc=s.page.locator(String(selector));
  const count=Math.min(await loc.count(),100);
  const items=[];
  for(let i=0;i<count;i++){
    const el=loc.nth(i);
    items.push({
      text:(await el.innerText().catch(()=>'' )).slice(0,5000),
      href:await el.getAttribute('href').catch(()=>null),
      ariaLabel:await el.getAttribute('aria-label').catch(()=>null)
    });
  }
  trace(s,'extract',{selector:String(selector).slice(0,240),count});
  return {selector,count,items,url:s.page.url(),title:await s.page.title()};
}

export async function clickLinkSession(id,selector,{timeoutMs=20_000}={}){
  const s=getSession(id);
  const loc=locatorFor(s.page,{selector});
  const meta=await loc.evaluate(el=>({tag:el.tagName.toLowerCase(),href:el.href||null}));
  if(meta.tag!=='a'||!meta.href)throw new Error('READ_ONLY_CLICK_REQUIRES_ANCHOR');
  await resolveAndValidateUrl(meta.href,{...s.policy,enforceDomain:true});
  await Promise.allSettled([
    s.page.waitForLoadState('domcontentloaded',{timeout:Number(timeoutMs||20_000)}),
    loc.click({timeout:Number(timeoutMs||20_000)})
  ]);
  trace(s,'click_link',{selector:String(selector).slice(0,240),href:meta.href});
  return snapshotSession(id);
}

export async function clickSession(id,selector,{timeoutMs=10_000}={}){
  const s=getSession(id);
  await locatorFor(s.page,{selector}).click({timeout:Number(timeoutMs||10_000)});
  trace(s,'click',{selector:String(selector).slice(0,240)});
  return snapshotSession(id);
}

export async function fillSession(id,selector,value,{timeoutMs=10_000}={}){
  const s=getSession(id);
  await locatorFor(s.page,{selector}).fill(String(value??''),{timeout:Number(timeoutMs||10_000)});
  trace(s,'fill',{action:redactAction({selector,value})});
  return snapshotSession(id);
}

export async function pressSession(id,key,{timeoutMs=10_000}={}){
  const s=getSession(id);
  await s.page.keyboard.press(String(key||'Enter'));
  await s.page.waitForTimeout(Math.min(Number(timeoutMs||500),500));
  trace(s,'press',{key:String(key||'Enter').slice(0,80)});
  return snapshotSession(id);
}

export async function selectSession(id,selector,value,{timeoutMs=10_000}={}){
  const s=getSession(id);
  await locatorFor(s.page,{selector}).selectOption(String(value??''),{timeout:Number(timeoutMs||10_000)});
  trace(s,'select',{selector:String(selector).slice(0,240),value:String(value??'').slice(0,120)});
  return snapshotSession(id);
}

export async function runActions(id,actions=[]){
  if(!Array.isArray(actions))throw new Error('ACTIONS_ARRAY_REQUIRED');
  if(actions.length>25)throw new Error('ACTION_LIMIT_EXCEEDED');
  const s=getSession(id);
  const results=[];

  for(const raw of actions){
    const action={...raw};
    const type=String(action.type||'').toLowerCase();
    trace(s,'action',{action:redactAction(action)});

    if(type==='goto'||type==='navigate'){
      results.push({type,data:await navigateSession(id,action.url,{timeoutMs:action.timeoutMs,waitUntil:action.waitUntil})});
    } else if(type==='click'){
      results.push({type,data:await clickSession(id,action.selector||('[data-v8v-id="'+String(action.v8vId||'')+'"]'),{timeoutMs:action.timeoutMs})});
    } else if(type==='fill'){
      results.push({type,data:await fillSession(id,action.selector||('[data-v8v-id="'+String(action.v8vId||'')+'"]'),action.value,{timeoutMs:action.timeoutMs})});
    } else if(type==='press'){
      if(action.selector||action.v8vId){
        await locatorFor(s.page,action).press(String(action.key||'Enter'),{timeout:Number(action.timeoutMs||10_000)});
        results.push({type,data:await snapshotSession(id)});
      }else{
        results.push({type,data:await pressSession(id,action.key,{timeoutMs:action.timeoutMs})});
      }
    } else if(type==='select'){
      results.push({type,data:await selectSession(id,action.selector||('[data-v8v-id="'+String(action.v8vId||'')+'"]'),action.value,{timeoutMs:action.timeoutMs})});
    } else if(type==='wait'){
      if(action.selector)await s.page.locator(String(action.selector)).waitFor({state:action.state||'visible',timeout:Number(action.timeoutMs||10_000)});
      else await s.page.waitForTimeout(Math.min(Number(action.ms||500),10_000));
      results.push({type,ok:true});
    } else if(type==='back'){
      await s.page.goBack({waitUntil:'domcontentloaded',timeout:Number(action.timeoutMs||20_000)});
      results.push({type,data:await snapshotSession(id)});
    } else if(type==='forward'){
      await s.page.goForward({waitUntil:'domcontentloaded',timeout:Number(action.timeoutMs||20_000)});
      results.push({type,data:await snapshotSession(id)});
    } else if(type==='screenshot'){
      s.lastScreenshot=await s.page.screenshot({type:'png',fullPage:!!action.fullPage});
      results.push({type,ok:true,bytes:s.lastScreenshot.length});
    } else if(type==='snapshot'){
      results.push({type,data:await snapshotSession(id,{textLimit:action.textLimit})});
    } else if(type==='extract'){
      results.push({type,data:await extractSession(id,action.selector)});
    } else if(type==='exportstate'){
      results.push({type,data:await s.context.storageState()});
    } else {
      throw new Error('UNSUPPORTED_ACTION:'+type);
    }
    touch(s);
  }

  return {id,url:s.page.url(),results};
}

export async function screenshotSession(id,{fullPage=false}={}){
  const s=getSession(id);
  s.lastScreenshot=await s.page.screenshot({type:'png',fullPage});
  trace(s,'screenshot',{bytes:s.lastScreenshot.length});
  return s.lastScreenshot;
}

export function traceSession(id){
  const s=getSession(id);
  return {id,trace:[...s.trace]};
}

export function summarizeSession(s){
  return {
    id:s.id,
    createdAt:new Date(s.createdAt).toISOString(),
    lastUsed:new Date(s.lastUsed).toISOString(),
    url:s.page.url(),
    allowedDomains:s.policy.allowedDomains,
    blockDomains:s.policy.blockDomains,
    allowPrivateNetwork:s.policy.allowPrivateNetwork
  };
}

export async function health(){
  let browserReady=false;
  let error=null;
  try{
    const b=await browser();
    browserReady=!!b?.isConnected();
  }catch(e){error=e?.message||String(e);}
  return {ok:browserReady,service:'v8v-browser-runtime',version:'0.3.0',browserReady,sessions:sessions.size,maxSessions:MAX_SESSIONS,error};
}
