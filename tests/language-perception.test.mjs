import test from 'node:test';
import assert from 'node:assert/strict';
import {detectLanguage,perception,localizePlan,localizeFinality,localizeMetricLabel} from '../src/language-perception.mjs';
import {buildPlans} from '../src/braincore.mjs';

test('Italian request is detected before planning',()=>{
  const p=perception('Trovami un mercato azionario',{browserLanguages:['en-GB']});
  assert.equal(p.detected,'it');
  assert.equal(p.responseLocale,'it');
  assert.ok(p.confidence>.7);
});

test('Italian display plan is localized while canonical intent is preserved',()=>{
  const plans=buildPlans('Trovami un mercato azionario');
  const it=localizePlan(plans.candidate,'it');
  assert.equal(it.goal,'Trovami un mercato azionario');
  assert.equal(it.label,'Candidato BrainCore');
  assert.ok(it.assumptions.some(x=>/richiesta letterale/i.test(x)));
  assert.ok(it.constraints.some(x=>/fonti verificabili/i.test(x)));
});

test('English remains English',()=>{
  const p=detectLanguage('Find me a stock market to research',{browserLanguages:['it-IT']});
  assert.equal(p.detected,'en');
  assert.equal(p.responseLocale,'en');
});

test('finality and metrics localize in Italian',()=>{
  assert.equal(localizeFinality('HOLD','it'),'ATTENDI');
  assert.equal(localizeMetricLabel('verificationReadiness','it'),'Prontezza alla verifica');
});

test('non-latin scripts are detected without pretending full catalog support',()=>{
  const p=detectLanguage('株式市場を調べて');
  assert.equal(p.detected,'ja');
  assert.equal(p.catalogSupported,false);
});
