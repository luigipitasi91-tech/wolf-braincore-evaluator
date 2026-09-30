import { buildPlans } from './braincore.mjs';
import { comparePlans } from './evaluator.mjs';
import { runBenchmark } from './benchmark.mjs';
import { runLiveResearch } from './live-research.mjs';
import { runMarketLens, marketAnswer } from './market-lens.mjs';
import {
  perception, localizePlan, localizeFinality, localizeMetricLabel, localizeIntegrityStatus
} from './language-perception.mjs';

const SAMPLE='Create an autonomous app that makes money for me with a £100 budget. It should work as independently as possible, never pretend revenue is real without proof, and ask me only when a human decision is genuinely required.';

const $=sel=>document.querySelector(sel);
const homeEl=$('#home'),formEl=$('#wolfForm'),requestEl=$('#request'),runBtn=$('#run'),backBtn=$('#back'),benchmarkBtn=$('#benchmark');
const errorEl=$('#error'),benchmarkResultsEl=$('#benchmarkResults'),researchResultsEl=$('#researchResults'),marketLensEl=$('#marketLens'),resultsEl=$('#results'),auditDetails=$('#auditDetails');

let currentLocale='en';

if(new URLSearchParams(location.search).get('demo')==='1')requestEl.value=SAMPLE;

