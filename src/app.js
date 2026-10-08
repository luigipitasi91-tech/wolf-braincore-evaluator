import { buildPlans } from './braincore.mjs';
import { comparePlans, METRIC_LABELS } from './evaluator.mjs';
import { runBenchmark } from './benchmark.mjs';
import { getLearningSkill, learningSkillLabel, normalizeLearningLocale } from './learning-skills.mjs';

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
const discoveryEl=$('#discoveryPanel');
const pageParams=new URLSearchParams(location.search);
const isJudgeDemo=pageParams.get('demo')==='1';
// The competition demo is a fixed, provider-neutral evaluator; URL skill overrides must not enter its rubric.
let activeLearningSkill=isJudgeDemo?'':(getLearningSkill(pageParams.get('skill'))?.id||'');
const activeLearningLocale=normalizeLearningLocale(pageParams.get('lang')||navigator.language||'en');

if(pageParams.get('request')) requestEl.value=pageParams.get('request');
else if(isJudgeDemo) requestEl.value=SAMPLE;
if(isJudgeDemo&&$('#learningSkillsLink')) $('#learningSkillsLink').hidden=true;

function esc(value=''){
  return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function safeHref(value=''){
  try{
    const url=new URL(String(value));
    return ['http:','https:'].includes(url.protocol)?url.href:'#';
  }catch{return '#';}
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
function resetEvidence(){
  resultsEl.dataset.evidence='closed';
  const toggle=$('#evidenceToggle');
  toggle.textContent='View evidence ↓';
  toggle.setAttribute('aria-expanded','false');
}
function renderQuickResult(plans,comparison){
  const integrity=comparison.requestIntegrity;
  const explicit=Array.isArray(plans.baseline.constraints)?plans.baseline.constraints:[];
  const statusClass=comparison.finality.toLowerCase();
  const critical=comparison.candidate.gaps.filter(x=>x.startsWith('CRITICAL_'));
  const rows=[];
  let title='Do not promote';

  $('#quickBadge').className='verdict-badge '+statusClass;
  $('#quickBadge').textContent=comparison.finality;

  if(comparison.finality==='PROMOTE'){
    title='Ready to promote';
    rows.push('The change cleared every promotion gate.');
    for(const item of explicit.slice(0,3)) rows.push(item);
    if(!explicit.length) rows.push('No critical integrity or verification blocker remains.');
  } else if(integrity.status==='CONFLICTING'){
    title='Resolve the conflict first';
    rows.push('WOLF found instructions that cannot safely be satisfied together.');
    for(const item of integrity.contradictions.slice(0,2)) rows.push(item.detail);
  } else if(comparison.finality==='HOLD'){
    title='Not ready to promote';
    rows.push('The candidate improves, but at least one promotion gate is still unmet.');
  } else {
    title='Reject this change';
    rows.push('The candidate does not show enough verified improvement over the baseline.');
  }

  $('#quickTitle').textContent=title;
  const skillMeta=activeLearningSkill?'<span>Learning skill · '+esc(learningSkillLabel(activeLearningSkill,activeLearningLocale))+'</span>':'';
  $('#quickMeta').innerHTML=
    '<span>'+(comparison.delta>=0?'+':'')+comparison.delta+' improvement</span>'+
    '<span>'+critical.length+' critical blocker'+(critical.length===1?'':'s')+'</span>'+skillMeta;
  $('#quickReasons').innerHTML=rows.map(row=>'<div class="quick-reason"><span>✓</span><p>'+esc(row)+'</p></div>').join('');
  resultsEl.dataset.mode='evaluation';
  discoveryEl.hidden=true;
  $('#quickResult').hidden=false;
  $('#benchmark').hidden=false;
  resetEvidence();
}
function renderWebResults(results){
  const section=$('#webSection');
  const root=$('#webResults');
  const items=Array.isArray(results)?results:[];
  if(!items.length){
    section.hidden=true;
    root.innerHTML='';
    return;
  }
  root.innerHTML=items.map(item=>{
    const href=safeHref(item.url);
    return '<a class="web-result" href="'+esc(href)+'" target="_blank" rel="noopener noreferrer">'+
      '<small>'+esc(item.domain||'source')+'</small>'+
      '<h3>'+esc(item.title)+'</h3>'+
      '<p>'+esc(item.description||'Open source result')+'</p>'+
    '</a>';
  }).join('');
  section.hidden=false;
}
function renderVisualResults(results){
  const section=$('#visualSection');
  const root=$('#visualResults');
  const items=Array.isArray(results)?results:[];
  if(!items.length){
    section.hidden=true;
    root.innerHTML='';
    return;
  }
  root.innerHTML=items.map(item=>{
    const source=safeHref(item.sourceUrl);
    const license=safeHref(item.licenseUrl);
    const image=safeHref(item.thumbnail);
    return '<article class="visual-card">'+
      '<a class="visual-image" href="'+esc(source)+'" target="_blank" rel="noopener noreferrer">'+
        '<img src="'+esc(image)+'" alt="'+esc(item.title||'Openverse image')+'" loading="lazy" referrerpolicy="no-referrer">'+
      '</a>'+
      '<div><strong>'+esc(item.title||'Untitled')+'</strong>'+
      '<small>'+esc(item.creator||'Unknown creator')+' · '+esc(item.license||'license')+'</small>'+
      '<div class="visual-links"><a href="'+esc(source)+'" target="_blank" rel="noopener noreferrer">Source</a><a href="'+esc(license)+'" target="_blank" rel="noopener noreferrer">License</a></div></div>'+
    '</article>';
  }).join('');
  section.hidden=false;
}
function discoveryFallback(query){
  const href='https://search.brave.com/search?q='+encodeURIComponent(query);
  return 'Live web results are not enabled yet. <a href="'+esc(href)+'" target="_blank" rel="noopener noreferrer">Search this on Brave ↗</a>';
}
async function renderDiscovery(request,comparison){
  resultsEl.dataset.mode='discovery';
  resetEvidence();
  $('#quickResult').hidden=true;
  discoveryEl.hidden=false;
  $('#benchmark').hidden=true;
  $('#discoveryTitle').textContent='Let’s clarify “'+request+'”';
  $('#discoveryQuery').textContent=request;
  $('#discoveryCopy').textContent='WOLF paused the promotion decision because this input is too open-ended. Here is context that can help turn it into a request worth evaluating.';
  $('#discoveryStatus').textContent='Looking for useful context…';
  $('#webSection').hidden=true;
  $('#visualSection').hidden=true;
  $('#webResults').innerHTML='';
  $('#visualResults').innerHTML='';
  $('#clarifyRequest').value='Research '+request+' and return the most relevant sources without inventing facts.';

  try{
    const { discoverQuery }=await import('./discovery.mjs');
    const data=await discoverQuery(request);
    renderWebResults(data.webResults);
    renderVisualResults(data.visuals);
    $('#webProvider').textContent=data.webEnabled?'Brave Search':'Brave Search · not connected';
    const hasWeb=Array.isArray(data.webResults)&&data.webResults.length>0;
    const hasVisuals=Array.isArray(data.visuals)&&data.visuals.length>0;
    if(hasWeb||hasVisuals){
      $('#discoveryStatus').innerHTML=data.webEnabled
        ? 'Live context found. Pick a source, or rewrite the request below.'
        : 'Openly licensed visual context found. '+discoveryFallback(request);
    }else{
      $('#discoveryStatus').innerHTML=discoveryFallback(request);
    }
  }catch{
    $('#discoveryStatus').innerHTML=discoveryFallback(request);
  }

  const integrity=comparison.requestIntegrity;
  $('#clarifyRequest').setAttribute('aria-description','Current specificity '+integrity.specificity+'/100. Add a concrete action or outcome before evaluation.');
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
    const plans=buildPlans(request,{learningSkill:activeLearningSkill,locale:activeLearningLocale});
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

    const receiptCore={
      receiptVersion:'wolf-braincore-receipt/2.0',
      evaluator:'WOLF BrainCore Evaluator',
      request,
      requestIntegrity:integrity.status,
      baselineScore:comparison.baseline.total,
      candidateScore:comparison.candidate.total,
      delta:comparison.delta,
      finality:comparison.finality,
      candidateGaps:comparison.candidate.gaps,
      learningSkill:activeLearningSkill||null
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
    if(integrity.status==='NEEDS_CLARIFICATION'){
      await renderDiscovery(request,comparison);
    }else{
      renderQuickResult(plans,comparison);
    }
    scrollTo({top:0,behavior:'smooth'});
  }finally{
    runBtn.disabled=false;
    runBtn.textContent=previous;
  }
}
function newEvaluation(){
  resultsEl.hidden=true;
  resultsEl.dataset.evidence='closed';
  resultsEl.dataset.mode='evaluation';
  benchmarkEl.hidden=true;
  discoveryEl.hidden=true;
  $('#quickResult').hidden=false;
  $('#benchmark').hidden=false;
  homeEl.hidden=false;
  errorEl.textContent='';
  requestEl.focus();
}

formEl.addEventListener('submit',event=>{event.preventDefault();runEvaluation();});
$('#clarifyForm').addEventListener('submit',event=>{
  event.preventDefault();
  const clarified=$('#clarifyRequest').value.trim();
  if(!clarified)return;
  requestEl.value=clarified;
  runEvaluation();
});
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
    activeLearningSkill='';
    requestEl.value=SCENARIOS[button.dataset.scenario]||SAMPLE;
    requestEl.focus();
  });
});
