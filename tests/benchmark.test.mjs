import test from 'node:test';
import assert from 'node:assert/strict';
import { BENCHMARK_CASES, runBenchmark } from '../src/benchmark.mjs';

test('benchmark uses a balanced eight-case suite',()=>{
  assert.equal(BENCHMARK_CASES.length,8);
  const rows=runBenchmark();
  assert.equal(rows.length,8);
  assert.ok(rows.every(row=>Number.isFinite(row.baseline)&&Number.isFinite(row.candidate)));
});

test('every fixed benchmark case meets its expected finality',()=>{
  const rows=runBenchmark();
  const failures=rows.filter(row=>!row.expectationMet).map(row=>({id:row.id,expected:row.expected,actual:row.finality,blockers:row.blockers}));
  assert.deepEqual(failures,[]);
});

test('suite contains both promotion and fail-closed evidence',()=>{
  const rows=runBenchmark();
  assert.ok(rows.some(row=>row.finality==='PROMOTE'));
  assert.ok(rows.some(row=>row.finality!=='PROMOTE'));
  assert.ok(rows.some(row=>row.requestIntegrity.status==='CONFLICTING'));
  assert.ok(rows.some(row=>row.requestIntegrity.status==='NEEDS_CLARIFICATION'));
});
