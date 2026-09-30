const ENDPOINT='https://na0mi-v12-mobile.onrender.com/wolf/market/lens';
const clean=v=>String(v||'').replace(/\s+/g,' ').trim();

export function isMarketIntent(text=''){
  const q=clean(text);
  const semantic=/\b(stock|stocks|equity|equities|market|markets|ticker|portfolio|dcf|valuation|dividend|earnings|nasdaq|s&p|ftse|nikkei|hang seng|mercato|mercati|azionario|azionari|azioni|titolo|titoli|portafoglio|dividendi|trimestrali|valutazione|borsa)\b/i.test(q);
  const ticker=(q.match(/\b[A-Z]{1,5}\b/g)||[]).some(x=>!['WOLF','HOLD','LIVE'].includes(x));
  return semantic||ticker;
}

export async function runMarketLens(request,{locale='en',fetchImpl=globalThis.fetch}={}){
  if(!isMarketIntent(request))return {status:'NOT_MARKET_INTENT',cards:[],controls:{readOnly:true}};
  if(typeof fetchImpl!=='function')return {status:'MARKET_LENS_UNAVAILABLE',cards:[],controls:{readOnly:true},error:'FETCH_UNAVAILABLE'};
  try{
    const response=await fetchImpl(ENDPOINT,{
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({query:clean(request),locale})
    });
    if(!response.ok)throw new Error('HTTP_'+response.status);
    const data=await response.json();
    return {...data,source:'Na0mi V12 Market Data'};
  }catch(error){
    return {
      status:'MARKET_LENS_UNAVAILABLE',
      cards:[],
      controls:{readOnly:true,brokerExecution:false,ordersPlaced:false},
      error:clean(error?.message||error).slice(0,160),
      source:'Na0mi V12 Market Data'
    };
  }
}

export function marketAnswer(request,lens,locale='en'){
  const it=locale==='it';
  if(lens?.status==='NOT_MARKET_INTENT')return null;
  const available=(lens?.cards||[]).filter(x=>x.status==='AVAILABLE');
  if(!available.length){
    return it
      ? 'Ho capito che stai cercando informazioni di mercato. I dati quotati non sono disponibili in questo momento, quindi WOLF non inventa prezzi: usa la ricerca live e ti mostra cosa manca per restringere la richiesta.'
      : 'I understood this as a market request. Quote data is unavailable right now, so WOLF does not invent prices; it uses live research and shows what is still needed to narrow the request.';
  }
  if(available.length===1){
    const x=available[0];
    const move=x.changePercent==null?'':` · ${x.changePercent>=0?'+':''}${x.changePercent}%`;
    return it
      ? `Ho trovato dati per ${x.label||x.symbol} (${x.symbol}): ultimo valore disponibile ${x.price??'n/d'} ${x.currency||''}${move}. Sotto trovi contesto, fonte e analisi descrittiva; nessun ordine viene preparato o eseguito.`
      : `I found data for ${x.label||x.symbol} (${x.symbol}): latest available value ${x.price??'n/a'} ${x.currency||''}${move}. Context, source and descriptive analysis are below; no order is prepared or executed.`;
  }
  return it
    ? `Ho trovato ${available.length} mercati/strumenti confrontabili. Non scelgo automaticamente “il migliore” senza sapere area geografica, orizzonte e rischio: il Market Lens ti mostra i dati disponibili e poi restringiamo il confronto.`
    : `I found ${available.length} comparable markets/instruments. I will not automatically choose a “best” one without region, horizon and risk; Market Lens shows the available data so the comparison can be narrowed.`;
}

export const MARKET_LENS_VERSION='wolf-market-lens/1.0';
