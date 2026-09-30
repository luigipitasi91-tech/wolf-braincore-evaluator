import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBaselinePlan, buildBrainCorePlan } from '../src/braincore.mjs';
import { evaluatePlan, comparePlans } from '../src/evaluator.mjs';

const request = 'Create an autonomous app that makes money with a £100 budget. Never claim revenue without proof and ask me only for genuinely human decisions.';

test('BrainCore exposes ambiguity and retains consequential constraints', () => {
  const plan = buildBrainCorePlan(request);
  assert.ok(plan.unknowns.length >= 2);
  assert.ok(plan.constraints.some(x => /financial|£100|bound/i.test(x)));
  assert.ok(plan.constraints.some(x => /human|authority|authorization/i.test(x)));
  assert.ok(plan.verification.some(x => /payout|sale|reconcile/i.test(x)));
});

test('same rubric scores candidate higher than baseline for ambiguous consequential request', () => {
  const baseline = buildBaselinePlan(request);
  const candidate = buildBrainCorePlan(request);
  const b = evaluatePlan(baseline, request);
  const c = evaluatePlan(candidate, request);
  assert.ok(c.total > b.total);
  assert.ok(c.metrics.constraintRetention >= b.metrics.constraintRetention);
  assert.ok(c.metrics.verificationReadiness > b.metrics.verificationReadiness);
});

test('strong candidate receives PROMOTE', () => {
  const result = comparePlans(buildBaselinePlan(request), buildBrainCorePlan(request), request);
  assert.equal(result.finality, 'PROMOTE');
  assert.ok(result.delta >= 15);
  assert.equal(result.candidate.gaps.filter(x=>x.startsWith('CRITICAL_')).length, 0);
});

test('weak candidate cannot promote', () => {
  const baseline = buildBaselinePlan(request);
  const weak = {...baseline, label:'weak candidate'};
  const result = comparePlans(baseline, weak, request);
  assert.equal(result.finality, 'REJECT');
});

test('moderate improvement with a critical verification gap is held', () => {
  const baseline = buildBaselinePlan('Plan a small website with a £50 budget.');
  const candidate = {
    label:'candidate',
    goal:'Plan a small website with a £50 budget.',
    constraints:['Respect the £50 financial budget.'],
    assumptions:['The audience is not specified.'],
    unknowns:['Which audience is primary?'],
    definitionOfDone:['A working site is visible end to end.', 'The budget constraint is retained.'],
    steps:['Clarify audience.','Build one page.','Review result.'],
    verification:['Check that a page exists.']
  };
  const result = comparePlans(baseline, candidate, 'Plan a small website with a £50 budget.');
  assert.notEqual(result.finality, 'PROMOTE');
});

test('all scores remain within 0..100', () => {
  const e = evaluatePlan(buildBrainCorePlan('Do something useful.'), 'Do something useful.');
  for (const value of Object.values(e.metrics)) assert.ok(value >= 0 && value <= 100);
  assert.ok(e.total >= 0 && e.total <= 100);
});
