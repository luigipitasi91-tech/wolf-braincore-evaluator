import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('result hierarchy is human summary first and technical evidence second',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const quick=html.indexOf('id="quickResult"');
  const verdict=html.indexOf('class="verdict panel evidence-detail"');
  const integrity=html.indexOf('integrity-strip panel evidence-detail');
  const metrics=html.indexOf('metrics-panel evidence-detail');
  const plans=html.indexOf('id="plans"');
  const receipt=html.indexOf('id="receipt"');
  assert.ok(quick>0&&verdict>quick&&integrity>verdict&&metrics>integrity&&plans>metrics&&receipt>plans);
});

test('judge can understand value before pressing W',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const home=html.slice(html.indexOf('<section id="home"'),html.indexOf('<section id="results"'));
  assert.match(home,/Should this AI change be promoted\?/);
  assert.match(home,/Clear requests are evaluated immediately/i);
  assert.match(home,/vague inputs are clarified/i);
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


test('evidence is collapsed behind an explicit user control',async()=>{
  const [html,app,css]=await Promise.all([
    readFile(new URL('../index.html',import.meta.url),'utf8'),
    readFile(new URL('../src/app.js',import.meta.url),'utf8'),
    readFile(new URL('../src/styles.css',import.meta.url),'utf8')
  ]);
  assert.match(html,/View evidence/);
  assert.match(app,/dataset\.evidence='closed'/);
  assert.match(css,/data-evidence="closed"/);
});


test('vague inputs route into discovery without adding network dependency to the evaluator core',async()=>{
  const [html,app,discovery]=await Promise.all([
    readFile(new URL('../index.html',import.meta.url),'utf8'),
    readFile(new URL('../src/app.js',import.meta.url),'utf8'),
    readFile(new URL('../src/discovery.mjs',import.meta.url),'utf8')
  ]);
  assert.match(html,/id="discoveryPanel"/);
  assert.match(app,/NEEDS_CLARIFICATION/);
  assert.match(app,/import\('\.\/discovery\.mjs'\)/);
  assert.doesNotMatch(app,/fetch\(/);
  assert.match(discovery,/wolf-discovery-api\.onrender\.com/);
  assert.match(discovery,/fetch\(/);
});
