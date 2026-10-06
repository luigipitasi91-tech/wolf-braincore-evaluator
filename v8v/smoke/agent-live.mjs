import assert from 'node:assert/strict';
import {runAgent} from '../agent.mjs';

const out=await runAgent({
  url:'https://example.com',
  goal:'Read the public example page and collect enough evidence to verify browser execution.',
  allowedDomains:['example.com'],
  maxSteps:2,
  minEvidenceChars:80
});

assert.equal(out.ok,true,JSON.stringify(out));
assert.equal(out.finality,'PROVISIONAL_SUCCESS');
assert.equal(out.title,'Example Domain');
assert.equal(out.authority,'NONE');
assert.equal(out.spendAuthorized,false);
assert.ok(out.snapshot.text.length>=80);

console.log(JSON.stringify({
  status:'PASS',
  test:'V8V_AGENT_LIVE',
  version:out.version,
  title:out.title,
  finality:out.finality,
  stepsCompleted:out.stepsCompleted
}));

process.exit(0);
