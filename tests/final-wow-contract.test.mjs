import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {perception,localizeFinality} from '../src/language-perception.mjs';
import {isMarketIntent} from '../src/market-lens.mjs';

test('Italian market query follows the intended product path',async()=>{
  const query='Trovami un mercato azionario';
  const p=perception(query,{browserLanguages:['en-GB']});
  assert.equal(p.responseLocale,'it');
  assert.equal(isMarketIntent(query),true);

  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const answer=html.indexOf('id="answerPanel"');
  const market=html.indexOf('id="marketLens"');
  const research=html.indexOf('id="researchResults"');
  const audit=html.indexOf('id="auditDetails"');

  assert.ok(answer>0);
  assert.ok(market>answer);
  assert.ok(research>market);
  assert.ok(audit>research);
});

test('Italian finality is user-facing Italian while canonical state is preserved internally',()=>{
  assert.equal(localizeFinality('HOLD','it'),'ATTENDI');
  assert.equal(localizeFinality('PROMOTE','it'),'PROMUOVI');
  assert.equal(localizeFinality('REJECT','it'),'RESPINGI');
});

test('minimal landing remains unchanged by the wow layer',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const home=html.slice(html.indexOf('<section id="home"'),html.indexOf('<section id="results"'));
  assert.match(home,/wolf-logo/);
  assert.match(home,/id="request"/);
  assert.match(home,/id="run"/);
  assert.doesNotMatch(home,/Market Lens|WOLF ANSWER|Planning comparison/i);
});

test('technical audit is present but collapsed by default',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html,/<details id="auditDetails"/);
  assert.doesNotMatch(html,/<details id="auditDetails"[^>]*open/);
});
