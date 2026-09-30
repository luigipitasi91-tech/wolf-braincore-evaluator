import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('result hierarchy is answer first, evidence second, audit last',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const answer=html.indexOf('id="answerPanel"');
  const market=html.indexOf('id="marketLens"');
  const research=html.indexOf('id="researchResults"');
  const audit=html.indexOf('id="auditDetails"');
  assert.ok(answer>0&&market>answer&&research>market&&audit>research);
  assert.match(html,/<details id="auditDetails"/);
  assert.doesNotMatch(html,/<details id="auditDetails"[^>]*open/);
});

test('minimal landing remains wolf + one request form',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const home=html.slice(html.indexOf('<section id="home"'),html.indexOf('<section id="results"'));
  assert.match(home,/class="wolf-logo"/);
  assert.match(home,/id="wolfForm"/);
  assert.match(home,/id="request"/);
  assert.match(home,/id="run"/);
  assert.doesNotMatch(home,/planning comparison|market intelligence|promotion decision/i);
});

test('browser client has no trading execution route or broker credentials',async()=>{
  const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
  const market=await readFile(new URL('../src/market-lens.mjs',import.meta.url),'utf8');
  const combined=app+'\n'+market;
  assert.doesNotMatch(combined,/trading212.*order|order\.place|api[_-]?secret|api[_-]?key/i);
  assert.match(market,/wolf\/market\/lens/);
});

test('language perception runs before user-facing rendering',async()=>{
  const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
  assert.match(app,/perception\(request/);
  assert.match(app,/localizePlan/);
  assert.match(app,/document\.documentElement\.lang/);
});
