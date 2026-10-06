import test from 'node:test';
import assert from 'node:assert/strict';
import {planAgentRun,verifySnapshot} from '../agent.mjs';

test('plans a bounded read-only agent run by default',()=>{
  const plan=planAgentRun({
    url:'https://example.com',
    goal:'Find product documentation',
    maxSteps:99
  });
  assert.equal(plan.mode,'AUTONOMOUS_READ_ONLY');
  assert.equal(plan.maxSteps,12);
  assert.equal(plan.authority,'NONE');
  assert.equal(plan.sideEffects,'DENIED_BY_DEFAULT');
});

test('detects scripted mode when actions are supplied',()=>{
  const plan=planAgentRun({
    url:'https://example.com',
    goal:'Read page',
    actions:[{type:'snapshot'}]
  });
  assert.equal(plan.mode,'SCRIPTED_PLUS_READ_ONLY');
});

test('verifies snapshot conditions deterministically',()=>{
  const snapshot={
    url:'https://example.com/report',
    title:'Verified Report',
    text:'Primary source evidence found.',
    links:[{text:'Source',href:'https://example.com/source'}]
  };
  const out=verifySnapshot(snapshot,[
    {kind:'URL_CONTAINS',value:'/report'},
    {kind:'TITLE_CONTAINS',value:'verified'},
    {kind:'TEXT_CONTAINS',value:'primary source'},
    {kind:'LINK_CONTAINS',value:'source'}
  ]);
  assert.equal(out.passed,true);
  assert.equal(out.checks.length,4);
});
