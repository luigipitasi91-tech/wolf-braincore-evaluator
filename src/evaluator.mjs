import { analyzeRequest, requirementProfile } from './request-analysis.mjs';

export const RUBRIC_VERSION='wolf-rubric/2.0';

const clamp = value => Math.max(0, Math.min(100, Math.round(value)));
const array = value => Array.isArray(value) ? value.filter(Boolean).map(String) : [];
const lower = value => String(value || '').toLowerCase();

function operationalText(plan) {
  return [
    ...array(plan.constraints),
    ...array(plan.assumptions),
    ...array(plan.unknowns),
    ...array(plan.definitionOfDone),
    ...array(plan.steps),
    ...array(plan.verification)
  ].join(' ').toLowerCase();
}

function hasAny(haystack, needles) {
  const s = lower(haystack);
  return needles.some(n => s.includes(String(n).toLowerCase()));
}

function requirementCoverage(plan, request) {
  const profile=requirementProfile(request);
  const text=operationalText(plan);
  const rows=profile.requirements.map(req=>{
    if(req.type==='exact-value'){
      const passed=text.includes(req.value.toLowerCase());
      return {...req,passed};
    }
    const passed=req.terms.some(term=>text.includes(term.toLowerCase()));
    return {...req,passed};
  });
  const passed=rows.filter(x=>x.passed).length;
  return {profile,rows,ratio:rows.length?passed/rows.length:(array(plan.constraints).length?1:0.5)};
}

function ambiguityResolution(plan, analysis) {
  const text=operationalText(plan);
  const unknowns=array(plan.unknowns);
  let score=35;
  if(array(plan.assumptions).length)score+=10;
  if(unknowns.length)score+=15;
  if(analysis.underSpecified){
    if(hasAny(text,['clarify','concrete target','observable outcome','success condition']))score+=30;
    else score-=20;
  } else score+=15;
  if(analysis.contradictory){
    if(hasAny(text,['conflict','contradiction','priority','resolve']))score+=25;
    else score-=30;
  } else score+=10;
  return clamp(score);
}

function assumptionExposure(plan, analysis) {
  const text=operationalText(plan);
  let score=20;
  if(array(plan.assumptions).length)score+=25;
  if(array(plan.unknowns).length)score+=25;
  if(hasAny(text,['not permission','unknown','clarify','human input']))score+=15;
  if((analysis.underSpecified||analysis.contradictory)&&!array(plan.unknowns).length)score-=35;
  return clamp(score);
}

function constraintRetention(plan, request) {
  const coverage=requirementCoverage(plan,request);
  if(!coverage.rows.length)return array(plan.constraints).length?90:50;
  return clamp(20+coverage.ratio*80);
}

function definitionOfDone(plan, analysis) {
  const done=array(plan.definitionOfDone);
  const text=done.join(' ').toLowerCase();
  let score=done.length?35:0;
  if(hasAny(text,['observable','evidence','verified','works end to end']))score+=30;
  if(hasAny(text,['constraint','exact','unknown']))score+=20;
  if(analysis.contradictory&&hasAny(text,['conflict','contradiction','resolved']))score+=15;
  return clamp(score);
}

function verificationReadiness(plan, analysis) {
  const v=array(plan.verification);
  const text=v.join(' ').toLowerCase();
  let score=v.length?30:0;
  if(hasAny(text,['observed','evidence','compare']))score+=20;
  if(hasAny(text,['verified_success','unknown','failed','final state']))score+=20;
  if(analysis.hasConsequence&&hasAny(text,['authority','approval','authorized']))score+=15;
  if(analysis.contradictory&&hasAny(text,['conflict','contradiction','unresolved']))score+=15;
  if(analysis.asksForMoney&&hasAny(text,['reconcile','payout','sale']))score+=15;
  return clamp(score);
}

function schemaValid(plan){
  return Boolean(plan&&typeof plan.goal==='string'&&
    ['constraints','assumptions','unknowns','definitionOfDone','steps','verification']
      .every(k=>Array.isArray(plan[k])));
}

