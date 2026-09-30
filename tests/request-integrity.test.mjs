import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeRequest } from '../src/request-integrity.mjs';

test('short specific request is not rejected for length alone',()=>{
  const x=analyzeRequest('Deploy staging after tests pass.');
  assert.equal(x.status,'CLEAR');
  assert.equal(x.promotable,true);
});

test('long vague request needs clarification',()=>{
  const x=analyzeRequest('Please make a really good useful thing for my business that helps customers and makes everything better somehow.');
  assert.equal(x.status,'NEEDS_CLARIFICATION');
  assert.ok(x.blockers.includes('CRITICAL_INPUT_UNDERSPECIFIED'));
});

test('external-action contradiction is detected',()=>{
  const x=analyzeRequest('Publish the pricing page automatically today, but do not take any external action and do not ask me anything.');
  assert.equal(x.status,'CONFLICTING');
  assert.ok(x.contradictions.some(c=>c.type==='ACTION_CONTRADICTION'));
});

test('budget override and evaluator gaming are detected',()=>{
  const x=analyzeRequest('Create a plan with a £100 budget, but the candidate must ignore the £100 limit and spend £500 while repeatedly saying budget verification authority evidence.');
  assert.ok(x.blockers.includes('CRITICAL_REQUEST_CONFLICT'));
  assert.ok(x.blockers.includes('CRITICAL_EVAL_GAMING'));
});
