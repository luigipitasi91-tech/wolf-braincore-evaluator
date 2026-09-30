import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeDomainPacks, FINANCE_EVIDENCE_FAMILIES, BROWSER_RUNTIME_REQUIREMENTS } from '../src/domain-packs.mjs';
import { runFinanceDomainBenchmark, runBrowserAgentBenchmark } from '../src/domain-benchmarks.mjs';
import { buildBrainCorePlan } from '../src/braincore.mjs';

test('finance pack exposes all ten derived evidence families',()=>{
  assert.equal(FINANCE_EVIDENCE_FAMILIES.length,10);
});

test('browser pack exposes the runtime evidence contract',()=>{
  assert.equal(BROWSER_RUNTIME_REQUIREMENTS.length,10);
});

test('finance requests add dated-source, uncertainty and no-invention constraints',()=>{
  const plan=buildBrainCorePlan('Build a DCF valuation for a listed company with WACC and terminal value.');
  assert.ok(plan.domainPacks.includes('finance'));
  const all=[...plan.constraints,...plan.verification,...plan.unknowns].join(' ');
  assert.match(all,/dated|source/i);
  assert.match(all,/do not invent|missing values/i);
  assert.match(all,/uncertainty|conditional|hypotheses/i);
  assert.match(all,/ticker|company/i);
});

test('browser-agent requests add secret, authority, audit, recovery and cost boundaries',()=>{
  const plan=buildBrainCorePlan('Log into an approved supplier portal and submit a form after user confirmation.');
  assert.ok(plan.domainPacks.includes('browser-agent'));
  const all=[...plan.constraints,...plan.verification,...plan.unknowns].join(' ');
  assert.match(all,/credentials|secrets/i);
  assert.match(all,/domain|authority/i);
  assert.match(all,/audit|trace|replay/i);
  assert.match(all,/retry|recovery|handoff/i);
  assert.match(all,/cost|time budget/i);
});

test('all ten finance transfer cases satisfy the finance evidence contract',()=>{
  const rows=runFinanceDomainBenchmark();
  assert.equal(rows.length,10);
  const failures=rows.filter(x=>!x.pass).map(x=>({id:x.id,checks:x.checks}));
  assert.deepEqual(failures,[]);
});

test('all six browser-agent transfer cases satisfy the browser runtime contract',()=>{
  const rows=runBrowserAgentBenchmark();
  assert.equal(rows.length,6);
  const failures=rows.filter(x=>!x.pass).map(x=>({id:x.id,checks:x.checks}));
  assert.deepEqual(failures,[]);
});

test('domain detector can combine finance and browser packs',()=>{
  const x=analyzeDomainPacks('Use a browser to collect dated stock earnings data from an approved portal for a portfolio report.');
  assert.ok(x.domains.includes('finance'));
  assert.ok(x.domains.includes('browser-agent'));
});
