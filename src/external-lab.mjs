import {evaluateExternalCandidate,EXTERNAL_CANDIDATE_FIELDS} from './external-candidate.mjs';

const MAX_REQUEST=4000;
const MAX_SOURCE=80;
const MAX_ITEMS=20;
const MAX_ITEM_LENGTH=1200;
const MAX_TOTAL=40000;
const sections=EXTERNAL_CANDIDATE_FIELDS.filter(x=>x!=='goal');

function parsePlan(raw,label){
  let obj=raw;
  if(typeof raw==='string'){
    if(raw.length>MAX_TOTAL)throw Error(label+'_JSON_TOO_LONG');
    try{obj=JSON.parse(raw);}catch{throw Error(label+'_INVALID_JSON')}
  }
  if(!obj||typeof obj!=='object'||Array.isArray(obj))throw Error(label+'_MUST_BE_OBJECT');
  if(typeof obj.goal!=='string'||!obj.goal.trim()||obj.goal.length>MAX_ITEM_LENGTH)throw Error(label+'_GOAL_REQUIRED_OR_INVALID');
  const plan={goal:obj.goal.trim()};
  for(const field of sections){
    const entries=obj[field]??[];
    if(!Array.isArray(entries)||entries.length>MAX_ITEMS||entries.some(x=>typeof x!=='string'||x.length>MAX_ITEM_LENGTH))
      throw Error(label+'_INVALID_'+field.toUpperCase());
    plan[field]=entries.map(x=>x.trim()).filter(Boolean);
  }
  return plan;
}
export function runExternalCandidateLab({request,source,candidate,baseline=null}={}){
  if(typeof request!=='string'||!request.trim()||request.length>MAX_REQUEST)throw Error('REQUEST_REQUIRED_OR_TOO_LONG');
  if(typeof source!=='string'||!source.trim()||source.length>MAX_SOURCE)throw Error('SOURCE_REQUIRED_OR_TOO_LONG');
  const plan=parsePlan(candidate,'CANDIDATE');
  const ref=baseline===null||baseline===''?undefined:parsePlan(baseline,'BASELINE');
  const result=evaluateExternalCandidate({request:request.trim(),source:source.trim(),candidate:plan,baseline:ref});
  return {
    contractVersion:'wolf-external-lab/0.1',
    evaluatorContract:result.contractVersion,
    source:result.source,
    request:result.request,
    inputs:{candidate:result.candidate,baseline:ref?'USER_SUPPLIED':'INTERNAL_REFERENCE'},
    comparison:result.comparison,
    assurance:{
      label:'UNCALIBRATED_HEURISTIC_PLAN_QUALITY_ONLY',
      externalModelActuallyCalled:false,
      userSuppliedCandidate:true,
      blindedIndependentGroundTruth:false,
      modelIntelligenceMeasured:false,
      realWorldExecutionVerified:false,
      objectiveRanking:false,
      externalWrites:false,
      caution:'PROMOTE means this structured plan passed WOLF internal heuristic, not that an external model is objectively smarter or production-safe.'
    }
  };
}
