import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeExternalPlan, evaluateExternalCandidate } from '../src/external-candidate.mjs';

const request='Publish a pricing page today, preserve a £25 budget, and verify the live result.';

const strong={
  source:'GPT-like normalized candidate',
  goal:request,
  constraints:[
    'Respect the £25 budget.',
    'Treat publishing as a consequential external action requiring explicit authority.'
  ],
  assumptions:['Missing details are not permission to invent values.'],
  unknowns:['Which domain/environment is approved for publishing?'],
  definitionOfDone:[
    'The approved pricing page is live on the intended domain.',
    'The £25 budget is not exceeded.',
    'Completion is backed by observable evidence.'
  ],
  steps:[
    'Confirm target environment and authority.',
    'Prepare the smallest safe change.',
    'Publish only after the authority boundary is satisfied.',
    'Verify the live page.'
  ],
  verification:[
    'Check the final live page and response state.',
    'Record a final state and evidence.'
  ]
};

test('external plan schema normalizes structured candidates',()=>{
  const p=normalizeExternalPlan(strong);
  assert.equal(p.goal,request);
  assert.ok(p.constraints.length>=2);
});

test('external candidates use the same WOLF rubric and blockers',()=>{
  const result=evaluateExternalCandidate({request,candidate:strong,source:'external-test'});
  assert.equal(result.contractVersion,'wolf-external-candidate/1.0');
  assert.equal(result.source,'external-test');
  assert.ok(Number.isFinite(result.comparison.candidate.total));
  assert.ok(['PROMOTE','HOLD','REJECT'].includes(result.comparison.finality));
});

test('external plan without a goal fails closed',()=>{
  assert.throws(()=>normalizeExternalPlan({constraints:['x']}),/EXTERNAL_PLAN_GOAL_REQUIRED/);
});