function escapeHtml(value=''){
  return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function decodeEntities(value=''){
  const el=document.createElement('textarea');
  el.innerHTML=String(value);
  return el.value;
}
function list(items,ui){
  const xs=Array.isArray(items)?items:[];
  return xs.length?`<ul>${xs.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>`:`<p class="empty">${escapeHtml(ui.none)}</p>`;
}
function fmt(v,d=2){
  const n=Number(v);
  if(!Number.isFinite(n))return '—';
  return new Intl.NumberFormat(currentLocale==='it'?'it-IT':'en-GB',{maximumFractionDigits:d}).format(n);
}
function blockerText(code,locale){
  if(locale!=='it')return code;
  const m={
    CRITICAL_INPUT_UNDERSPECIFIED:'richiesta troppo poco specifica',
    CRITICAL_REQUEST_CONFLICT:'istruzioni in conflitto',
    CRITICAL_EVAL_GAMING:'tentativo di influenzare il valutatore',
    CRITICAL_CONSTRAINT_RETENTION:'vincoli non mantenuti',
    CRITICAL_VERIFICATION_GAP:'verifica insufficiente',
    WEAK_DEFINITION_OF_DONE:'criteri di completamento deboli'
  };
  return m[code]||code;
}
function integrityNotes(integrity,locale){
  const it=locale==='it',out=[];
  for(const x of integrity?.contradictions||[]){
    const type=x.type;
    if(!it){out.push(x.detail);continue}
    if(type==='ACTION_CONTRADICTION')out.push('La richiesta chiede un’azione esterna e contemporaneamente la vieta.');
    else if(type==='BUDGET_CONTRADICTION')out.push('La richiesta contiene limiti finanziari incompatibili.');
    else if(type==='INTERACTION_CONTRADICTION')out.push('La richiesta richiede e vieta contemporaneamente l’interazione con l’utente.');
    else if(type==='CONSTRAINT_OVERRIDE')out.push('La richiesta tenta di ignorare un vincolo che aveva appena stabilito.');
    else out.push(x.detail);
  }
  if((integrity?.gamingSignals||[]).length)out.push(it?'Rilevato linguaggio diretto a influenzare il valutatore.':'Evaluator-gaming language detected.');
  if(integrity?.status==='NEEDS_CLARIFICATION')out.push(it?'La richiesta è troppo ampia per essere promossa senza chiarimento.':'The request is too vague to promote without clarification.');
  return out;
}
function reasonLines(comparison,locale){
  const it=locale==='it',c=comparison.candidate.total,d=comparison.delta,critical=comparison.candidate.gaps.filter(x=>x.startsWith('CRITICAL_'));
  if(!it)return comparison.reasons;
  const lines=[];
  if(comparison.finality==='PROMOTE'){
    lines.push(`Il candidato supera la soglia di qualità (${c}/100).`);
    lines.push(`Migliora il riferimento di ${d} punti.`);
    lines.push('Non restano blocchi critici.');
  }else if(comparison.finality==='HOLD'){
    lines.push(`Il candidato migliora il riferimento di ${d} punti, ma non supera tutti i gate.`);
    if(c<78)lines.push(`Il punteggio ${c}/100 è sotto la soglia di promozione di 78.`);
    if(d<15)lines.push(`Il miglioramento di ${d} punti è sotto il delta minimo di 15.`);
    if(critical.length)lines.push('Blocchi critici: '+critical.map(x=>blockerText(x,locale)).join(', ')+'.');
  }else{
    lines.push(`Il candidato non mostra un miglioramento misurabile sufficiente (delta ${d}).`);
    if(c<60)lines.push(`La qualità ${c}/100 è sotto la soglia minima di attesa.`);
    if(critical.length)lines.push('Blocchi critici: '+critical.map(x=>blockerText(x,locale)).join(', ')+'.');
  }
  return lines;
}
function planCard(plan,evalResult,kind,ui){
  return `<article class="plan-card ${kind}">
    <div class="plan-head"><div><span class="eyebrow">${escapeHtml(plan.label)}</span><h3>${evalResult.total}/100</h3></div><span class="score-pill">${escapeHtml(ui.wolfScore)}</span></div>
    <section><h4>${escapeHtml(ui.goal)}</h4><p>${escapeHtml(plan.goal)}</p></section>
    <section><h4>${escapeHtml(ui.constraints)}</h4>${list(plan.constraints,ui)}</section>
    <section><h4>${escapeHtml(ui.assumptions)}</h4>${list(plan.assumptions,ui)}</section>
    <section><h4>${escapeHtml(ui.unknowns)}</h4>${list(plan.unknowns,ui)}</section>
    <section><h4>${escapeHtml(ui.definition)}</h4>${list(plan.definitionOfDone,ui)}</section>
    <section><h4>${escapeHtml(ui.plan)}</h4>${list(plan.steps,ui)}</section>
    <section><h4>${escapeHtml(ui.verification)}</h4>${list(plan.verification,ui)}</section>
  </article>`;
}
function metricRows(comparison,locale){
  return Object.keys(comparison.baseline.metrics).map(key=>{
    const b=comparison.baseline.metrics[key],c=comparison.candidate.metrics[key],delta=c-b,cls=delta>0?'positive':delta<0?'negative':'';
    return `<div class="metric-row">
      <div><strong>${escapeHtml(localizeMetricLabel(key,locale))}</strong><small>${b} baseline → ${c} BrainCore</small></div>
      <div class="bar"><i style="width:${b}%"></i><b style="width:${c}%"></b></div>
      <span class="delta ${cls}">${delta>=0?'+':''}${delta}</span>
    </div>`;
  }).join('');
}
async function sha256(value){
  const bytes=new TextEncoder().encode(value);
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function researchPriority(item){
  const s=String(item.source||'').toLowerCase();
  if(s.includes('duck'))return 0;
  if(s.includes('wikipedia'))return 1;
  if(s.includes('wikidata'))return 2;
  if(s.includes('crossref'))return 5;
  if(s.includes('openlibrary'))return 6;
  return 3;
}
function renderResearch(request,research,integrity,p,marketReady){
  const ui=p.catalog.ui,locale=p.responseLocale;
  if(research.status==='NOT_RESEARCH_INTENT'){researchResultsEl.hidden=true;return}
  $('#researchEyebrow').textContent=ui.live;
  $('#researchTitle').textContent=ui.sources||ui.evidence;
  $('#sourceFidelity').textContent=ui.sourceFidelity||'';

  if(research.status==='LIVE_RESEARCH_UNAVAILABLE'){
    $('#researchMeta').textContent='Na0mi V12 · '+ui.unavailable;
    $('#researchIntro').textContent=ui.liveUnavailable;
    $('#researchItems').innerHTML='';
    researchResultsEl.hidden=false;return;
  }

  const clarification=integrity?.status==='NEEDS_CLARIFICATION';
  const sorted=[...(research.results||[])].sort((a,b)=>researchPriority(a)-researchPriority(b));
  let chosen=sorted;
  if(marketReady){
    const nonAcademic=sorted.filter(x=>researchPriority(x)<5);
    chosen=(nonAcademic.length?nonAcademic:sorted).slice(0,4);
  }else chosen=sorted.slice(0,5);

  $('#researchMeta').textContent=`${research.provider||'Na0mi V12'} · ${research.resultCount} ${ui.results}`;
  $('#researchIntro').textContent=clarification?ui.broadResearch:ui.liveOk;
  $('#researchItems').innerHTML=chosen.length?chosen.map(item=>`
    <article class="research-item">
      <div class="research-source">${escapeHtml(item.source)}</div>
      <a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(decodeEntities(item.title))}</a>
      ${item.snippet?`<p>${escapeHtml(decodeEntities(item.snippet))}</p>`:''}
    </article>`).join(''):`<p class="empty">${escapeHtml(ui.noResults)}</p>`;
  researchResultsEl.hidden=false;
}
function renderMarketLens(lens,p){
  const ui=p.catalog.ui,it=p.responseLocale==='it';
  if(!lens||lens.status==='NOT_MARKET_INTENT'){marketLensEl.hidden=true;return}
  $('#marketTitle').textContent=ui.marketLens||'Market Lens';
  $('#marketReadOnly').textContent=ui.readOnly||'READ ONLY';
  $('#marketSummary').textContent=lens.summary||'';
  const cards=lens.cards||[];
  $('#marketCards').innerHTML=cards.map(x=>{
    const cp=Number(x.changePercent),cls=!Number.isFinite(cp)?'flat':cp>0?'up':cp<0?'down':'flat';
    const change=Number.isFinite(cp)?`${cp>=0?'+':''}${fmt(cp,2)}%`:(it?'dato non disponibile':'data unavailable');
    const meta=[x.proxy,x.exchange,x.latestTradingDay].filter(Boolean).join(' · ');
    return `<article class="market-card">
      <div class="market-card-head"><div><h3>${escapeHtml(x.label||x.symbol)}</h3><div class="market-symbol">${escapeHtml(x.symbol||'')}</div></div><span class="market-change ${cls}">${escapeHtml(change)}</span></div>
      <div class="market-price">${x.price==null?'—':escapeHtml(fmt(x.price,4))} <small>${escapeHtml(x.currency||'')}</small></div>
      <small>${escapeHtml(meta||x.status||'')}</small>
    </article>`;
  }).join('');

  const f=lens.focus;
  if(f&&f.observations){
    const o=f.observations;
    $('#marketFocus').innerHTML=`<strong>${it?'Analisi descrittiva':'Descriptive analysis'} · ${escapeHtml(f.symbol)}</strong>
      <div class="market-focus-grid">
        <div><span>${it?'Tendenza':'Trend'}</span><strong>${escapeHtml(o.trend||'—')}</strong></div>
        <div><span>RSI 14</span><strong>${escapeHtml(fmt(o.rsi14,2))}</strong></div>
        <div><span>${it?'Supporto 20':'Support 20'}</span><strong>${escapeHtml(fmt(o.support20,4))}</strong></div>
        <div><span>${it?'Resistenza 20':'Resistance 20'}</span><strong>${escapeHtml(fmt(o.resistance20,4))}</strong></div>
      </div>
      <div class="market-meta">${it?'Analisi descrittiva, non segnale di trading.':'Descriptive analysis, not a trading signal.'}</div>`;
    $('#marketFocus').hidden=false;
  }else{$('#marketFocus').hidden=true;$('#marketFocus').innerHTML=''}

  $('#marketQuestions').innerHTML=(lens.questions||[]).map(q=>`<span class="question-chip">${escapeHtml(q)}</span>`).join('');
  const provider=lens.providerStatus?.provider||lens.source||'Na0mi V12';
  const freshness=lens.providerStatus?.freshness?.quoteDefault||'';
  $('#marketMeta').textContent=[provider,freshness,it?'Nessun ordine preparato o eseguito.':'No order prepared or executed.'].filter(Boolean).join(' · ');
  marketLensEl.hidden=false;
}
function renderAnswer(request,p,lens,research,localizedCandidate){
  const locale=p.responseLocale,it=locale==='it';
  const market=marketAnswer(request,lens,locale);
  let answer=market;
  if(!answer){
    if(research?.status==='LIVE_RESEARCH_COMPLETE')answer=it
      ? `Ho trovato ${research.resultCount} risultati live. Ti mostro prima le fonti più utili e tengo l’audit tecnico separato.`
      : `I found ${research.resultCount} live results. The most useful sources come first and the technical audit stays separate.`;
    else if(p.catalogSupported===false)answer='WOLF detected your language, but this build does not yet have a complete response catalog for it.';
    else answer=it
      ? 'Ho trasformato la richiesta in un piano verificabile. Se manca un dettaglio decisivo te lo segnalo invece di inventarlo.'
      : 'I turned the request into a verifiable plan. If a consequential detail is missing, WOLF surfaces it instead of inventing it.';
  }
  $('#answerText').textContent=answer;
  $('#languageBadge').textContent=`${String(p.detected).toUpperCase()} · ${Math.round((p.confidence||0)*100)}%`;
  $('#answerQuestions').innerHTML=(localizedCandidate.unknowns||[]).slice(0,3).map(x=>`<span class="question-chip">${escapeHtml(x)}</span>`).join('');
}
function applyLocale(p){
  const ui=p.catalog.ui;
  currentLocale=p.responseLocale;
  document.documentElement.lang=currentLocale;
  backBtn.textContent=ui.new;benchmarkBtn.textContent=ui.benchmark;
  $('#planningEyebrow').textContent=ui.planning;
  $('#planningTitle').textContent=ui.sameIntent;
  $('#planningNote').textContent=ui.baselineControl;
  $('#rubricTitle').textContent=ui.rubric;
  $('#rubricNote').textContent=ui.identical;
  $('#finalityEyebrow').textContent=ui.finality;
  $('#promotionTitle').textContent=ui.promotion;
  $('#promotionNote').textContent=ui.promotionNote;
  $('#auditLabel').textContent=ui.openAudit||ui.audit;
}
function renderBenchmark(){
  const rows=runBenchmark(),it=currentLocale==='it';
  const counts=rows.reduce((acc,row)=>{acc[row.finality]=(acc[row.finality]||0)+1;return acc},{});
  $('#benchmarkSummary').innerHTML=`
    <div><span>${it?'Casi':'Cases'}</span><strong>${rows.length}</strong></div>
    <div><span>Promote</span><strong>${counts.PROMOTE||0}</strong></div>
    <div><span>Hold</span><strong>${counts.HOLD||0}</strong></div>
    <div><span>Reject</span><strong>${counts.REJECT||0}</strong></div>`;
  $('#benchmarkRows').innerHTML=rows.map(row=>`
    <div class="benchmark-row">
      <div><strong>${escapeHtml(row.title)}</strong><small>${escapeHtml(row.request)}</small></div>
      <span>${row.baseline} → ${row.candidate}</span>
      <b class="benchmark-finality ${row.finality.toLowerCase()}">${escapeHtml(localizeFinality(row.finality,currentLocale))}</b>
    </div>`).join('');
  benchmarkResultsEl.hidden=false;auditDetails.open=true;
  benchmarkResultsEl.scrollIntoView({behavior:'smooth',block:'start'});
}
async function runEvaluation(){
  const request=requestEl.value.trim();
  errorEl.textContent='';
  const p=perception(request,{browserLanguages:Array.from(navigator.languages||[])});
  if(!request){errorEl.textContent=p.catalog.ui.empty;requestEl.focus();return}
  applyLocale(p);
  runBtn.disabled=true;const previousLabel=runBtn.textContent;runBtn.textContent='…';
  try{
    const [research,lens]=await Promise.all([
      runLiveResearch(request,{depth:'DEEP'}),
      runMarketLens(request,{locale:p.responseLocale})
    ]);
    const plans=buildPlans(request);
    const comparison=comparePlans(plans.baseline,plans.candidate,request);
    const displayBaseline=localizePlan(plans.baseline,p.responseLocale);
    const displayCandidate=localizePlan(plans.candidate,p.responseLocale);
    const ui=p.catalog.ui;
    const receiptCore={
      receiptVersion:'wolf-braincore-receipt/1.1',request,language:p.detected,
      baselineScore:comparison.baseline.total,candidateScore:comparison.candidate.total,delta:comparison.delta,
      finality:comparison.finality,candidateGaps:comparison.candidate.gaps,
      researchStatus:research.status,marketLensStatus:lens.status
    };
    const receiptHash=await sha256(JSON.stringify(receiptCore)),issuedAt=new Date().toISOString(),statusClass=comparison.finality.toLowerCase();

    renderAnswer(request,p,lens,research,displayCandidate);
    renderMarketLens(lens,p);
    renderResearch(request,research,comparison.requestIntegrity,p,lens.status==='MARKET_LENS_READY');

    $('#plans').innerHTML=planCard(displayBaseline,comparison.baseline,'baseline',ui)+planCard(displayCandidate,comparison.candidate,'candidate',ui);
    $('#metrics').innerHTML=metricRows(comparison,p.responseLocale);
    const integrity=comparison.requestIntegrity,notes=integrityNotes(integrity,p.responseLocale);
    $('#decision').innerHTML=`
      <div class="decision-badge ${statusClass}">${escapeHtml(localizeFinality(comparison.finality,p.responseLocale))}</div>
      <div><h3>${escapeHtml(comparison.finality==='PROMOTE'?ui.clears:comparison.finality==='HOLD'?ui.hold:ui.reject)}</h3>
      <p class="integrity-line"><strong>${escapeHtml(ui.integrity)}:</strong> ${escapeHtml(localizeIntegrityStatus(integrity.status,p.responseLocale))} · ${escapeHtml(ui.specificity)} ${integrity.specificity}/100</p>
      ${notes.length?list(notes,ui):''}
      ${list(reasonLines(comparison,p.responseLocale),ui)}</div>`;
    const labels=p.responseLocale==='it'
      ? {hash:'Hash richiesta',base:'Riferimento',brain:'BrainCore',delta:'Delta',final:'Finalità',issued:'Emesso',receipt:'SHA-256 ricevuta'}
      : {hash:'Request hash',base:'Baseline',brain:'BrainCore',delta:'Delta',final:'Finality',issued:'Issued',receipt:'Receipt SHA-256'};
    $('#receipt').innerHTML=`
      <div><span>${labels.hash}</span><code>${(await sha256(request)).slice(0,24)}…</code></div>
      <div><span>${labels.base}</span><strong>${comparison.baseline.total}/100</strong></div>
      <div><span>${labels.brain}</span><strong>${comparison.candidate.total}/100</strong></div>
      <div><span>${labels.delta}</span><strong>${comparison.delta>=0?'+':''}${comparison.delta}</strong></div>
      <div><span>${labels.final}</span><strong>${escapeHtml(localizeFinality(comparison.finality,p.responseLocale))}</strong></div>
      <div><span>${labels.issued}</span><code>${issuedAt}</code></div>
      <div class="receipt-hash"><span>${labels.receipt}</span><code>${receiptHash}</code></div>`;

    benchmarkResultsEl.hidden=true;auditDetails.open=false;
    homeEl.hidden=true;resultsEl.hidden=false;scrollTo({top:0,behavior:'smooth'});
  }finally{runBtn.disabled=false;runBtn.textContent=previousLabel}
}
function newEvaluation(){
  resultsEl.hidden=true;benchmarkResultsEl.hidden=true;researchResultsEl.hidden=true;marketLensEl.hidden=true;auditDetails.open=false;
  homeEl.hidden=false;errorEl.textContent='';requestEl.focus();
}

formEl.addEventListener('submit',e=>{e.preventDefault();runEvaluation()});
benchmarkBtn.addEventListener('click',renderBenchmark);
backBtn.addEventListener('click',newEvaluation);
