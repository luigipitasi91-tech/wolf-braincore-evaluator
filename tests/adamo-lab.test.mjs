import test from 'node:test';
import assert from 'node:assert/strict';
import {isAdamoIntent,extractAdamoObjective,runAdamoLab} from '../src/adamo-lab.mjs';

test('Adamo recognizes explicit £100 to £500 research objective',()=>{
  const q='Ho £100 e voglio studiare se possono diventare £500 con 1001 tentativi paper.';
  assert.equal(isAdamoIntent(q),true);
  assert.deepEqual(extractAdamoObjective(q),{startCapital:100,targetCapital:500});
});

test('ordinary market query does not invoke Adamo',async()=>{
  let calls=0;
  const out=await runAdamoLab('Trovami un mercato azionario',{locale:'it',fetchImpl:async()=>{calls++;}});
  assert.equal(out.status,'NOT_ADAMO_INTENT');
  assert.equal(calls,0);
});

test('Adamo preserves paper-only controls from provider',async()=>{
  const out=await runAdamoLab('Adamo 1001: porta £100 a £500',{locale:'it',fetchImpl:async()=>({
    ok:true,
    async json(){return {
      status:'ADAMO_1001_COMPLETE',
      mode:'PAPER_RESEARCH_ONLY',
      objective:{startCapital:100,targetCapital:500},
      attempts:{requested:1001,completed:1001,failed:980,survived:21},
      stress:{count:1001,probabilityTarget:0.04,medianFinal:116,p05Final:82,p95Final:173,ruinProbability:0.01},
      topCandidate:{symbol:'SPY',fast:5,slow:20,finalBalance:118,robust:true,test:{drawdown:0.12,sharpe:0.8}},
      finality:'HOLD_TARGET_NOT_ROBUST',
      analysis:'Adamo ha trovato un candidato robusto per ulteriore ricerca, non una prova.',
      v8:{plan:{mode:'POWER',selectedCylinders:['C1','C4','C7','C2']},evaluation:{eligibleForXi0Review:false}},
      controls:{readOnly:true,paperOnly:true,liveTrading:false,ordersPrepared:false,ordersPlaced:false,spendAuthorized:false}
    }}
  })});
  assert.equal(out.attempts.completed,1001);
  assert.equal(out.stress.count,1001);
  assert.equal(out.controls.paperOnly,true);
  assert.equal(out.controls.liveTrading,false);
  assert.equal(out.controls.ordersPlaced,false);
  assert.equal(out.controls.spendAuthorized,false);
});

test('Adamo provider failure is visible and not fabricated',async()=>{
  const out=await runAdamoLab('Adamo 1001 £100 a £500',{locale:'it',fetchImpl:async()=>{throw new Error('OFFLINE')}});
  assert.equal(out.status,'ADAMO_UNAVAILABLE');
  assert.equal(out.error,'OFFLINE');
});
