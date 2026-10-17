import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditExternalPlans,EXTERNAL_AUDIT_VERSION} from '../src/external-audit.mjs';

const request='Publish a pricing page today under a £25 budget, only after human approval, and verify the live result.';
const base={label:'Externally provided baseline',goal:request,assumptions:['All details are present.'],steps:['Publish page.'],definitionOfDone:['The page exists.'],verification:['Check page exists.']};
const candidate={
 label:'Externally provided candidate',
 goal:request,
 constraints:['Respect £25 maximum budget.','Require human approval before publication.'],
 assumptions:['Publication target is not known.'],
 unknowns:['Which environment and approver are authorized?'],
 definitionOfDone:['The approved pricing page is live.','Keep £25 budget.','Verify result with observable evidence.'],
 steps:['Confirm authority.','Implement version.','Require human approval.','Publish only when approved.','Verify live page.'],
 verification:['Verify live result with independent evidence.','Record a final state.']
};
const run=(extra={})=>auditExternalPlans({request,baseline:base,candidate,requiredConstraints:['£25','human approval','verify'],...extra});

test('evaluates two actual caller-provided plans rather than generating BrainCore candidate',()=>{
 const result=run();
 assert.equal(result.contract,EXTERNAL_AUDIT_VERSION);
 assert.equal(result.baseline.label,base.label);
 assert.equal(result.candidate.label,candidate.label);
 assert.equal(result.baseline.goal,request);
 assert.equal(result.providerIdentityVerified,false);
 assert.equal(result.externalModelsCalled,0);
 assert.equal(result.scientificIntelligenceScore,false);
 assert.equal(result.externalWrites,false);
 assert.equal(result.evidence.requiredConstraintChecks.length,3);
 assert.ok(['PROMOTE','HOLD','REJECT'].includes(result.verdict));
});
test('missing human-required exact term cannot yield PROMOTE even if numeric score would',()=>{
 const result=run({requiredConstraints:['£25','human approval','PRIVATE_SECRET_NOT_PRESENT']});
 assert.equal(result.evidence.requiredConstraintChecks[2].presentInCandidate,false);
 assert.ok(result.evidence.externalAuditBlockers.includes('REQUIRED_CONSTRAINT_NOT_MENTIONED'));
 assert.notEqual(result.verdict,'PROMOTE');
});
test('no independent required constraints cannot auto-promote',()=>{
 const result=run({requiredConstraints:[]});
 assert.ok(result.evidence.externalAuditBlockers.includes('HUMAN_REQUIRED_CONSTRAINTS_MISSING'));
 assert.notEqual(result.verdict,'PROMOTE');
});
test('verdict does not claim verified model provenance or numerical scientific IQ',()=>{
 const a=run({sourceLabels:{baseline:'Claude',candidate:'GPT'}});
 assert.equal(a.providerLabels.baseline,'Claude');
 assert.equal(a.providerLabels.candidate,'GPT');
 assert.equal(a.providerIdentityVerified,false);
 assert.equal(a.independentHumanGroundTruthAvailable,false);
 assert.equal(a.humanReviewRequired,true);
 assert.equal(a.risk,'PROVISIONAL_NOT_A_MODEL_INTELLIGENCE_BENCHMARK');
});
test('rejects malformed and missing inputs, non-string arrays, huge fields and excessive requirements',()=>{
 assert.throws(()=>run({baseline:null}),/BASELINE_PLAN_REQUIRED/);
 assert.throws(()=>run({candidate:{}}),/CANDIDATE_GOAL_REQUIRED/);
 assert.throws(()=>run({candidate:{...candidate,verification:'not an array'}}),/CANDIDATE_VERIFICATION_INVALID/);
 assert.throws(()=>run({candidate:{...candidate,unknowns:[null]}}),/TEXT_FIELD_MUST_BE_STRING/);
 assert.throws(()=>run({request:' '.repeat(10)}),/REQUEST_REQUIRED_OR_TOO_LONG/);
 assert.throws(()=>run({requiredConstraints:['x'.repeat(200)]}),/REQUIRED_CONSTRAINT_INVALID/);
 assert.throws(()=>run({requiredConstraints:Array(13).fill('x')}),/REQUIRED_CONSTRAINTS_INVALID/);
});
test('identical baselines and candidates do not imply improvement',()=>{
 const result=run({candidate:base,requiredConstraints:['£25']});
 assert.ok(result.evidence.delta===0);
 assert.equal(result.verdict,'REJECT');
});
test('the separate browser UI does not modify the competition judge path',()=>{
 const html=readFileSync(new URL('../external.html',import.meta.url),'utf8');
 const script=readFileSync(new URL('../src/external-audit-app.js',import.meta.url),'utf8');
 const competition=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 assert.match(html,/EXTERNAL EVIDENCE LAB/);
 assert.match(html,/connect-src 'none'/);
 assert.match(html,/form-action 'none'/);
 assert.match(script,/crypto\.subtle\.digest/);
 assert.match(script,/auditExternalPlans/);
 assert.doesNotMatch(competition,/external-audit/);
 assert.doesNotMatch(competition,/external\.html/);
 assert.doesNotMatch(script,/\bfetch\s*\(/);
});
