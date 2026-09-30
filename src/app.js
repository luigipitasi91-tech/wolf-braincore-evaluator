import { buildPlans } from './braincore.mjs';
import { comparePlans, METRIC_LABELS } from './evaluator.mjs';
import { runBenchmark } from './benchmark.mjs';
import { runLiveResearch, looksItalian } from './live-research.mjs';

const SAMPLE = 'Create an autonomous app that makes money for me with a £100 budget. It should work as independently as possible, never pretend revenue is real without proof, and ask me only when a human decision is genuinely required.';

const $ = sel => document.querySelector(sel);
const homeEl = $('#home');
const formEl = $('#wolfForm');
const requestEl = $('#request');
const runBtn = $('#run');
const backBtn = $('#back');
const benchmarkBtn = $('#benchmark');
const errorEl = $('#error');
const benchmarkResultsEl = $('#benchmarkResults');
const researchResultsEl = $('#researchResults');
const resultsEl = $('#results');

if (new URLSearchParams(location.search).get('demo') === '1') requestEl.value = SAMPLE;

function escapeHtml(value='') {
  return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function list(items) {
  const xs = Array.isArray(items) ? items : [];
  return xs.length ? `<ul>${xs.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>` : '<p class="empty">None captured.</p>';
}

function planCard(plan, evalResult, kind) {
  return `<article class="plan-card ${kind}">
    <div class="plan-head"><div><span class="eyebrow">${escapeHtml(plan.label)}</span><h3>${evalResult.total}/100</h3></div><span class="score-pill">WOLF score</span></div>
    <section><h4>Goal</h4><p>${escapeHtml(plan.goal)}</p></section>
    <section><h4>Constraints</h4>${list(plan.constraints)}</section>
    <section><h4>Assumptions</h4>${list(plan.assumptions)}</section>
    <section><h4>Unknowns</h4>${list(plan.unknowns)}</section>
    <section><h4>Definition of done</h4>${list(plan.definitionOfDone)}</section>
    <section><h4>Plan</h4>${list(plan.steps)}</section>
    <section><h4>Verification</h4>${list(plan.verification)}</section>
  </article>`;
}

function metricRows(comparison) {
  return Object.entries(METRIC_LABELS).map(([key,label])=>{
    const b = comparison.baseline.metrics[key];
    const c = comparison.candidate.metrics[key];
    const delta = c-b;
    const cls = delta > 0 ? 'positive' : delta < 0 ? 'negative' : '';
    return `<div class="metric-row">
      <div><strong>${escapeHtml(label)}</strong><small>${b} baseline → ${c} BrainCore</small></div>
      <div class="bar"><i style="width:${b}%"></i><b style="width:${c}%"></b></div>
      <span class="delta ${cls}">${delta>=0?'+':''}${delta}</span>
    </div>`;
  }).join('');
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
}

function renderBenchmark() {
  const rows = runBenchmark();
  const counts = rows.reduce((acc,row)=>{acc[row.finality]=(acc[row.finality]||0)+1;return acc;},{});
  $('#benchmarkSummary').innerHTML = `
    <div><span>Cases</span><strong>${rows.length}</strong></div>
    <div><span>Promote</span><strong>${counts.PROMOTE||0}</strong></div>
    <div><span>Hold</span><strong>${counts.HOLD||0}</strong></div>
    <div><span>Reject</span><strong>${counts.REJECT||0}</strong></div>`;
  $('#benchmarkRows').innerHTML = rows.map(row=>`
    <div class="benchmark-row">
      <div><strong>${escapeHtml(row.title)}</strong><small>${escapeHtml(row.request)}</small></div>
      <span>${row.baseline} → ${row.candidate}</span>
      <b class="benchmark-finality ${row.finality.toLowerCase()}">${row.finality}</b>
    </div>`).join('');
  benchmarkResultsEl.hidden = false;
  benchmarkResultsEl.scrollIntoView({behavior:'smooth',block:'start'});
}

function renderResearch(request,research,integrity){
  if(research.status==='NOT_RESEARCH_INTENT'){
    researchResultsEl.hidden=true;
    return;
  }
  const it=looksItalian(request);
  $('#researchEyebrow').textContent=it?'Ricerca live':'Live research';
  $('#researchTitle').textContent=it?'Evidenza trovata':'Research evidence';

  if(research.status==='LIVE_RESEARCH_UNAVAILABLE'){
    $('#researchMeta').textContent='Na0mi V12 · unavailable';
    $('#researchIntro').textContent=it
      ? 'La ricerca live non è disponibile in questo momento. WOLF non inventa risultati: sotto trovi solo l’audit della richiesta.'
      : 'Live research is unavailable right now. WOLF does not fabricate results; only the request audit is shown below.';
    $('#researchItems').innerHTML='';
    researchResultsEl.hidden=false;
    return;
  }

  const clarification=integrity?.status==='NEEDS_CLARIFICATION';
  $('#researchMeta').textContent=`${research.provider||'Na0mi V12'} · ${research.resultCount} ${it?'risultati':'results'}`;
  $('#researchIntro').textContent=clarification
    ? (it
      ? 'La richiesta è ampia: WOLF non sceglie automaticamente un mercato senza criteri come Paese, rischio e orizzonte. Intanto questa è una ricerca live iniziale.'
      : 'The request is broad: WOLF will not choose a market automatically without criteria such as region, risk and horizon. Here is a live research starter.')
    : (it
      ? 'Risultati live recuperati da Na0mi V12. Sono evidenza provvisoria: apri le fonti prima di trattare una conclusione come verificata.'
      : 'Live results retrieved by Na0mi V12. They are provisional evidence; open the sources before treating a conclusion as verified.');

  $('#researchItems').innerHTML=(research.results||[]).length
    ? research.results.map(item=>`
      <article class="research-item">
        <div class="research-source">${escapeHtml(item.source)}</div>
        <a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a>
        ${item.snippet?`<p>${escapeHtml(item.snippet)}</p>`:''}
      </article>`).join('')
    : `<p class="empty">${it?'Nessun risultato live trovato.':'No live results found.'}</p>`;
  researchResultsEl.hidden=false;
}

async function runEvaluation() {
  const request = requestEl.value.trim();
  errorEl.textContent = '';
  if (!request) {
    errorEl.textContent = 'Write a request first.';
    requestEl.focus();
    return;
  }

  runBtn.disabled = true;
  const previousLabel=runBtn.textContent;
  runBtn.textContent='…';
  try {
    const researchPromise=runLiveResearch(request,{depth:'DEEP'});
    const plans = buildPlans(request);
    const comparison = comparePlans(plans.baseline, plans.candidate, request);
    const research = await researchPromise;
    const receiptCore = {
      receiptVersion:'wolf-braincore-receipt/1.0',
      request,
      baselineScore:comparison.baseline.total,
      candidateScore:comparison.candidate.total,
      delta:comparison.delta,
      finality:comparison.finality,
      candidateGaps:comparison.candidate.gaps,
      reasons:comparison.reasons
    };
    const receiptHash = await sha256(JSON.stringify(receiptCore));
    const issuedAt = new Date().toISOString();
    const statusClass = comparison.finality.toLowerCase();

    renderResearch(request,research,comparison.requestIntegrity);
    $('#plans').innerHTML = planCard(plans.baseline, comparison.baseline, 'baseline') + planCard(plans.candidate, comparison.candidate, 'candidate');
    $('#metrics').innerHTML = metricRows(comparison);
    const integrity = comparison.requestIntegrity;
    const integrityNotes = [
      ...integrity.contradictions.map(x=>x.detail),
      ...(integrity.gamingSignals.length ? ['Evaluator-gaming language detected.'] : []),
      ...(integrity.status==='NEEDS_CLARIFICATION' ? ['The request is too vague to promote without clarification.'] : [])
    ];
    $('#decision').innerHTML = `
      <div class="decision-badge ${statusClass}">${comparison.finality}</div>
      <div><h3>${comparison.finality === 'PROMOTE' ? 'Candidate clears the gate' : comparison.finality === 'HOLD' ? 'Improvement exists, evidence is not enough' : 'Candidate does not clear the gate'}</h3>
      <p class="integrity-line"><strong>Request integrity:</strong> ${escapeHtml(integrity.status)} · specificity ${integrity.specificity}/100</p>
      ${integrityNotes.length ? list(integrityNotes) : ''}
      ${list(comparison.reasons)}</div>`;
    $('#receipt').innerHTML = `
      <div><span>Request hash</span><code>${(await sha256(request)).slice(0,24)}…</code></div>
      <div><span>Baseline</span><strong>${comparison.baseline.total}/100</strong></div>
      <div><span>BrainCore</span><strong>${comparison.candidate.total}/100</strong></div>
      <div><span>Delta</span><strong>${comparison.delta>=0?'+':''}${comparison.delta}</strong></div>
      <div><span>Finality</span><strong>${comparison.finality}</strong></div>
      <div><span>Issued</span><code>${issuedAt}</code></div>
      <div class="receipt-hash"><span>Receipt SHA-256</span><code>${receiptHash}</code></div>`;

    benchmarkResultsEl.hidden = true;
    homeEl.hidden = true;
    resultsEl.hidden = false;
    scrollTo({top:0,behavior:'smooth'});
  } finally {
    runBtn.disabled = false;
    runBtn.textContent=previousLabel;
  }
}

function newEvaluation() {
  resultsEl.hidden = true;
  benchmarkResultsEl.hidden = true;
  researchResultsEl.hidden = true;
  homeEl.hidden = false;
  errorEl.textContent = '';
  requestEl.focus();
}

formEl.addEventListener('submit', e=>{ e.preventDefault(); runEvaluation(); });
benchmarkBtn.addEventListener('click', renderBenchmark);
backBtn.addEventListener('click', newEvaluation);
