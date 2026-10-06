import express from 'express';
import {
  createSession,closeSession,runActions,snapshotSession,screenshotSession,traceSession,health,
  navigateSession,extractSession,clickLinkSession,clickSession,fillSession,pressSession,selectSession
} from './runtime.mjs';
import {planAgentRun,runAgent} from './agent.mjs';

const app=express();
app.disable('x-powered-by');
app.use(express.json({limit:'1mb'}));

const API_TOKEN=process.env.V8V_API_TOKEN||'';
let selftestBusy=false;
let lastSelftestAt=0;
let agentSelftestBusy=false;
let lastAgentSelftestAt=0;

function auth(req,res,next){
  if(!API_TOKEN)return res.status(503).json({ok:false,error:'V8V_API_TOKEN_NOT_CONFIGURED'});
  const token=req.get('authorization')?.replace(/^Bearer\s+/i,'')||req.get('x-v8v-token')||'';
  if(token!==API_TOKEN)return res.status(401).json({ok:false,error:'UNAUTHORIZED'});
  next();
}

function fail(res,error,status=400){
  const message=error?.message||String(error);
  const code=/SESSION_NOT_FOUND/.test(message)?404:/SESSION_LIMIT/.test(message)?429:status;
  res.status(code).json({ok:false,error:message});
}

app.get('/health',async(_req,res)=>res.json({...await health(),controlApiLocked:!API_TOKEN}));

app.get('/selftest',async(_req,res)=>{
  const now=Date.now();
  if(selftestBusy)return res.status(429).json({ok:false,error:'SELFTEST_BUSY'});
  if(now-lastSelftestAt<30_000)return res.status(429).json({ok:false,error:'SELFTEST_RATE_LIMIT'});
  selftestBusy=true;
  lastSelftestAt=now;
  let id='';
  try{
    const session=await createSession({startUrl:'https://example.com',allowedDomains:['example.com']});
    id=session.id;
    const snapshot=await snapshotSession(id,{textLimit:600});
    res.json({
      ok:snapshot.title==='Example Domain',
      browser:true,
      url:snapshot.url,
      title:snapshot.title,
      text:snapshot.text.slice(0,160),
      elements:snapshot.elements.length,
      version:'0.3.0'
    });
  }catch(e){
    fail(res,e,500);
  }finally{
    if(id)await closeSession(id).catch(()=>{});
    selftestBusy=false;
  }
});

app.get('/',(_req,res)=>res.json({
  name:'V8V',
  description:'Deterministic browser runtime and bounded agent for AI systems',
  version:'0.3.0',
  compatibility:['V8V v1 API','Na0mi REMOTE_HTTP_BROWSER'],
  endpoints:[
    'POST /v1/sessions',
    'POST /v1/sessions/:id/actions',
    'GET /v1/sessions/:id/snapshot',
    'GET /v1/sessions/:id/screenshot',
    'GET /v1/sessions/:id/trace',
    'DELETE /v1/sessions/:id',
    'POST /session',
    'POST /session/:id/goto',
    'POST /session/:id/observe',
    'POST /session/:id/extract',
    'POST /session/:id/click-link',
    'POST /session/:id/click',
    'POST /session/:id/fill',
    'POST /session/:id/press',
    'POST /session/:id/select',
    'DELETE /session/:id',
    'POST /v1/agent/plan',
    'POST /v1/agent/run'
  ]
}));

app.post('/v1/agent/plan',auth,(req,res)=>{
  try{res.json({ok:true,plan:planAgentRun(req.body||{})});}
  catch(e){fail(res,e);}
});
app.post('/v1/agent/run',auth,async(req,res)=>{
  try{res.json(await runAgent(req.body||{}));}
  catch(e){fail(res,e);}
});

app.get('/selftest/agent',async(_req,res)=>{
  const now=Date.now();
  if(agentSelftestBusy)return res.status(429).json({ok:false,error:'AGENT_SELFTEST_BUSY'});
  if(now-lastAgentSelftestAt<30_000)return res.status(429).json({ok:false,error:'AGENT_SELFTEST_RATE_LIMIT'});
  agentSelftestBusy=true;
  lastAgentSelftestAt=now;
  try{
    const out=await runAgent({
      url:'https://example.com',
      goal:'Read the public example page and collect enough evidence to verify the browser agent works.',
      allowedDomains:['example.com'],
      maxSteps:2,
      minEvidenceChars:80
    });
    res.json({ok:out.ok,version:out.version,finality:out.finality,title:out.title,url:out.finalUrl,stepsCompleted:out.stepsCompleted});
  }catch(e){fail(res,e,500);}
  finally{agentSelftestBusy=false;}
});

