const clamp = value => Math.max(0, Math.min(100, Math.round(value)));
const array = value => Array.isArray(value) ? value.filter(Boolean) : [];
const text = value => String(value || '').toLowerCase();

function hasAny(haystack, needles) {
  const s = text(haystack);
  return needles.some(n => s.includes(n));
}

function joined(plan) {
  return [
    plan.goal,
    ...array(plan.constraints),
    ...array(plan.assumptions),
    ...array(plan.unknowns),
    ...array(plan.definitionOfDone),
    ...array(plan.steps),
    ...array(plan.verification)
  ].join(' ');
}

function ambiguityResolution(plan) {
  const u = array(plan.unknowns);
  const a = array(plan.assumptions);
  const structured = ['goal','constraints','assumptions','unknowns','definitionOfDone','steps','verification']
    .filter(k => k === 'goal' ? Boolean(plan[k]) : array(plan[k]).length > 0).length;
  let score = 30 + structured * 6;
  if (u.length) score += 16;
  if (a.length) score += 8;
  if (hasAny(joined(plan), ['unknown', 'not permission', 'missing'])) score += 5;
  return clamp(score);
}

function assumptionExposure(plan) {
  const assumptions = array(plan.assumptions);
  const unknowns = array(plan.unknowns);
  let score = assumptions.length * 20 + unknowns.length * 12;
  if (hasAny(joined(plan), ['rather than', 'not ', 'unknown'])) score += 15;
  return clamp(score);
}

function constraintRetention(plan, request) {
  const planText = joined(plan);
  const req = text(request);
  const signals = [
    { test: /£|\$|€|\bgbp\b|\busd\b|\beur\b|\bpounds?\b/, words: ['financial', 'budget', 'bound', 'spend', 'cost'] },
    { test: /autonom|automatic|100\s*%/, words: ['autonom', 'human', 'authorization', 'authority'] },
    { test: /profit|revenue|earn|money|guadagn|soldi|ricav/, words: ['revenue', 'earn', 'sale', 'payout', 'cash'] },
    { test: /send|submit|publish|manda|invia|buy|compra|trade|pay|spend/, words: ['authority', 'approval', 'consequential', 'side effect'] },
    { test: /verify|proof|evidence|prova|verifica/, words: ['verify', 'evidence', 'proof'] }
  ];
  const active = signals.filter(s => s.test.test(req));
  if (!active.length) return array(plan.constraints).length ? 90 : 55;
  const hits = active.filter(s => s.words.some(w => planText.includes(w))).length;
  return clamp(30 + (hits / active.length) * 70);
}

function definitionOfDone(plan) {
  const done = array(plan.definitionOfDone);
  let score = done.length * 16;
  const d = done.join(' ').toLowerCase();
  if (hasAny(d, ['observable', 'evidence', 'verified', 'works end to end'])) score += 22;
  if (hasAny(d, ['constraint', 'unknown'])) score += 10;
  return clamp(score);
}

function verificationReadiness(plan) {
  const v = array(plan.verification);
  let score = v.length * 20;
  const s = v.join(' ').toLowerCase();
  if (hasAny(s, ['observed', 'evidence'])) score += 15;
  if (hasAny(s, ['verified_success', 'unknown', 'failed', 'final state'])) score += 20;
  if (hasAny(s, ['independent', 'reconcile', 'payout', 'sale'])) score += 15;
  return clamp(score);
}

export function evaluatePlan(plan, request) {
  const metrics = {
    ambiguityResolution: ambiguityResolution(plan),
    assumptionExposure: assumptionExposure(plan),
    constraintRetention: constraintRetention(plan, request),
    definitionOfDone: definitionOfDone(plan),
    verificationReadiness: verificationReadiness(plan)
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
  if (metrics.constraintRetention < 65) gaps.push('CRITICAL_CONSTRAINT_RETENTION');
  if (metrics.verificationReadiness < 60) gaps.push('CRITICAL_VERIFICATION_GAP');
  if (metrics.definitionOfDone < 55) gaps.push('WEAK_DEFINITION_OF_DONE');
  return { metrics, total, gaps };
}

export function comparePlans(baselinePlan, candidatePlan, request) {
  const baseline = evaluatePlan(baselinePlan, request);
  const candidate = evaluatePlan(candidatePlan, request);
  const delta = candidate.total - baseline.total;
  const critical = candidate.gaps.filter(g => g.startsWith('CRITICAL_'));

  let finality;
  const reasons = [];
  if (candidate.total >= 78 && delta >= 15 && critical.length === 0) {
    finality = 'PROMOTE';
    reasons.push(`Candidate clears the quality threshold (${candidate.total}/100).`);
    reasons.push(`Candidate improves on baseline by ${delta} points.`);
    reasons.push('No critical constraint-retention or verification gap remains.');
  } else if (delta > 0 && candidate.total >= 60) {
    finality = 'HOLD';
    reasons.push(`Candidate improves on baseline by ${delta} points but does not clear every promotion gate.`);
    if (candidate.total < 78) reasons.push(`Quality score ${candidate.total}/100 is below the 78 promotion threshold.`);
    if (delta < 15) reasons.push(`Improvement of ${delta} points is below the 15-point promotion delta.`);
    if (critical.length) reasons.push(`Critical gaps remain: ${critical.join(', ')}.`);
  } else {
    finality = 'REJECT';
    reasons.push(`Candidate does not provide sufficient measurable improvement (delta ${delta}).`);
    if (candidate.total < 60) reasons.push(`Candidate quality ${candidate.total}/100 is below the minimum hold threshold.`);
    if (critical.length) reasons.push(`Critical gaps remain: ${critical.join(', ')}.`);
  }

  return { baseline, candidate, delta, finality, reasons };
}

export const METRIC_LABELS = {
  ambiguityResolution: 'Ambiguity resolved',
  assumptionExposure: 'Assumptions exposed',
  constraintRetention: 'Constraints retained',
  definitionOfDone: 'Definition of done',
  verificationReadiness: 'Verification readiness'
};
