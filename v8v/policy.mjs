import net from 'node:net';
import dns from 'node:dns/promises';

const PRIVATE_V4=[
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^0\./
];

function normalizeRule(value=''){
  return String(value||'').toLowerCase().trim().replace(/^\*\./,'').replace(/^\.+/,'');
}

function hostMatches(host,rules=[]){
  const h=String(host||'').toLowerCase();
  return (rules||[]).some(rule=>{
    const d=normalizeRule(rule);
    return !!d&&(h===d||h.endsWith('.'+d));
  });
}

function privateAddress(address){
  const value=String(address||'').toLowerCase();
  if(net.isIP(value)===4)return PRIVATE_V4.some(re=>re.test(value));
  if(net.isIP(value)===6)return value==='::1'||value.startsWith('fe80:')||value.startsWith('fc')||value.startsWith('fd');
  return false;
}

function privateHostname(host){
  const h=String(host||'').toLowerCase();
  if(!h||h==='localhost'||h.endsWith('.localhost')||h.endsWith('.local')||h.endsWith('.internal'))return true;
  if(h==='metadata.google.internal')return true;
  if(net.isIP(h))return privateAddress(h);
  return false;
}

export function validateUrl(raw,{allowedDomains=[],blockDomains=[],allowPrivateNetwork=false,enforceDomain=true}={}){
  let url;
  try{url=new URL(String(raw));}catch{throw new Error('INVALID_URL');}
  if(!['http:','https:'].includes(url.protocol))throw new Error('UNSAFE_PROTOCOL');
  if(url.username||url.password)throw new Error('URL_CREDENTIALS_BLOCKED');
  const host=url.hostname.toLowerCase();
  if(!allowPrivateNetwork&&privateHostname(host))throw new Error('PRIVATE_HOST_BLOCKED');
  if(hostMatches(host,blockDomains))throw new Error('DOMAIN_BLOCKED');
  if(enforceDomain&&allowedDomains?.length&&!hostMatches(host,allowedDomains))throw new Error('DOMAIN_NOT_ALLOWED');
  return url.href;
}

export async function resolveAndValidateUrl(raw,options={}){
  const safe=validateUrl(raw,options);
  const url=new URL(safe);
  if(options.allowPrivateNetwork===true)return safe;
  const records=await dns.lookup(url.hostname,{all:true,verbatim:true});
  if(!records.length)throw new Error('DNS_RESOLUTION_FAILED');
  if(records.some(record=>privateAddress(record.address)))throw new Error('PRIVATE_HOST_BLOCKED');
  return safe;
}

export function redactAction(action={}){
  const out={...action};
  const selector=String(out.selector||out.v8vId||'').toLowerCase();
  if(out.value!==undefined){
    out.value=/(pass|secret|token|otp|pin|card|cvv)/i.test(selector)?'[REDACTED]':String(out.value).slice(0,120);
  }
  return out;
}
