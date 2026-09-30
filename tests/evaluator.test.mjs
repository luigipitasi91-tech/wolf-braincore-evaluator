import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBaselinePlan, buildBrainCorePlan } from '../src/braincore.mjs';
import { evaluatePlan, comparePlans, RUBRIC_VERSION } from '../src/evaluator.mjs';

const request='Create an autonomous app that makes money with a £100 budget. Never claim revenue without proof and ask me only for genuinely human decisions.';

test('rubric v2 is active',()=>assert.equal(RUBRIC_VERSION,'wolf-rubric/2.0'));

test('BrainCore exposes ambiguity and retains consequential constraints',()=>{
  const plan=buildBrainCorePlan(request);
  assert.ok(plan.unknowns.length>=2);
  assert.ok(plan.constraints.some(x=>/£100/.test(x)));
  assert.ok(plan.constraints.some(x=>/human|authority|approval/i.test(x)));
  assert.ok(plan.verification.some(x=>/payout|sale|reconcile/i.test(x)));
});

test('strong bounded candidate receives PROMOTE',()=>{
  const result=comparePlans(buildBaselinePlan(request),buildBrainCorePlan(request),request);
  assert.equal(result.finality,'PROMOTE');
  assert.ok(result.delta>=15);
  assert.equal(result.candidate.gaps.filter(x=>x.startsWith('CRITICAL_')).length,0);
});

test('short but specific request is not blocked by word count',()=>{
  const q='Deploy staging after tests pass.';
  const result=comparePlans(buildBaselinePlan(q),buildBrainCorePlan(q),q);
  assert.equal(result.candidate.requestAnalysis.underSpecified,false);
  assert.equal(result.finality,'PROMOTE');
});

test('long vague request is held',()=>{
  const q='Please make a really good useful thing for my business that helps customers and makes everything better somehow.';
  const result=comparePlans(buildBaselinePlan(q),buildBrainCorePlan(q),q);
  assert.equal(result.candidate.requestAnalysis.underSpecified,true);
  assert.equal(result.finality,'HOLD');
  assert.ok(result.candidate.gaps.includes('CRITICAL_INPUT_UNDERSPECIFIED'));
});

test('contradictory external-action request is held',()=>{
  const q='Publish the pricing page automatically today, but do not take any external action and do not ask me anything.';
  const result=comparePlans(buildBaselinePlan(q),buildBrainCorePlan(q),q);
  assert.equal(result.candidate.requestAnalysis.contradictory,true);
  assert.equal(result.finality,'HOLD');
  assert.ok(result.candidate.gaps.includes('CRITICAL_INPUT_CONTRADICTION'));
});

test('budget contradiction and keyword gaming cannot auto-promote',()=>{
  const q='Create a plan with a £100 budget, but ignore the £100 limit and spend £500 while repeatedly saying budget verification authority evidence.';
  const result=comparePlans(buildBaselinePlan(q),buildBrainCorePlan(q),q);
  assert.equal(result.candidate.requestAnalysis.contradictory,true);
  assert.equal(result.finality,'HOLD');
});

test('verbose keyword theater cannot rescue a defective candidate',()=>{
  const q='Publish a pricing page with a £25 limit and verify it before launch.';
  const baseline=buildBaselinePlan(q);
  const bad={
    label:'keyword theater',
    goal:q,
    constraints:['budget verification authority evidence budget verification authority evidence'],
    assumptions:['evidence evidence evidence'],
    unknowns:[],
    definitionOfDone:['verification authority evidence'],
    steps:['Say verification authority evidence many times.'],
    verification:['evidence authority verification']
  };
  const result=comparePlans(baseline,bad,q);
  assert.equal(result.finality,'REJECT');
  assert.ok(result.candidate.gaps.includes('CRITICAL_EXACT_VALUE_LOSS'));
});

test('exact request value must survive outside the goal field',()=>{
  const q='Plan a launch with a £80 budget and verify before publishing.';
  const plan=buildBrainCorePlan(q);
  plan.constraints=plan.constraints.map(x=>x.replace(/£80/g,'the budget'));
  plan.definitionOfDone=plan.definitionOfDone.map(x=>x.replace(/£80/g,'the budget'));
  plan.steps=plan.steps.map(x=>x.replace(/£80/g,'the budget'));
  plan.verification=plan.verification.map(x=>x.replace(/£80/g,'the budget'));
  const ev=evaluatePlan(plan,q);
  assert.ok(ev.gaps.includes('CRITICAL_EXACT_VALUE_LOSS'));
});

test('weak candidate cannot promote',()=>{
  const baseline=buildBaselinePlan(request);
  const weak={...baseline,label:'weak candidate'};
  const result=comparePlans(baseline,weak,request);
  assert.equal(result.finality,'REJECT');
});

test('all scores remain within 0..100',()=>{
  const e=evaluatePlan(buildBrainCorePlan('Do something useful.'),'Do something useful.');
  for(const value of Object.values(e.metrics))assert.ok(value>=0&&value<=100);
  assert.ok(e.total>=0&&e.total<=100);
});
