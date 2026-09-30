import { buildBaselinePlan } from './braincore.mjs';
import { comparePlans } from './evaluator.mjs';

const fields=['constraints','assumptions','unknowns','definitionOfDone','steps','verification'];

function strings(value){
  if(!Array.isArray(value))return [];
  return value.map(x=>String(x||'').trim()).filter(Boolean);
}

export function normalizeExternalPlan(input={}){
  const goal=String(input.goal||'').trim();
  if(!goal)throw new Error('EXTERNAL_PLAN_GOAL_REQUIRED');
  const plan={
    label:String(input.label||input.source||'External candidate').trim(),
    goal
  };
  for(const field of fields)plan[field]=strings(input[field]);
  return plan;
}

export function evaluateExternalCandidate({request,candidate,baseline,source}={}){
  const req=String(request||'').trim();
  if(!req)throw new Error('REQUEST_REQUIRED');
  const normalizedCandidate=normalizeExternalPlan({...candidate,label:candidate?.label||source||'External candidate'});
  const normalizedBaseline=baseline ? normalizeExternalPlan({...baseline,label:baseline.label||'External baseline'}) : buildBaselinePlan(req);
  const comparison=comparePlans(normalizedBaseline,normalizedCandidate,req);
  return {
    source:String(source||candidate?.source||normalizedCandidate.label),
    request:req,
    candidate:normalizedCandidate,
    comparison,
    contractVersion:'wolf-external-candidate/1.0'
  };
}

export const EXTERNAL_CANDIDATE_FIELDS=['goal',...fields];
