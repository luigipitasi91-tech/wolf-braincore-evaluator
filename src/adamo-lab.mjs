const ENDPOINT='https://na0mi-v12-mobile.onrender.com/wolf/adamo/1001';
const clean=v=>String(v||'').replace(/\s+/g,' ').trim();

export function isAdamoIntent(text=''){
  const q=clean(text);
  if(!q)return false;
  if(/\b(adamo|1001|brute\s*force|stress\s*test|monte\s*carlo)\b/i.test(q))return true;
  if(/(?:£|gbp)?\s*100\b.{0,80}(?:£|gbp)?\s*500\b/i.test(q))return true;
  if(/\b(100\s*(?:a|to|→|->)\s*500|x\s*5|5x)\b/i.test(q)&&/\b(invest|mercat|stock|azione|azioni|portfolio|portafoglio|money|soldi|budget)\b/i.test(q))return true;
  if(/\b(farli diventare|trasforma|moltiplica)\b/i.test(q)&&/\b(100|£100|500|£500)\b/i.test(q))return true;
  return false;
}

export function extractAdamoObjective(text=''){
  const q=clean(text);
  const money=[...q.matchAll(/(?:£|gbp)?\s*(\d+(?:[.,]\d+)?)/ig)].map(m=>Number(m[1].replace(',','.'))).filter(Number.isFinite);
  const start=money.find(x=>x>0)||100;
  const target=money.find(x=>x>start)||Math.max(500,start*5);
  return {startCapital:start,targetCapital:target};
}

export async function runAdamoLab(request,{locale='en',fetchImpl=globalThis.fetch}={}){
  if(!isAdamoIntent(request))return {status:'NOT_ADAMO_INTENT'};
  const objective=extractAdamoObjective(request);
  if(typeof fetchImpl!=='function')return {status:'ADAMO_UNAVAILABLE',...objective,error:'FETCH_UNAVAILABLE'};
  try{
    const response=await fetchImpl(ENDPOINT,{
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({...objective,locale})
    });
    if(!response.ok)throw new Error('HTTP_'+response.status);
    return await response.json();
  }catch(error){
    return {status:'ADAMO_UNAVAILABLE',...objective,error:clean(error?.message||error).slice(0,160),controls:{paperOnly:true,liveTrading:false}};
  }
}

export const ADAMO_CLIENT_VERSION='wolf-adamo-client/1.0';
