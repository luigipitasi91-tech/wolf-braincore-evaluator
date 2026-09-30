const NAOMI_SEARCH_URL='https://na0mi-v12-mobile.onrender.com/search/live';

const clean=v=>String(v||'').replace(/\s+/g,' ').trim();

export function looksItalian(text=''){
  return /\b(trovami|cerca|ricerca|mercato|azionario|azioni|confronta|analizza|quale|migliore|per me|rischio|orizzonte|dividendi|trimestrali|portafoglio)\b/i.test(text);
}

export function isResearchIntent(text=''){
  const q=clean(text);
  if(!q)return false;
  return /\b(find|search|research|look up|compare|analyse|analyze|study|market|stock|stocks|equity|portfolio|dividend|earnings|macro|risk|valuation|dcf|trovami|cerca|ricerca|confronta|analizza|studia|mercato|azionario|azioni|portafoglio|dividendi|trimestrali|rischio|valutazione)\b/i.test(q);
}

export function expandResearchQuery(text=''){
  const q=clean(text);
  if(!q)return q;
  const stockMarket=/\b(mercato azionario|stock market)\b/i.test(q);
  const hasRegion=/\b(usa|u\.s\.|united states|uk|united kingdom|europe|eu|asia|japan|china|india|australia|canada|italy|italia|germany|france|spain|nikkei|s&p|nasdaq|stoxx|ftse|hang seng)\b/i.test(q);
  if(stockMarket&&!hasRegion){
    return q+' global stock market comparison S&P 500 STOXX Europe 600 Nikkei 225 Hang Seng';
  }
  return q;
}

export function normalizeResearchResponse(data={}){
  const raw=Array.isArray(data.results)?data.results:[];
  const results=raw
    .filter(x=>x&&x.title&&x.url)
    .slice(0,8)
    .map(x=>({
      title:clean(x.title).slice(0,180),
      url:clean(x.url),
      snippet:clean(x.snippet).slice(0,480),
      source:clean(x.source||'Source').slice(0,80)
    }));
  return {
    status:results.length?'LIVE_RESEARCH_COMPLETE':'LIVE_RESEARCH_NO_RESULTS',
    results,
    resultCount:results.length,
    successfulSources:Number(data.successfulSources||0),
    attemptedSources:Number(data.attemptedSources||0),
    retrievedAt:data.retrievedAt||new Date().toISOString(),
    provisional:true,
    cacheHit:data.cacheHit===true,
    staleFallback:data.staleFallback===true
  };
}

export async function runLiveResearch(request,{fetchImpl=globalThis.fetch,depth='DEEP'}={}){
  const raw=clean(request);
  if(!isResearchIntent(raw))return {status:'NOT_RESEARCH_INTENT',results:[],resultCount:0,provisional:true};
  if(typeof fetchImpl!=='function')return {status:'LIVE_RESEARCH_UNAVAILABLE',results:[],resultCount:0,provisional:true,error:'FETCH_UNAVAILABLE'};
  const query=expandResearchQuery(raw);
  try{
    const response=await fetchImpl(NAOMI_SEARCH_URL,{
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({query,depth})
    });
    if(!response.ok)throw new Error('HTTP_'+response.status);
    const data=await response.json();
    return {query,provider:'Na0mi V12 Live Search',...normalizeResearchResponse(data)};
  }catch(error){
    return {
      status:'LIVE_RESEARCH_UNAVAILABLE',
      query,
      provider:'Na0mi V12 Live Search',
      results:[],
      resultCount:0,
      provisional:true,
      error:clean(error?.message||error).slice(0,160)
    };
  }
}

export const LIVE_RESEARCH_VERSION='wolf-live-research/1.0';
