import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('result hierarchy is verdict first, shared metrics second, inspectable plans third',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const verdict=html.indexOf('class="verdict panel"');
  const integrity=html.indexOf('class="integrity-strip panel"');
  const metrics=html.indexOf('class="panel metrics-panel"');
  const plans=html.indexOf('id="plans"');
  const receipt=html.indexOf('id="receipt"');
  const benchmark=html.indexOf('id="benchmarkResults"');
  assert.ok(verdict>0&&integrity>verdict&&metrics>integrity&&plans>metrics&&receipt>plans&&benchmark>receipt);
});

test('judge can understand value before pressing W',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const home=html.slice(html.indexOf('<section id="home"'),html.indexOf('<section id="results"'));
  assert.match(home,/Should this AI change be promoted\?/);
  assert.match(home,/same request/i);
  assert.match(home,/same rubric/i);
  assert.match(home,/hard blockers/i);
  assert.match(home,/8 fixed regression cases/);
});

test('browser client is deterministic and provider-neutral',async()=>{
  const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
  assert.match(app,/comparePlans/);
  assert.match(app,/wolf-braincore-receipt\/2\.0/);
  assert.match(app,/crypto\.subtle\.digest/);
  assert.doesNotMatch(app,/fetch\(|XMLHttpRequest|WebSocket|EventSource/);
});

test('fail-closed scenarios are directly demoable from the landing',async()=>{
  const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
  assert.match(app,/vague:'Build me something useful\.'/);
  assert.match(app,/conflict:'Publish the pricing page automatically today/);
  assert.match(app,/data-scenario/);
});
