import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';

const PORT=10123;
const TOKEN='v8v-test-token-abcdefghijklmnopqrstuvwxyz-123456';
const base='http://127.0.0.1:'+PORT;
const child=spawn(process.execPath,['server.mjs'],{
  cwd:new URL('../',import.meta.url),
  env:{...process.env,PORT:String(PORT),V8V_API_TOKEN:TOKEN,MAX_SESSIONS:'1'},
  stdio:'ignore'
});

const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function waitReady(){
  let last;
  for(let i=0;i<40;i++){
    try{
      const res=await fetch(base+'/health');
      if(res.ok)return res.json();
      last=new Error('health '+res.status);
    }catch(e){last=e;}
    await sleep(250);
  }
  throw last||new Error('V8V_NOT_READY');
}

async function call(path,{method='POST',body}={}){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),30000);
  let res;
  try{
    res=await fetch(base+path,{
      method,
      headers:{authorization:'Bearer '+TOKEN,'content-type':'application/json'},
      body:body===undefined?undefined:JSON.stringify(body),
      signal:controller.signal
    });
  }finally{
    clearTimeout(timer);
  }
  const text=await res.text();
  let data={};
  try{data=text?JSON.parse(text):{}}catch{data={raw:text}}
  if(!res.ok)throw new Error('HTTP_'+res.status+':'+JSON.stringify(data));
  return data;
}

try{
  const health=await waitReady();
  assert.equal(health.ok,true);
  assert.equal(health.version,'0.2.0');

  const created=await call('/session',{body:{allowDomains:['example.com']}});
  assert.ok(created.id);

  const snap=await call('/session/'+created.id+'/goto',{body:{url:'https://example.com',timeoutMs:20000}});
  assert.equal(snap.title,'Example Domain');
  assert.ok(snap.text.length>80);
  assert.ok(Array.isArray(snap.links));
  assert.ok(Array.isArray(snap.controls));

  const observed=await call('/session/'+created.id+'/observe',{body:{}});
  assert.equal(observed.url,'https://example.com/');
  assert.equal(observed.title,'Example Domain');

  const extracted=await call('/session/'+created.id+'/extract',{body:{selector:'body'}});
  assert.equal(extracted.count,1);
  assert.ok(extracted.items[0].text.length>80);

  const closed=await call('/session/'+created.id,{method:'DELETE'});
  assert.equal(closed.closed,true);

  console.log(JSON.stringify({status:'PASS',test:'V8V_NA0MI_REMOTE_HTTP_COMPAT',title:snap.title,url:snap.url}));
}finally{
  child.kill('SIGKILL');
  await sleep(100);
}
