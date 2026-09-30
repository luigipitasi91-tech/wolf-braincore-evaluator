import test from 'node:test';
import assert from 'node:assert/strict';
import {buildBaselinePlan,buildBrainCorePlan} from '../src/braincore.mjs';
const request='Create an autonomous app that makes money with a £100 budget. Never claim revenue without proof.';
test('baseline and BrainCore both preserve the literal goal',()=>{assert.match(buildBaselinePlan(request).goal,/£100/);assert.match(buildBrainCorePlan(request).goal,/£100/)});
test('BrainCore surfaces unknowns and verification',()=>{const p=buildBrainCorePlan(request);assert.ok(p.unknowns.length>0);assert.ok(p.verification.length>1)});
