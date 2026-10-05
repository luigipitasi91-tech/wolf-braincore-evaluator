import net from 'node:net';

const PRIVATE_V4=[
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^0\./
];

function hostAllowed(host,allowed=[]){
  if(!allowed?.length)return true;
  const h=String(host||'').toLowerCase();
  return allowed.some(domain=>{
    const d=String(domain||'').toLowerCase().replace(/^\.+/,'');
    return h===d||h.endsWith('.'+d);
  });
}

export function validateUrl(raw,{allowedDomains=[]}={}){
  let url;
  try{url=new URL(String(raw));}catch{throw new Error('INVALID_URL');}
  if(!['http:','https:'].includes(url.protocol))throw new Error('UNSAFE_PROTOCOL');
  const host=url.hostname.toLowerCase();
  if(host==='localhost'||host.endsWith('.localhost'))throw new Error('PRIVATE_HOST_BLOCKED');
  if(net.isIP(host)){
    if(host==='::1'||host.startsWith('fe80:')||host.startsWith('fc')||host.startsWith('fd'))throw new Error('PRIVATE_HOST_BLOCKED');
    if(PRIVATE_V4.some(re=>re.test(host)))throw new Error('PRIVATE_HOST_BLOCKED');
  }
  if(!hostAllowed(host,allowedDomains))throw new Error('DOMAIN_NOT_ALLOWED');
  return url.href;
}

export function redactAction(action={}){
  const out={...action};
  const selector=String(out.selector||out.v8vId||'').toLowerCase();
  if(out.value!==undefined){
    out.value=/(pass|secret|token|otp|pin|card|cvv)/i.test(selector)?'[REDACTED]':String(out.value).slice(0,120);
  }
  return out;
}
