import test from 'node:test';
import assert from 'node:assert/strict';
import {isResearchIntent,expandResearchQuery,normalizeResearchResponse,runLiveResearch} from '../src/live-research.mjs';

test('Italian stock-market request is recognized as research',()=>{
  assert.equal(isResearchIntent('Trovami un mercato azionario'),true);
});

test('generic stock-market request expands to global comparison evidence',()=>{
  const q=expandResearchQuery('Trovami un mercato azionario');
  assert.match(q,/S&P 500/);
  assert.match(q,/STOXX Europe 600/);
  assert.match(q,/Nikkei 225/);
});

test('normalizes and bounds live evidence results',()=>{
  const x=normalizeResearchResponse({
    results:Array.from({length:12},(_,i)=>({title:'Result '+i,url:'https://example.com/'+i,snippet:'Snippet '+i,source:'Test'})),
    successfulSources:3,attemptedSources:5,retrievedAt:'2026-09-30T00:00:00Z'
  });
  assert.equal(x.resultCount,8);
  assert.equal(x.successfulSources,3);
  assert.equal(x.provisional,true);
});

test('research adapter fails visibly instead of fabricating results',async()=>{
  const out=await runLiveResearch('research AI agents',{fetchImpl:async()=>{throw new Error('OFFLINE')}});
  assert.equal(out.status,'LIVE_RESEARCH_UNAVAILABLE');
  assert.equal(out.resultCount,0);
  assert.equal(out.error,'OFFLINE');
});

test('research adapter accepts real-shaped provider evidence',async()=>{
  const out=await runLiveResearch('compare stock markets',{fetchImpl:async()=>({
    ok:true,
    async json(){return {results:[{title:'Market overview',url:'https://example.com/market',snippet:'Evidence',source:'Example'}],successfulSources:1,attemptedSources:2,retrievedAt:'2026-09-30T00:00:00Z'}}
  })});
  assert.equal(out.status,'LIVE_RESEARCH_COMPLETE');
  assert.equal(out.resultCount,1);
  assert.equal(out.results[0].source,'Example');
});
