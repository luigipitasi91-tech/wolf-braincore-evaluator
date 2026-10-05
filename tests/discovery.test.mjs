import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('discovery keeps Brave credentials server-side',async()=>{
  const [server,client]=await Promise.all([
    readFile(new URL('../server.mjs',import.meta.url),'utf8'),
    readFile(new URL('../src/discovery.mjs',import.meta.url),'utf8')
  ]);
  assert.match(server,/process\.env\.BRAVE_API_KEY/);
  assert.match(server,/x-subscription-token/);
  assert.match(server,/api\.search\.brave\.com/);
  assert.doesNotMatch(client,/BRAVE_API_KEY|x-subscription-token/);
});

test('discovery keeps web context out of the evaluator scoring path',async()=>{
  const [app,evaluator]=await Promise.all([
    readFile(new URL('../src/app.js',import.meta.url),'utf8'),
    readFile(new URL('../src/evaluator.mjs',import.meta.url),'utf8')
  ]);
  assert.match(app,/NEEDS_CLARIFICATION/);
  assert.match(app,/discoverQuery/);
  assert.doesNotMatch(evaluator,/Brave|Openverse|fetch\(/i);
});

test('visual discovery uses narrowly licensed Openverse results with source and license links',async()=>{
  const server=await readFile(new URL('../server.mjs',import.meta.url),'utf8');
  assert.match(server,/api\.openverse\.org/);
  assert.match(server,/license', 'pdm,cc0,by'/);
  assert.match(server,/licenseUrl/);
  assert.match(server,/sourceUrl/);
});

test('discovery API has basic abuse and origin controls',async()=>{
  const server=await readFile(new URL('../server.mjs',import.meta.url),'utf8');
  assert.match(server,/rateLimited/);
  assert.match(server,/wolf-braincore-evaluator\.onrender\.com/);
  assert.match(server,/QUERY_REQUIRED/);
});
