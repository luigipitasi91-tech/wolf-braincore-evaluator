import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('judge path presents one coherent AI change-gate product',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html,/Should this AI change be promoted\?/);
  assert.match(html,/INDEPENDENT AI CHANGE GATE/);
  assert.match(html,/PROMOTE/);
  assert.match(html,/HOLD/);
  assert.match(html,/REJECT/);
  assert.match(html,/Run benchmark/);
});

test('competition landing remains focused on one request workflow',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const home=html.slice(html.indexOf('<section id="home"'),html.indexOf('<section id="results"'));
  assert.match(home,/class="wolf-logo"/);
  assert.match(home,/id="wolfForm"/);
  assert.match(home,/id="request"/);
  assert.match(home,/id="run"/);
  assert.match(home,/data-scenario="clear"/);
  assert.match(home,/data-scenario="vague"/);
  assert.match(home,/data-scenario="conflict"/);
  assert.doesNotMatch(home,/market intelligence|live research|1001 failure lab/i);
});

test('human decision is immediate and technical evidence remains one click away',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const quick=html.indexOf('id="quickResult"');
  const toggle=html.indexOf('id="evidenceToggle"');
  const verdict=html.indexOf('class="verdict panel evidence-detail"');
  const integrity=html.indexOf('integrity-strip panel evidence-detail');
  const metrics=html.indexOf('id="metrics"');
  const plans=html.indexOf('id="plans"');
  const receipt=html.indexOf('id="receipt"');
  assert.ok(quick>0&&toggle>quick&&verdict>toggle&&integrity>verdict&&metrics>integrity&&plans>metrics&&receipt>plans);
  assert.doesNotMatch(html,/id="auditDetails"/);
});

test('competition browser client has no external research or execution dependency',async()=>{
  const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
  assert.doesNotMatch(app,/live-research|market-lens|adamo-lab|fetch\(|trading212|api[_-]?secret|api[_-]?key/i);
  assert.match(app,/buildPlans/);
  assert.match(app,/comparePlans/);
  assert.match(app,/runBenchmark/);
});