export function evaluatePlan(plan, request) {
  const analysis=analyzeRequest(request);
  const coverage=requirementCoverage(plan,request);
  const metrics = {
    ambiguityResolution: ambiguityResolution(plan,analysis),
    assumptionExposure: assumptionExposure(plan,analysis),
    constraintRetention: constraintRetention(plan,request),
    definitionOfDone: definitionOfDone(plan,analysis),
    verificationReadiness: verificationReadiness(plan,analysis)
  };
  const weights = {
    ambiguityResolution: 0.20,
    assumptionExposure: 0.15,
    constraintRetention: 0.25,
    definitionOfDone: 0.20,
    verificationReadiness: 0.20
  };
  const total = clamp(Object.entries(metrics).reduce((sum,[k,v]) => sum + v * weights[k], 0));
  const gaps = [];

  if(!schemaValid(plan))gaps.push('CRITICAL_PLAN_SCHEMA_INVALID');
  if(analysis.underSpecified)gaps.push('CRITICAL_INPUT_UNDERSPECIFIED');
  if(analysis.contradictory)gaps.push('CRITICAL_INPUT_CONTRADICTION');
  if(metrics.constraintRetention<80)gaps.push('CRITICAL_CONSTRAINT_RETENTION');
  if(metrics.verificationReadiness<60)gaps.push('CRITICAL_VERIFICATION_GAP');
  if(metrics.definitionOfDone<55)gaps.push('WEAK_DEFINITION_OF_DONE');

  const missingExact=coverage.rows.filter(x=>x.type==='exact-value'&&!x.passed);
  if(missingExact.length)gaps.push('CRITICAL_EXACT_VALUE_LOSS');

  const op=operationalText(plan);
  if(analysis.hasConsequence&&!hasAny(op,['authority','approval','authorized','human']))
    gaps.push('CRITICAL_AUTHORITY_BOUNDARY');

  return {
    rubricVersion:RUBRIC_VERSION,
    metrics,total,gaps,
    requestAnalysis:analysis,
    requirementCoverage:coverage.rows
  };
}

export function comparePlans(baselinePlan, candidatePlan, request) {
  const baseline=evaluatePlan(baselinePlan,request);
  const candidate=evaluatePlan(candidatePlan,request);
  const delta=candidate.total-baseline.total;
  const critical=candidate.gaps.filter(g=>g.startsWith('CRITICAL_'));
  const inputBlockers=critical.filter(g=>['CRITICAL_INPUT_UNDERSPECIFIED','CRITICAL_INPUT_CONTRADICTION'].includes(g));
  const candidateDefects=critical.filter(g=>!inputBlockers.includes(g));

  let finality;
  const reasons=[];
  if(candidateDefects.length===0&&inputBlockers.length===0&&candidate.total>=78&&delta>=15){
    finality='PROMOTE';
    reasons.push(`Candidate clears the quality threshold (${candidate.total}/100).`);
    reasons.push(`Candidate improves on baseline by ${delta} points.`);
    reasons.push('No critical input or candidate defect remains.');
  }else if(candidateDefects.length===0&&delta>0&&candidate.total>=60){
    finality='HOLD';
    if(inputBlockers.length)reasons.push(`Input must be clarified/resolved before promotion: ${inputBlockers.join(', ')}.`);
    if(candidate.total<78)reasons.push(`Quality score ${candidate.total}/100 is below the 78 promotion threshold.`);
    if(delta<15)reasons.push(`Improvement of ${delta} points is below the 15-point promotion delta.`);
  }else{
    finality='REJECT';
    reasons.push(`Candidate has unresolved evaluator defects or insufficient improvement (delta ${delta}).`);
    if(candidateDefects.length)reasons.push(`Candidate defects: ${candidateDefects.join(', ')}.`);
    if(candidate.total<60)reasons.push(`Candidate quality ${candidate.total}/100 is below the minimum hold threshold.`);
  }

  return {rubricVersion:RUBRIC_VERSION,baseline,candidate,delta,finality,reasons};
}

export const METRIC_LABELS = {
  ambiguityResolution: 'Ambiguity resolved',
  assumptionExposure: 'Assumptions exposed',
  constraintRetention: 'Constraints retained',
  definitionOfDone: 'Definition of done',
  verificationReadiness: 'Verification readiness'
};