// V8V-native API
app.post('/v1/sessions',auth,async(req,res)=>{
  try{res.status(201).json({ok:true,session:await createSession(req.body||{})});}
  catch(e){fail(res,e);}
});
app.post('/v1/sessions/:id/actions',auth,async(req,res)=>{
  try{res.json({ok:true,...await runActions(req.params.id,req.body?.actions||[])});}
  catch(e){fail(res,e);}
});
app.get('/v1/sessions/:id/snapshot',auth,async(req,res)=>{
  try{res.json({ok:true,snapshot:await snapshotSession(req.params.id)});}
  catch(e){fail(res,e);}
});
app.get('/v1/sessions/:id/screenshot',auth,async(req,res)=>{
  try{
    const png=await screenshotSession(req.params.id,{fullPage:req.query.fullPage==='1'});
    res.type('png').send(png);
  }catch(e){fail(res,e);}
});
app.get('/v1/sessions/:id/trace',auth,(req,res)=>{
  try{res.json({ok:true,...traceSession(req.params.id)});}
  catch(e){fail(res,e);}
});
app.delete('/v1/sessions/:id',auth,async(req,res)=>{
  try{res.json(await closeSession(req.params.id));}
  catch(e){fail(res,e);}
});

// Compatibility API for Na0mi's REMOTE_HTTP_BROWSER adapter.
app.post('/session',auth,async(req,res)=>{
  try{
    const q=req.body||{};
    const session=await createSession({
      allowedDomains:q.allowDomains||[],
      blockDomains:q.blockDomains||[],
      allowPrivateNetwork:q.allowPrivateNetwork===true
    });
    res.status(201).json({id:session.id});
  }catch(e){fail(res,e);}
});

app.post('/session/:id/goto',auth,async(req,res)=>{
  try{res.json(await navigateSession(req.params.id,req.body?.url,{timeoutMs:req.body?.timeoutMs}));}
  catch(e){fail(res,e);}
});
app.post('/session/:id/observe',auth,async(req,res)=>{
  try{res.json(await snapshotSession(req.params.id));}
  catch(e){fail(res,e);}
});
app.post('/session/:id/extract',auth,async(req,res)=>{
  try{res.json(await extractSession(req.params.id,req.body?.selector));}
  catch(e){fail(res,e);}
});
app.post('/session/:id/click-link',auth,async(req,res)=>{
  try{res.json(await clickLinkSession(req.params.id,req.body?.selector,{timeoutMs:req.body?.timeoutMs}));}
  catch(e){fail(res,e);}
});
app.post('/session/:id/click',auth,async(req,res)=>{
  try{res.json(await clickSession(req.params.id,req.body?.selector,{timeoutMs:req.body?.timeoutMs}));}
  catch(e){fail(res,e);}
});
app.post('/session/:id/fill',auth,async(req,res)=>{
  try{res.json(await fillSession(req.params.id,req.body?.selector,req.body?.value,{timeoutMs:req.body?.timeoutMs}));}
  catch(e){fail(res,e);}
});
app.post('/session/:id/press',auth,async(req,res)=>{
  try{res.json(await pressSession(req.params.id,req.body?.key,{timeoutMs:req.body?.timeoutMs}));}
  catch(e){fail(res,e);}
});
app.post('/session/:id/select',auth,async(req,res)=>{
  try{res.json(await selectSession(req.params.id,req.body?.selector,req.body?.value,{timeoutMs:req.body?.timeoutMs}));}
  catch(e){fail(res,e);}
});
app.delete('/session/:id',auth,async(req,res)=>{
  try{res.json({closed:(await closeSession(req.params.id)).ok});}
  catch(e){fail(res,e);}
});

const port=Number(process.env.PORT||10000);
app.listen(port,'0.0.0.0',()=>console.log('V8V listening on',port));
