import express from 'express';
import {
  createSession,closeSession,runActions,snapshotSession,
  screenshotSession,traceSession,health
} from './runtime.mjs';

const app=express();
app.disable('x-powered-by');
app.use(express.json({limit:'1mb'}));

const API_TOKEN=process.env.V8V_API_TOKEN||'';
function auth(req,res,next){
  if(!API_TOKEN)return next();
  const token=req.get('authorization')?.replace(/^Bearer\s+/i,'')||req.get('x-v8v-token')||'';
  if(token!==API_TOKEN)return res.status(401).json({ok:false,error:'UNAUTHORIZED'});
  next();
}

function fail(res,error,status=400){
  const message=error?.message||String(error);
  const code=/SESSION_NOT_FOUND/.test(message)?404:/SESSION_LIMIT/.test(message)?429:status;
  res.status(code).json({ok:false,error:message});
}

app.get('/health',async(_req,res)=>res.json(await health()));
app.get('/',(_req,res)=>res.json({
  name:'V8V',
  description:'Deterministic browser runtime for AI agents',
  version:'0.1.0',
  endpoints:['POST /v1/sessions','POST /v1/sessions/:id/actions','GET /v1/sessions/:id/snapshot','GET /v1/sessions/:id/screenshot','GET /v1/sessions/:id/trace','DELETE /v1/sessions/:id']
}));

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

const port=Number(process.env.PORT||10000);
app.listen(port,'0.0.0.0',()=>console.log('V8V listening on',port));
