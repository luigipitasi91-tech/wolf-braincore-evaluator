import { analyzeRequest } from './request-integrity.mjs';
import { analyzeDomainPacks } from './domain-packs.mjs';
import { learningSkillContract } from './learning-skills.mjs';

const moneyPattern = /(?:£|\$|€)\s?\d+(?:[.,]\d+)?|\b\d+(?:[.,]\d+)?\s?(?:pounds?|gbp|dollars?|usd|euros?|eur)\b/gi;

function clean(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function uniq(values) {
  return [...new Set(values.map(clean).filter(Boolean))];
}

function contains(text, pattern) {
  return pattern.test(text.toLowerCase());
}

export function extractExplicitConstraints(rawRequest) {
  const request = clean(rawRequest);
  const constraints = [];
  const money = request.match(moneyPattern) || [];
  if (money.length) constraints.push(`Financial bound explicitly stated: ${money.join(', ')}.`);

  const location = request.match(/\b(?:in|near|within)\s+([A-Z][A-Za-z'’-]+(?:\s+[A-Z][A-Za-z'’-]+){0,2})(?=\s+(?:under|with|and|that|which|for)\b|[,.;!?]|$)/);
  if (location) constraints.push(`Location explicitly stated: ${location[1]}.`);

  const outputMatch = request.match(/\b(?:show|shows|include|includes|display|return|provide|provides)\s+([^.!?]{1,140})/i);
  if (outputMatch) {
    const output = clean(outputMatch[1].split(/,?\s+and\s+(?=never|do not|don't|must not)/i)[0]);
    if (output) constraints.push(`Required output explicitly stated: ${output}.`);
  }

  const prohibitions = [...request.matchAll(/\b(never|do not|don't|must not)\s+([^.!?]{1,120})/gi)];
  for (const match of prohibitions) constraints.push(`Explicit prohibition: ${clean(match[1] + ' ' + match[2])}.`);

  return uniq(constraints);
}

function extractSignals(request) {
  const lower = request.toLowerCase();
  const money = request.match(moneyPattern) || [];
  const constraints = [];
  if (money.length) constraints.push(`Respect explicit financial bound(s): ${money.join(', ')}.`);
  if (/\b(no|without)\s+(?:spend|spending|cost|pay|payment)/i.test(request) || /\b£0\b/.test(request)) {
    constraints.push('Do not require upfront spend unless explicitly authorized.');
  }
  if (/\bautonom\w*|100\s*%|fully automatic|automaticamente|autonomo/i.test(request)) {
    constraints.push('Separate actions that can be automated from actions requiring human identity, consent, or authorization.');
  }
  if (/\b(send|submit|publish|manda|invia|compra|buy|trade|trading|pay|spend)\b/i.test(request)) {
    constraints.push('Treat external side effects as consequential and require an explicit authority boundary.');
  }
  if (/\bprofit|revenue|earn|earning|money|guadagn|soldi|profitto|ricav/i.test(request)) {
    constraints.push('Do not treat forecasts, points, or simulated returns as verified cash revenue.');
  }
  if (/\bverify|verified|proof|evidence|prova|verifica/i.test(request)) {
    constraints.push('Preserve evidence and verification as explicit completion criteria.');
  }
  return {
    money: uniq(money),
    constraints: uniq(constraints),
    asksForAutonomy: /\bautonom\w*|100\s*%|fully automatic|automaticamente/i.test(lower),
    asksForMoney: /\bprofit|revenue|earn|money|guadagn|soldi|profitto|ricav/i.test(lower),
    hasConsequence: /\b(send|submit|publish|manda|invia|compra|buy|trade|trading|pay|spend)\b/i.test(lower)
  };
}

function sentenceGoal(request) {
  const text = clean(request);
  if (text.length <= 180) return text;
  return `${text.slice(0, 177)}…`;
}

export function buildBaselinePlan(rawRequest) {
  const request = clean(rawRequest);
  if (!request) throw new Error('REQUEST_REQUIRED');
  const explicitConstraints = extractExplicitConstraints(request);
  return {
    label: 'Baseline',
    goal: sentenceGoal(request),
    constraints: explicitConstraints,
    assumptions: ['The request is sufficiently specified to start implementation.'],
    unknowns: [],
    definitionOfDone: ['Produce a working result that appears to satisfy the request.'],
    steps: ['Interpret the request.', 'Build the requested result.', 'Return the result.'],
    verification: ['Check that the output was produced.']
  };
}

export function buildBrainCorePlan(rawRequest, options = {}) {
  const request = clean(rawRequest);
  if (!request) throw new Error('REQUEST_REQUIRED');
  const signals = extractSignals(request);
  const integrity = analyzeRequest(request);
  const domain = analyzeDomainPacks(request);
  const learning = learningSkillContract(options.learningSkill, request, { locale: options.locale });
  const explicitConstraints = extractExplicitConstraints(request);
  const constraints = [...explicitConstraints, ...signals.constraints, ...domain.constraints, ...learning.constraints];
  if (integrity.status === 'CONFLICTING') constraints.push('Do not resolve contradictory instructions by silently choosing one side; require clarification or explicit precedence.');
  if (integrity.gamingSignals.length) constraints.push('Evaluator-directed wording or repeated rubric keywords do not override the user’s substantive constraints.');
  const assumptions = [
    'The literal request is the source of intent; missing details are not permission to invent consequential choices.'
  ];
  const unknowns = [...domain.unknowns, ...learning.unknowns];

  if (signals.asksForAutonomy) {
    unknowns.push('Which external accounts/actions are already authorized for autonomous use?');
  }
  if (signals.asksForMoney) {
    unknowns.push('Which revenue channel will provide independent evidence of a real payout or verified sale?');
  }
  if (!signals.money.length && signals.asksForMoney) {
    unknowns.push('What financial ceiling or risk budget applies?');
  }
  if (signals.hasConsequence) {
    unknowns.push('Which side effects may execute automatically, and which require a human approval gate?');
  }
  if (integrity.status === 'NEEDS_CLARIFICATION') {
    unknowns.push('What concrete artifact or outcome is actually wanted, and what observable result would make it useful?');
  }
  for (const conflict of integrity.contradictions) {
    unknowns.push('Request conflict to resolve: ' + conflict.detail);
  }
  if (!unknowns.length) {
    unknowns.push('What single observable outcome would prove the request is complete?');
  }

  const definitionOfDone = [
    ...learning.definitionOfDone,
    'The requested core outcome works end to end.',
    'All explicit constraints from the request are retained in the plan.',
    'Unknown consequential details remain UNKNOWN or require human input rather than being fabricated.',
    'Completion is backed by observable evidence rather than by a completion claim alone.'
  ];
  if (signals.asksForMoney) {
    definitionOfDone.push('Any claimed earnings are backed by a verified sale/payout event; projections and simulations remain labelled as such.');
  }

  const steps = [
    'Extract intent, explicit constraints, and consequential actions.',
    'Separate known facts, assumptions, and unresolved unknowns.',
    'Define the smallest end-to-end outcome that proves the core request.',
    'Plan only actions inside the current authority and budget boundary.',
    'Execute the smallest safe slice and collect evidence.',
    'Verify the observed outcome against the definition of done before declaring success.'
  ];

  const verification = [
    'Compare observed output with every definition-of-done item.',
    'Fail closed on missing evidence for consequential actions.',
    'Record a final state: VERIFIED_SUCCESS, PROVISIONAL/UNKNOWN, or FAILED.',
    ...domain.verification,
    ...learning.verification
  ];
  if (signals.asksForMoney) {
    verification.push('Reconcile claimed revenue with an independently recorded sale/payout event.');
  }

  return {
    label: 'BrainCore candidate',
    goal: sentenceGoal(request),
    constraints: uniq(constraints.length ? constraints : ['Preserve every explicit constraint stated by the user.']),
    assumptions: uniq(assumptions),
    unknowns: uniq(unknowns),
    definitionOfDone: uniq(definitionOfDone),
    steps: uniq(steps),
    verification: uniq(verification),
    requestIntegrity: integrity,
    domainPacks: [...domain.domains, ...learning.domains]
  };
}

export function buildPlans(request, options = {}) {
  return { baseline: buildBaselinePlan(request), candidate: buildBrainCorePlan(request, options) };
}
