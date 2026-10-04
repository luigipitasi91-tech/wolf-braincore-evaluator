import test from 'node:test';
import assert from 'node:assert/strict';
import {buildBaselinePlan,buildBrainCorePlan,extractExplicitConstraints} from '../src/braincore.mjs';
const request='Create an autonomous app that makes money with a £100 budget. Never claim revenue without proof.';
test('baseline and BrainCore both preserve the literal goal',()=>{assert.match(buildBaselinePlan(request).goal,/£100/);assert.match(buildBrainCorePlan(request).goal,/£100/)});
test('BrainCore surfaces unknowns and verification',()=>{const p=buildBrainCorePlan(request);assert.ok(p.unknowns.length>0);assert.ok(p.verification.length>1)});


test('shared explicit constraints are visible to baseline and candidate',()=>{
  const r='Create an app that finds rental houses in Luton under £1,200 per month, shows price, location and source, and never invents listings.';
  const explicit=extractExplicitConstraints(r);
  const baseline=buildBaselinePlan(r);
  const candidate=buildBrainCorePlan(r);
  assert.ok(explicit.some(x=>/£1,200/.test(x)));
  assert.ok(explicit.some(x=>/Luton/.test(x)));
  assert.ok(explicit.some(x=>/price, location and source/i.test(x)));
  assert.ok(explicit.some(x=>/never invents listings/i.test(x)));
  for(const item of explicit){
    assert.ok(baseline.constraints.includes(item));
    assert.ok(candidate.constraints.includes(item));
  }
});
