import {
  createSession,closeSession,navigateSession,snapshotSession,clickLinkSession,runActions
} from './runtime.mjs';

const DANGEROUS=/logout|log-out|signout|sign-out|delete|remove|unsubscribe|checkout|purchase|buy-now|confirm-order|cancel-account|terminate|revoke|reset-password|signoff/i;

function s(v){return String(v??'').trim();}
function words(v){
  return [...new Set(s(v).toLowerCase().split(/[^a-z0-9à-ÿ]+/iu).filter(x=>x.length>2))];
}
function host(url){
  try{return new URL(url).hostname.toLowerCase();}catch{return '';}
}
function scoreLink(link,goal,currentUrl,{allowCrossDomainReadOnly=false}={}){
  const href=s(link?.href),text=s(link?.text);
  if(!href||DANGEROUS.test(href+' '+text))return -1;
  if(!allowCrossDomainReadOnly&&host(href)!==host(currentUrl))return -1;

  const goalTokens=words(goal);
  const hay=words(text+' '+href);
  let score=0;
  for(const token of goalTokens)if(hay.includes(token))score+=5;
  if(text.length>2)score+=1;
  if(/about|docs|documentation|details|learn|more|project|product|research|report|article|news|profile|company|service|pricing|features|jobs|careers/i.test(text+' '+href))score+=2;
  return score;
}

export function verifySnapshot(snapshot,conditions=[]){
  const checks=(conditions||[]).slice(0,20).map(c=>{
    const kind=s(c.kind).toUpperCase(),value=s(c.value);
    let passed=false;
    if(kind==='URL_CONTAINS')passed=s(snapshot?.url).includes(value);
    else if(kind==='TITLE_CONTAINS')passed=s(snapshot?.title).toLowerCase().includes(value.toLowerCase());
    else if(kind==='TEXT_CONTAINS')passed=s(snapshot?.text).toLowerCase().includes(value.toLowerCase());
    else if(kind==='LINK_CONTAINS')passed=(snapshot?.links||[]).some(x=>s(x.href).includes(value)||s(x.text).toLowerCase().includes(value.toLowerCase()));
    return {kind,value,passed};
  });
  return {checks,passed:checks.length?checks.every(x=>x.passed):true};
}

export function planAgentRun(input={}){
  return {
    goal:s(input.goal),
    url:s(input.url),
    allowedDomains:Array.isArray(input.allowedDomains)?input.allowedDomains.slice(0,50):[],
    blockDomains:Array.isArray(input.blockDomains)?input.blockDomains.slice(0,50):[],
    maxSteps:Math.max(1,Math.min(Number(input.maxSteps||6),12)),
    allowCrossDomainReadOnly:input.allowCrossDomainReadOnly===true,
    scriptedActions:Array.isArray(input.actions)?input.actions.slice(0,25):[],
    mode:Array.isArray(input.actions)&&input.actions.length?'SCRIPTED_PLUS_READ_ONLY':'AUTONOMOUS_READ_ONLY',
    authority:'NONE',
    sideEffects:'DENIED_BY_DEFAULT'
  };
}

export async function runAgent(input={}){
  const plan=planAgentRun(input);
  if(!plan.goal)throw new Error('AGENT_GOAL_REQUIRED');
  if(!plan.url)throw new Error('AGENT_URL_REQUIRED');

  const allowedDomains=plan.allowedDomains.length?plan.allowedDomains:[host(plan.url)];
  const session=await createSession({
    allowedDomains,
    blockDomains:plan.blockDomains,
    allowPrivateNetwork:false
  });
  const id=session.id;
  const evidence=[];
  let snap;
  let steps=0;

  try{
    snap=await navigateSession(id,plan.url,{timeoutMs:Math.min(Number(input.timeoutMs||20_000),30_000)});
    evidence.push({kind:'OBSERVE_INITIAL',url:snap.url,title:snap.title,text:snap.text.slice(0,1200)});

    if(plan.scriptedActions.length){
      if(input.allowInteractiveActions!==true){
        const interactive=plan.scriptedActions.some(a=>['fill','select','press','click'].includes(s(a.type).toLowerCase())&&a.readOnly!==true);
        if(interactive)throw new Error('INTERACTIVE_ACTIONS_REQUIRE_EXPLICIT_ALLOW');
      }
      const result=await runActions(id,plan.scriptedActions);
      steps+=plan.scriptedActions.length;
      evidence.push({kind:'SCRIPTED_ACTIONS',count:plan.scriptedActions.length,result});
      snap=await snapshotSession(id);
    }

    const visited=new Set([snap.url]);
    for(let i=0;i<plan.maxSteps-steps;i++){
      const verification=verifySnapshot(snap,input.successConditions||[]);
      if((input.successConditions||[]).length&&verification.passed)break;

      const ranked=(snap.links||[])
        .map(link=>({link,score:scoreLink(link,plan.goal,snap.url,{allowCrossDomainReadOnly:plan.allowCrossDomainReadOnly})}))
        .filter(x=>x.score>=0&&!visited.has(x.link.href))
        .sort((a,b)=>b.score-a.score||s(a.link.href).localeCompare(s(b.link.href)));

      const next=ranked[0]?.link;
      if(!next)break;
      visited.add(next.href);

      snap=await clickLinkSession(id,next.selector,{timeoutMs:Math.min(Number(input.timeoutMs||20_000),30_000)});
      steps++;
      evidence.push({
        kind:'AUTO_NAV',
        chosen:{text:next.text,href:next.href,score:ranked[0].score},
        url:snap.url,
        title:snap.title,
        text:snap.text.slice(0,1200)
      });
    }

    const verification=verifySnapshot(snap,input.successConditions||[]);
    const evidenceEnough=snap.text.length>=Math.max(80,Math.min(Number(input.minEvidenceChars||160),5000));
    const success=(input.successConditions||[]).length?verification.passed:evidenceEnough;

    return {
      ok:success,
      service:'V8V',
      version:'0.3.0',
      mode:plan.mode,
      goal:plan.goal,
      startUrl:plan.url,
      finalUrl:snap.url,
      title:snap.title,
      stepsCompleted:steps,
      verification,
      evidenceEnough,
      finality:success?'PROVISIONAL_SUCCESS':'FAILED_VERIFICATION',
      authority:'NONE',
      spendAuthorized:false,
      snapshot:{
        url:snap.url,
        title:snap.title,
        text:snap.text,
        links:snap.links.slice(0,40),
        controls:snap.controls.slice(0,60)
      },
      evidence:evidence.slice(0,30)
    };
  }finally{
    await closeSession(id).catch(()=>{});
  }
}
