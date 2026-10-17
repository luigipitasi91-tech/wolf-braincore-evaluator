import { normalizeExternalPlan } from './external-candidate.mjs';
import { comparePlans } from './evaluator.mjs';

export const EXTERNAL_AUDIT_VERSION = 'wolf-external-evidence-audit/1.0';
const PLAN_FIELDS = Object.freeze(['constraints','assumptions','unknowns','definitionOfDone','steps','verification']);
const MAX_REQUEST=4000, MAX_FIELD=700, MAX_ITEMS=30, MAX_CONSTRAINTS=12;

function cleanText(v){
  if(typeof v!=='string')throw new Error('TEXT_FIELD_MUST_BE_STRING');
  return v.normalize('NFKC').replace(/\s+/g,' ').trim();
}
function limitedText(v,limit,code){
  const text=cleanText(v);
  if(!text||text.length>limit)throw new Error(code);
  return text;
}
function validatePlan(raw,side){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error(side+'_PLAN_REQUIRED');
  if(typeof raw.goal!=='string')throw new Error(side+'_GOAL_REQUIRED');
  const data={goal:limitedText(raw.goal,MAX_REQUEST,side+'_GOAL_INVALID')};
  if(raw.label!==undefined)data.label=limitedText(raw.label,80,side+'_LABEL_INVALID');
  for(const field of PLAN_FIELDS){
    if(raw[field]!==undefined && (!Array.isArray(raw[field])||raw[field].length>MAX_ITEMS))throw new Error(side+'_'+field.toUpperCase()+'_INVALID');
    data[field]=(raw[field]||[]).map(x=>limitedText(x,MAX_FIELD,side+'_'+field.toUpperCase()+'_ITEM_INVALID'));
  }
  return normalizeExternalPlan({...data,label:data.label||(side==='BASELINE'?'External baseline':'External candidate')});
}
function searchable(plan){
  return [plan.goal,...PLAN_FIELDS.flatMap(field=>plan[field])].join(' ').normalize('NFKC').toLocaleLowerCase('en-US').replace(/\s+/g,' ');
}
function normalizeRequirements(values){
  if(!Array.isArray(values)||values.length>MAX_CONSTRAINTS)throw new Error('REQUIRED_CONSTRAINTS_INVALID');
  const out=values.map(v=>limitedText(v,180,'REQUIRED_CONSTRAINT_INVALID'));
  const seen=new Set();
  return out.filter(v=>{const key=v.toLocaleLowerCase('en-US');if(seen.has(key))return false;seen.add(key);return true;});
}
/**
 * Evaluate TWO user-provided plans, never synthesize either one in this flow.
 * Expected-constraint checks are LEXICAL only; a literal mention is NOT proof of compliance.
 * Source/provider identity and answer authenticity are unverified.
 */
export function auditExternalPlans({request,baseline,candidate,requiredConstraints,sourceLabels}={}){
  const req=limitedText(request,MAX_REQUEST,'REQUEST_REQUIRED_OR_TOO_LONG');
  const base=validatePlan(baseline,'BASELINE');
  const cand=validatePlan(candidate,'CANDIDATE');
  const requirements=normalizeRequirements(requiredConstraints);
  const evaluation=comparePlans(base,cand,req);
  const corpus=searchable(cand);
  const findings=requirements.map(value=>({
    value,
    presentInCandidate:corpus.includes(value.toLocaleLowerCase('en-US').normalize('NFKC').replace(/\s+/g,' ')),
    check:'LEXICAL_SUBSTRING_ONLY'
  }));
  const blockers=[];
  if(!requirements.length)blockers.push('HUMAN_REQUIRED_CONSTRAINTS_MISSING');
  if(findings.some(f=>!f.presentInCandidate))blockers.push('REQUIRED_CONSTRAINT_NOT_MENTIONED');
  const gate=blockers.length && evaluation.finality==='PROMOTE'?'HOLD':evaluation.finality;
  const providers=(sourceLabels&&typeof sourceLabels==='object'&&!Array.isArray(sourceLabels))?sourceLabels:{};
  const left=typeof providers.baseline==='string'?providers.baseline.slice(0,80):base.label;
  const right=typeof providers.candidate==='string'?providers.candidate.slice(0,80):cand.label;
  return {
    contract:EXTERNAL_AUDIT_VERSION,
    status:'EVALUATED_USER_SUPPLIED_OUTPUTS',
    request:req,baseline:base,candidate:cand,
    providerLabels:{baseline:left,candidate:right},
    providerIdentityVerified:false,
    externalModelsCalled:0,
    independentHumanGroundTruthAvailable:false,
    scientificIntelligenceScore:false,
    rubric:'WOLF_HEURISTIC_FIVE_DIMENSION',
    originalRubricDecision:evaluation.finality,
    verdict:gate,
    humanReviewRequired:true,
    evidence:{
      baselineScore:evaluation.baseline.total,
      candidateScore:evaluation.candidate.total,
      delta:evaluation.delta,
      metrics:evaluation.candidate.metrics,
      rubricBlockers:evaluation.candidate.gaps,
      requiredConstraintChecks:findings,
      externalAuditBlockers:blockers,
      reasons:evaluation.reasons,
      disclosure:'Presence of text is not semantic entailment or proof that a constraint will be honored. Source labels are supplied by the user, not provider-attested.'
    },
    risk:'PROVISIONAL_NOT_A_MODEL_INTELLIGENCE_BENCHMARK',
    externalWrites:false,
    thirdPartyUploads:false
  };
}
