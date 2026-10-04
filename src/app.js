import { buildPlans } from './braincore.mjs';
import { comparePlans, METRIC_LABELS } from './evaluator.mjs';
import { runBenchmark } from './benchmark.mjs';

const SAMPLE='Create an autonomous app that makes money for me with a £100 budget. It should work as independently as possible, never pretend revenue is real without proof, and ask me only when a human decision is genuinely required.';
const SCENARIOS={
  clear:SAMPLE,
  vague:'Build me something useful.',
  conflict:'Publish the pricing page automatically today, but do not take any external action and do not ask me anything.'
};

const $=selector=>document.querySelector(selector);
const homeEl=$('#home');
const resultsEl=$('#results');
const formEl=$('#wolfForm');
const requestEl=$('#request');
const runBtn=$('#run');
const errorEl=$('#error');
const benchmarkEl=$('#benchmarkResults');

if(new URLSearchParams(location.search).get('demo')==='1') requestEl.value=SAMPLE;

function esc(value=''){
  return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function list(items){
  const xs=Array.isArray(items)?items:[];
  return xs.length?'<ul>'+xs.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'<p class="empty">None</p>';
}
function planSection(title,items,open=false){
  return '<details'+(open?' open':'')+'><summary>'+esc(title)+'</summary>'+list(items)+'</details>';
}
function planCard(plan,evaluation,kind){
  return '<article class="plan-card '+kind+'">'+
    '<div class="plan-head"><div><span class="eyebrow">'+esc(plan.label)+'</span><h3>'+evaluation.total+'/100</h3></div><span class="score-pill">WOLF SCORE</span></div>'+
    '<details open><summary>Goal</summary><p>'+esc(plan.goal)+'</p></details>'+
    planSection('Constraints',plan.constraints,true)+
    planSection('Assumptions',plan.assumptions)+
    planSection('Unknowns',plan.unknowns,true)+
    planSection('Definition of done',plan.definitionOfDone,true)+
    planSection('Plan',plan.steps)+
    planSection('Verification',plan.verification,true)+
  '</article>';
}
function metricRows(comparison){
  return Object.keys(comparison.baseline.metrics).map(key=>{
    const b=comparison.baseline.metrics[key];
    const c=comparison.candidate.metrics[key];
    const delta=c-b;
    const cls=delta>0?'positive':delta<0?'negative':'';
    return '<div class="metric-row">'+
      '<div><strong>'+esc(METRIC_LABELS[key]||key)+'</strong><small>'+b+' baseline → '+c+' candidate</small></div>'+
      '<div class="bar"><i style="width:'+b+'%"></i><b style="width:'+c+'%"></b></div>'+
      '<span class="delta '+cls+'">'+(delta>=0?'+':'')+delta+'</span>'+
    '</div>';
  }).join('');
}
function renderQuickResult(plans,comparison){
  const integrity=comparison.requestIntegrity;
  const explicit=Array.isArray(plans.baseline.constraints)?plans.baseline.constraints:[];
  let title='Do not promote';
  const rows=[];

  if(comparison.finality==='PROMOTE'){
    title='Ready to promote';
    rows.push('Request integrity is CLEAR.');
    for(const item of explicit.slice(0,4)) rows.push('Retained: '+item);
    if(!explicit.length) rows.push('Candidate clears the shared quality threshold with no critical blocker.');
  } else if(integrity.status==='NEEDS_CLARIFICATION'){
    title='Request needs clarification';
    rows.push('Specificity is '+integrity.specificity+'/100.');
    rows.push('WOLF will not promote an underspecified request.');
  } else if(integrity.status==='CONFLICTING'){
    title='Resolve the conflict first';
    rows.push('The request contains conflicting instructions.');
    for(const item of integrity.contradictions.slice(0,2)) rows.push(item.detail);
  } else if(comparison.finality==='HOLD'){
    title='Not ready to promote';
    rows.push('The candidate improves, but one or more promotion gates are still unmet.');
  } else {
    rows.push('The candidate does not show enough verified improvement over baseline.');
  }

  $('#quickTitle').textContent=title;
  $('#quickReasons').innerHTML=rows.map(row=>'<div class="quick-reason"><span>✓</span><p>'+esc(row)+'</p></div>').join('');
  resultsEl.dataset.evidence='closed';
  const toggle=$('#evidenceToggle');
  toggle.textContent='View evidence ↓';
  toggle.setAttribute('aria-expanded','false');
}

function verdictCopy(comparison){
  const critical=comparison.candidate.gaps.filter(x=>x.startsWith('CRITICAL_'));
  if(comparison.finality==='PROMOTE'){
    return 'The candidate clears the quality threshold, improves materially on baseline, and leaves no critical integrity or verification gap.';
  }
  if(comparison.finality==='HOLD'){
    return critical.length
      ? 'The candidate scores better, but WOLF refuses promotion because a hard blocker remains: '+critical.join(', ')+'.'
      : 'The candidate improves on baseline, but it does not clear every promotion threshold yet.';
  }
  return 'The candidate does not provide enough measurable improvement to justify promotion.';
}
async function sha256(value){
  const bytes=new TextEncoder().encode(value);
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function renderBenchmark(){
  const rows=runBenchmark();
  const counts=rows.reduce((acc,row)=>{acc[row.finality]=(acc[row.finality]||0)+1;return acc},{});
  $('#benchmarkSummary').innerHTML=
    '<div><span>Cases</span><strong>'+rows.length+'</strong></div>'+
    '<div><span>PROMOTE</span><strong>'+(counts.PROMOTE||0)+'</strong></div>'+
    '<div><span>HOLD</span><strong>'+(counts.HOLD||0)+'</strong></div>'+
    '<div><span>Expectation met</span><strong>'+rows.filter(x=>x.expectationMet).length+'/'+rows.length+'</strong></div>';
  $('#benchmarkRows').innerHTML=rows.map(row=>
    '<div class="benchmark-row">'+
      '<div><strong>'+esc(row.title)+'</strong><small>'+esc(row.request)+'</small></div>'+
      '<span>'+row.baseline+' → '+row.candidate+'</span>'+
      '<b class="benchmark-finality '+row.finality.toLowerCase()+'">'+esc(row.finality)+'</b>'+
    '</div>'
  ).join('');
  benchmarkEl.hidden=false;
  benchmarkEl.scrollIntoView({behavior:'smooth',block:'start'});
}
async function runEvaluation(){
  const request=requestEl.value.trim();
  errorEl.textContent='';
  if(!request){errorEl.textContent='Enter a request first.';requestEl.focus();return;}
  runBtn.disabled=true;
  const previous=runBtn.textContent;
  runBtn.textContent='…';
  try{
    const plans=buildPlans(request);
    const comparison=comparePlans(plans.baseline,plans.candidate,request);
    const statusClass=comparison.finality.toLowerCase();
    const integrity=comparison.requestIntegrity;
    const blockers=comparison.candidate.gaps.length?comparison.candidate.gaps.join(' · '):'None';

    $('#decisionBadge').className='verdict-badge '+statusClass;
    $('#decisionBadge').textContent=comparison.finality;
    $('#decisionTitle').textContent=comparison.finality==='PROMOTE'?'Promote the change':comparison.finality==='HOLD'?'Hold the change':'Reject the change';
    $('#decisionCopy').textContent=verdictCopy(comparison);
    $('#scoreBaseline').textContent=comparison.baseline.total+'/100';
    $('#scoreCandidate').textContent=comparison.candidate.total+'/100';
    $('#scoreDelta').textContent=(comparison.delta>=0?'+':'')+comparison.delta;
    $('#integrityStatus').textContent=integrity.status;
    $('#specificityScore').textContent=integrity.specificity+'/100';
    $('#blockers').textContent=blockers;
    $('#metrics').innerHTML=metricRows(comparison);
    $('#plans').innerHTML=planCard(plans.baseline,comparison.baseline,'baseline')+planCard(plans.candidate,comparison.candidate,'candidate');
    renderQuickResult(plans,comparison);

    const receiptCore={
      receiptVersion:'wolf-braincore-receipt/2.0',
      evaluator:'WOLF BrainCore Evaluator',
      request,
      requestIntegrity:integrity.status,
      baselineScore:comparison.baseline.total,
      candidateScore:comparison.candidate.total,
      delta:comparison.delta,
      finality:comparison.finality,
      candidateGaps:comparison.candidate.gaps
    };
    const receiptHash=await sha256(JSON.stringify(receiptCore));
    const requestHash=await sha256(request);
    $('#receipt').innerHTML=
      '<div><span>Request hash</span><code>'+requestHash.slice(0,24)+'…</code></div>'+
      '<div><span>Baseline</span><strong>'+comparison.baseline.total+'/100</strong></div>'+
      '<div><span>Candidate</span><strong>'+comparison.candidate.total+'/100</strong></div>'+
      '<div><span>Finality</span><strong>'+comparison.finality+'</strong></div>'+
      '<div class="receipt-hash"><span>Evidence receipt · SHA-256</span><code>'+receiptHash+'</code></div>';

    benchmarkEl.hidden=true;
    homeEl.hidden=true;
    resultsEl.hidden=false;
    scrollTo({top:0,behavior:'smooth'});
  }finally{
    runBtn.disabled=false;
    runBtn.textContent=previous;
  }
}
function newEvaluation(){
  resultsEl.hidden=true;
  resultsEl.dataset.evidence='closed';
  benchmarkEl.hidden=true;
  homeEl.hidden=false;
  errorEl.textContent='';
  requestEl.focus();
}

formEl.addEventListener('submit',event=>{event.preventDefault();runEvaluation();});
$('#back').addEventListener('click',newEvaluation);
$('#benchmark').addEventListener('click',()=>{
  resultsEl.dataset.evidence='open';
  const toggle=$('#evidenceToggle');
  toggle.textContent='Hide evidence ↑';
  toggle.setAttribute('aria-expanded','true');
  renderBenchmark();
});
$('#evidenceToggle').addEventListener('click',()=>{
  const open=resultsEl.dataset.evidence==='open';
  resultsEl.dataset.evidence=open?'closed':'open';
  const toggle=$('#evidenceToggle');
  toggle.textContent=open?'View evidence ↓':'Hide evidence ↑';
  toggle.setAttribute('aria-expanded',String(!open));
});
document.querySelectorAll('[data-scenario]').forEach(button=>{
  button.addEventListener('click',()=>{
    requestEl.value=SCENARIOS[button.dataset.scenario]||SAMPLE;
    requestEl.focus();
  });
});
