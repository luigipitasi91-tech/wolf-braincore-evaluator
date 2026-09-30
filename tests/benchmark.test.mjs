import test from 'node:test';
import assert from 'node:assert/strict';
import { BENCHMARK_CASES, runBenchmark } from '../src/benchmark.mjs';

test('benchmark uses a fixed multi-case suite',()=>{
  assert.equal(BENCHMARK_CASES.length,4);
  const rows=runBenchmark();
  assert.equal(rows.length,4);
  assert.ok(rows.every(row=>Number.isFinite(row.baseline)&&Number.isFinite(row.candidate)));
});

test('severely under-specified intent cannot be promoted',()=>{
  const row=runBenchmark().find(x=>x.id==='underspecified-intent');
  assert.ok(row);
  assert.notEqual(row.finality,'PROMOTE');
  assert.ok(row.blockers.includes('CRITICAL_INPUT_UNDERSPECIFIED'));
});

test('benchmark contains both promotion and hold/reject evidence',()=>{
  const rows=runBenchmark();
  assert.ok(rows.some(row=>row.finality==='PROMOTE'));
  assert.ok(rows.some(row=>row.finality!=='PROMOTE'));
});
