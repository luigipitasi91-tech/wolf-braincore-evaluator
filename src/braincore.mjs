import { analyzeRequest } from './request-analysis.mjs';

function clean(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}
function uniq(values) {
  return [...new Set(values.map(clean).filter(Boolean))];
}
function sentenceGoal(request) {
  const text = clean(request);
  if (text.length <= 180) return text;
  return `${text.slice(0, 177)}…`;
}

export function buildBaselinePlan(rawRequest) {
  const request = clean(rawRequest);
  if (!request) throw new Error('REQUEST_REQUIRED');
  return {
    label: 'Baseline',
    goal: sentenceGoal(request),
    constraints: [],
    assumptions: ['The request is sufficiently specified to start implementation.'],
    unknowns: [],
    definitionOfDone: ['Produce a working result that appears to satisfy the request.'],
    steps: ['Interpret the request.', 'Build the requested result.', 'Return the result.'],
    verification: ['Check that the output was produced.']
  };
}

export function buildBrainCorePlan(rawRequest) {
  const request = clean(rawRequest);
  if (!request) throw new Error('REQUEST_REQUIRED');
  const a = analyzeRequest(request);
  const constraints = [];
  const assumptions = [
    'The literal request is the source of intent; missing details are not permission to invent consequential choices.'
  ];
  const unknowns = [];

  for (const b of a.budgets) constraints.push(`Respect explicit budget/limit ${b.canonical}; do not silently exceed it.`);
  for (const s of a.spends) constraints.push(`Requested spend/cost ${s.canonical} is not authority to spend and must remain inside any applicable limit.`);
  if (a.noSpend) constraints.push('Do not spend or create a payment unless that prohibition is explicitly changed.');
  if (a.noExternal) constraints.push('Do not execute external actions while the no-external-action constraint remains active.');
  if (a.asksForAutonomy) constraints.push('Separate automatable work from actions requiring human identity, consent, approval, or authority.');
  if (a.hasConsequence) constraints.push('Treat consequential side effects as gated; planning is not authority to execute.');
  if (a.asksForMoney) constraints.push('Do not treat forecasts, points, or simulations as verified cash revenue.');
  if (a.asksForEvidence) constraints.push('Preserve evidence and verification as explicit completion criteria.');

  if (a.underSpecified) {
    unknowns.push('What concrete target, user, or observable outcome should define success?');
  }
  if (a.asksForAutonomy) {
    unknowns.push('Which external accounts and actions are already authorized for autonomous use?');
  }
  if (a.asksForMoney) {
    unknowns.push('Which revenue channel can provide independent evidence of a real sale or payout?');
  }
  if (a.hasConsequence) {
    unknowns.push('Which side effects may execute automatically, and which require explicit human approval?');
  }
  if (a.contradictory) {
    constraints.push(...a.contradictions.map(x=>`Conflict detected — do not execute until resolved: ${x.detail}.`));
    unknowns.push('Which conflicting instruction has priority? Resolve the contradiction before any consequential execution.');
  }
  if (!unknowns.length) {
    unknowns.push('What observable evidence would prove the requested outcome is complete?');
  }

  const definitionOfDone = [
    'The requested core outcome works end to end.',
    'Every explicit value and constraint from the request is either preserved or explicitly marked as conflicting.',
    'Unknown consequential details remain UNKNOWN or require human input rather than being fabricated.',
    'Completion is backed by observable evidence rather than by a completion claim alone.'
  ];
  if (a.asksForMoney) {
    definitionOfDone.push('Any claimed earnings are backed by a verified sale or payout event; projections remain labelled as projections.');
  }
  if (a.contradictory) {
    definitionOfDone.push('The detected contradiction is resolved explicitly before any conflicting action is allowed.');
  }

  const steps = [
    'Extract intent, exact values, explicit constraints, and consequential actions.',
    'Separate known facts, assumptions, unresolved unknowns, and contradictory instructions.',
    a.underSpecified ? 'Clarify the concrete target and observable success condition before execution.' : 'Define the smallest end-to-end outcome that proves the core request.',
    a.contradictory ? 'Hold conflicting actions and ask which instruction has priority.' : 'Plan only actions inside the current authority and constraint boundary.',
    'Execute only the smallest safe and authorized slice, if execution is allowed, and collect evidence.',
    'Verify the observed outcome against the definition of done before declaring success.'
  ];

  const verification = [
    'Compare observed output with every definition-of-done item and every exact request value.',
    'Fail closed on missing evidence, unresolved contradictions, or missing authority for consequential actions.',
    'Record a final state: VERIFIED_SUCCESS, PROVISIONAL/UNKNOWN, or FAILED.'
  ];
  if (a.asksForMoney) verification.push('Reconcile claimed revenue with an independently recorded sale or payout event.');

  return {
    label: 'BrainCore candidate',
    goal: sentenceGoal(request),
    constraints: uniq(constraints.length ? constraints : ['Preserve every explicit constraint stated by the user.']),
    assumptions: uniq(assumptions),
    unknowns: uniq(unknowns),
    definitionOfDone: uniq(definitionOfDone),
    steps: uniq(steps),
    verification: uniq(verification)
  };
}

export function buildPlans(request) {
  return { baseline: buildBaselinePlan(request), candidate: buildBrainCorePlan(request) };
}

export const BRAINCORE_PLAN_VERSION='wolf-braincore-plan/2.0';
