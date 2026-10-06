import test from 'node:test';
import assert from 'node:assert/strict';
import {validateUrl,resolveAndValidateUrl,redactAction} from '../policy.mjs';

test('allows public https URL',()=>{
  assert.equal(validateUrl('https://example.com/a'), 'https://example.com/a');
});

test('blocks localhost and private IPv4',()=>{
  assert.throws(()=>validateUrl('http://localhost:3000'),/PRIVATE_HOST_BLOCKED/);
  assert.throws(()=>validateUrl('http://127.0.0.1'),/PRIVATE_HOST_BLOCKED/);
  assert.throws(()=>validateUrl('http://192.168.1.5'),/PRIVATE_HOST_BLOCKED/);
});

test('enforces domain allowlist',()=>{
  assert.equal(validateUrl('https://sub.example.com',{allowedDomains:['example.com']}),'https://sub.example.com/');
  assert.throws(()=>validateUrl('https://example.org',{allowedDomains:['example.com']}),/DOMAIN_NOT_ALLOWED/);
});

test('redacts likely secret values from trace',()=>{
  const x=redactAction({type:'fill',selector:'#password',value:'secret123'});
  assert.equal(x.value,'[REDACTED]');
});


test('rejects DNS names that resolve to loopback/private space',async()=>{
  await assert.rejects(()=>resolveAndValidateUrl('http://localhost'),/PRIVATE_HOST_BLOCKED/);
});

test('allows public DNS resolution for example.com',async()=>{
  const url=await resolveAndValidateUrl('https://example.com',{allowedDomains:['example.com']});
  assert.equal(url,'https://example.com/');
});
