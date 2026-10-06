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

export async function createSession({startUrl,allowedDomains=[],storageState,viewport}={}){
  await cleanup();
  if(sessions.size>=MAX_SESSIONS)throw new Error('SESSION_LIMIT_REACHED');
  const b=await browser();
  const context=await b.newContext({
    viewport:viewport&&Number(viewport.width)&&Number(viewport.height)?{width:Number(viewport.width),height:Number(viewport.height)}:{width:1280,height:800},
    storageState:storageState||undefined,
    ignoreHTTPSErrors:false
  });
  const networkVerdicts=new Map();
  await context.route('**/*',async route=>{
    const req=route.request();
    const raw=req.url();
    if(!/^https?:/i.test(raw))return route.continue();
    try{
      const host=new URL(raw).hostname;
      let allowed=networkVerdicts.get(host);
      if(allowed===undefined){
        await resolveAndValidateUrl(raw,{allowedDomains, enforceDomain:req.resourceType()==='document'});
        allowed=true;
        networkVerdicts.set(host,true);
      }else if(req.resourceType()==='document'){
        validateUrl(raw,{allowedDomains});
      }
      return route.continue();
    }catch{
      return route.abort('blockedbyclient');
    }
  });
  const page=await context.newPage();
  const id=crypto.randomUUID();
  const session={id,context,page,allowedDomains,lastUsed:now(),createdAt:now(),trace:[],lastScreenshot:null};
  sessions.set(id,session);
  trace(session,'session_created',{allowedDomains});
  if(startUrl){
    const safe=await resolveAndValidateUrl(startUrl,{allowedDomains});
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
  return await page.evaluate(()=>{
    const els=[...document.querySelectorAll('a,button,input,textarea,select,[role="button"],[role="link"],[contenteditable="true"]')]
      .filter(el=>{
        const r=el.getBoundingClientRect();
        const st=getComputedStyle(el);
        return r.width>0&&r.height>0&&st.visibility!=='hidden'&&st.display!=='none';
      })
      .slice(0,160);
    return els.map((el,i)=>{
      const id='v8v-'+(i+1);
      el.setAttribute('data-v8v-id',id);
      return {
        id,
        tag:el.tagName.toLowerCase(),
        type:el.getAttribute('type')||null,
        text:(el.innerText||el.value||'').trim().replace(/\s+/g,' ').slice(0,220),
        placeholder:el.getAttribute('placeholder')||null,
        ariaLabel:el.getAttribute('aria-label')||null,
        href:el.href||null,
        disabled:!!el.disabled,
        checked:typeof el.checked==='boolean'?el.checked:undefined
      };
    });
  });
}

export async function snapshotSession(id,{textLimit=12_000}={}){
  const s=getSession(id);
  const {page}=s;
  const elements=await annotate(page);
  const title=await page.title();
  const text=(await page.locator('body').innerText({timeout:5_000}).catch(()=>'' )).replace(/\s+/g,' ').trim().slice(0,textLimit);
  const snap={id,url:page.url(),title,text,elements};
  trace(s,'snapshot',{url:snap.url,elements:elements.length});
  return snap;
}

function locatorFor(page,action){
  if(action.v8vId)return page.locator('[data-v8v-id="'+String(action.v8vId).replace(/"/g,'')+'"]');
  if(action.selector)return page.locator(String(action.selector));
  throw new Error('LOCATOR_REQUIRED');
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
      const url=await resolveAndValidateUrl(action.url,{allowedDomains:s.allowedDomains});
      await s.page.goto(url,{waitUntil:action.waitUntil||'domcontentloaded',timeout:Number(action.timeoutMs||20_000)});
      results.push({type,url:s.page.url()});
    } else if(type==='click'){
      await locatorFor(s.page,action).click({timeout:Number(action.timeoutMs||10_000)});
      results.push({type,ok:true,url:s.page.url()});
    } else if(type==='fill'){
      await locatorFor(s.page,action).fill(String(action.value??''),{timeout:Number(action.timeoutMs||10_000)});
      results.push({type,ok:true});
    } else if(type==='press'){
      await locatorFor(s.page,action).press(String(action.key||'Enter'),{timeout:Number(action.timeoutMs||10_000)});
      results.push({type,ok:true});
    } else if(type==='wait'){
      if(action.selector)await s.page.locator(String(action.selector)).waitFor({state:action.state||'visible',timeout:Number(action.timeoutMs||10_000)});
      else await s.page.waitForTimeout(Math.min(Number(action.ms||500),10_000));
      results.push({type,ok:true});
    } else if(type==='back'){
      await s.page.goBack({waitUntil:'domcontentloaded',timeout:Number(action.timeoutMs||20_000)});
      results.push({type,url:s.page.url()});
    } else if(type==='forward'){
      await s.page.goForward({waitUntil:'domcontentloaded',timeout:Number(action.timeoutMs||20_000)});
      results.push({type,url:s.page.url()});
    } else if(type==='screenshot'){
      s.lastScreenshot=await s.page.screenshot({type:'png',fullPage:!!action.fullPage});
      results.push({type,ok:true,bytes:s.lastScreenshot.length});
    } else if(type==='snapshot'){
      results.push({type,data:await snapshotSession(id,{textLimit:action.textLimit})});
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
    allowedDomains:s.allowedDomains
  };
}

export async function health(){
  let browserReady=false;
  let error=null;
  try{
    const b=await browser();
    browserReady=!!b?.isConnected();
  }catch(e){error=e?.message||String(e);}
  return {ok:browserReady,service:'v8v-browser-runtime',version:'0.1.0',browserReady,sessions:sessions.size,maxSessions:MAX_SESSIONS,error};
}
