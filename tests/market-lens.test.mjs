import test from 'node:test';
import assert from 'node:assert/strict';
import {isMarketIntent,runMarketLens,marketAnswer} from '../src/market-lens.mjs';

test('Italian stock-market query routes to Market Lens',()=>{
  assert.equal(isMarketIntent('Trovami un mercato azionario'),true);
});

test('non-market request does not call market provider',async()=>{
  let calls=0;
  const out=await runMarketLens('Scrivi una poesia',{locale:'it',fetchImpl:async()=>{calls++;}});
  assert.equal(out.status,'NOT_MARKET_INTENT');
  assert.equal(calls,0);
});

test('Market Lens remains read-only and produces Italian answer',async()=>{
  const out=await runMarketLens('Trovami un mercato azionario',{locale:'it',fetchImpl:async()=>({
    ok:true,
    async json(){return {
      status:'MARKET_LENS_READY',
      summary:'Ho recuperato dati per 2 mercati.',
      cards:[
        {label:'United States',symbol:'SPY',status:'AVAILABLE',price:600,changePercent:0.5,currency:'USD'},
        {label:'Europe',symbol:'VGK',status:'AVAILABLE',price:75,changePercent:-0.2,currency:'USD'}
      ],
      questions:['Quale area geografica preferisci?'],
      controls:{readOnly:true,brokerExecution:false,ordersPlaced:false}
    }}
  })});
  assert.equal(out.controls.readOnly,true);
  assert.equal(out.controls.ordersPlaced,false);
  const answer=marketAnswer('Trovami un mercato azionario',out,'it');
  assert.match(answer,/Ho trovato 2 mercati/i);
  assert.match(answer,/Non scelgo automaticamente/i);
});

test('provider failure is visible rather than fabricated',async()=>{
  const out=await runMarketLens('analizza SPY',{locale:'it',fetchImpl:async()=>{throw new Error('OFFLINE')}});
  assert.equal(out.status,'MARKET_LENS_UNAVAILABLE');
  assert.equal(out.cards.length,0);
});
