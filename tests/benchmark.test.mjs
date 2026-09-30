import test from 'node:test';
import assert from 'node:assert/strict';
import { BENCHMARK_CASES, BENCHMARK_VERSION, runBenchmark } from '../src/benchmark.mjs';

test('benchmark v2 uses a balanced 12-case suite',()=>{
  assert.equal(BENCHMARK_VERSION,'wolf-benchmark/2.0');
  assert.equal(BENCHMARK_CASES.length,12);
  const expected=new Set(BENCHMARK_CASES.map(x=>x.expectedFinality));
  assert.ok(expected.has('PROMOTE'));
  assert.ok(expected.has('HOLD'));
});

test('all fixed benchmark cases match expected finality',()=>{
  const rows=runBenchmark();
  assert.equal(rows.length,12);
  const failed=rows.filter(x=>!x.passed);
  assert.deepEqual(failed.map(x=>({id:x.id,expected:x.expectedFinality,actual:x.finality})),[]);
});

test('specific short request promotes while long vague request holds',()=>{
  const rows=runBenchmark();
  assert.equal(rows.find(x=>x.id==='short-specific').finality,'PROMOTE');
  assert.equal(rows.find(x=>x.id==='long-vague').finality,'HOLD');
});

test('conflicting side effects and budget contradiction both hold',()=>{
  const rows=runBenchmark();
  assert.equal(rows.find(x=>x.id==='external-conflict').finality,'HOLD');
  assert.equal(rows.find(x=>x.id==='budget-conflict').finality,'HOLD');
});

test('minor typo case remains usable',()=>{
  const row=runBenchmark().find(x=>x.id==='typo-robustness');
  assert.equal(row.finality,'PROMOTE');
});
