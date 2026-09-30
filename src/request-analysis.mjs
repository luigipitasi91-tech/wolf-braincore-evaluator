const MONEY_RE=/(?:£|\$|€)\s?\d+(?:[.,]\d+)?|\b\d+(?:[.,]\d+)?\s?(?:pounds?|gbp|dollars?|usd|euros?|eur)\b/gi;
const ACTION_RE=/\b(build|create|deploy|publish|plan|draft|design|write|fix|test|evaluate|compare|research|search|summarize|analyse|analyze|send|submit|buy|purchase|pay|spend|trade|automate|make|launch|update|remove|delete|generate)\b/i;
const CONSEQUENCE_RE=/\b(deploy|publish|send|submit|buy|purchase|pay|spend|trade|launch|delete|remove|transfer)\b/i;
const AUTONOMY_RE=/\b(autonom\w*|automatic\w*|fully automatic|100\s*%)\b/i;
const REVENUE_RE=/\b(profit|revenue|earn\w*|money|guadagn\w*|soldi|profitto|ricav\w*)\b/i;
const EVIDENCE_RE=/\b(verify|verified|verification|proof|evidence|prova|verifica\w*|receipt|reconcile)\b/i;
const CONDITION_RE=/\b(after|before|when|once|if|unless|until|provided that|only if)\b/i;
const VAGUE_RE=/\b(something|anything|thing|stuff|useful|better|good|great|somehow|everything|whatever|nice|improve it|make it work)\b/gi;
const STOP=new Set(['a','an','the','me','my','for','to','and','or','but','it','this','that','with','of','in','on','at','as','is','be','please','really','very','today','now','then','i','you']);

const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
const lower=v=>clean(v).toLowerCase();
const uniq=xs=>[...new Set(xs.filter(Boolean))];

function parseMoneyToken(token){
  const raw=clean(token);
  const symbol=(raw.match(/[£$€]/)||[])[0]||(/\b(?:gbp|pounds?)\b/i.test(raw)?'£':/\b(?:usd|dollars?)\b/i.test(raw)?'$':/\b(?:eur|euros?)\b/i.test(raw)?'€':'');
  const n=Number((raw.match(/\d+(?:[.,]\d+)?/)||[])[0]?.replace(',','.')||NaN);
  return {raw,currency:symbol,value:n,canonical:symbol&&Number.isFinite(n)?symbol+String(n):raw.toLowerCase()};
}

function moneyMentions(request){
  return uniq(clean(request).match(MONEY_RE)||[]).map(parseMoneyToken);
}

function contextualMoney(request,kind){
  const t=clean(request);
  const money='((?:£|\\$|€)\\s?\\d+(?:[.,]\\d+)?|\\b\\d+(?:[.,]\\d+)?\\s?(?:pounds?|gbp|dollars?|usd|euros?|eur)\\b)';
  const before=kind==='budget'
    ? '(?:budget|limit|cap|maximum|max|not exceed|under|up to)'
    : '(?:spend|pay|cost|purchase|buy)';
  const after=kind==='budget'
    ? '(?:budget|limit|cap|maximum|max)'
    : '(?:spend|payment|cost|purchase)';
  const out=[];
  for(const re of [
    new RegExp(before+'[^£$€\\d]{0,24}'+money,'gi'),
    new RegExp(money+'[^a-zA-Z]{0,10}'+after,'gi')
  ]){
    for(const m of t.matchAll(re)){
      const token=(m[1]||m[0].match(MONEY_RE)?.[0]);
      if(token)out.push(parseMoneyToken(token));
    }
  }
  return uniq(out.map(x=>JSON.stringify(x))).map(x=>JSON.parse(x));
}

function contentTokens(request){
  return lower(request)
    .replace(/[^a-z0-9£$€]+/g,' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter(x=>!STOP.has(x))
    .filter(x=>!ACTION_RE.test(x))
    .filter(x=>!['something','anything','thing','stuff','useful','better','good','great','somehow','everything','whatever','nice'].includes(x));
}

function numericConflict(budgets,spends){
  for(const b of budgets){
    for(const s of spends){
      if(b.currency&&s.currency&&b.currency!==s.currency)continue;
      if(Number.isFinite(b.value)&&Number.isFinite(s.value)&&s.value>b.value){
        return {id:'BUDGET_CONFLICT',detail:`spend ${s.canonical} exceeds limit ${b.canonical}`};
      }
    }
  }
  return null;
}

export function analyzeRequest(rawRequest){
  const request=clean(rawRequest);
  const q=lower(request);
  const words=q.split(/\s+/).filter(Boolean);
  const money=moneyMentions(request);
  const budgets=contextualMoney(request,'budget');
  const spends=contextualMoney(request,'spend');
  const vague=(q.match(VAGUE_RE)||[]);
  const hasAction=ACTION_RE.test(q);
  const hasConsequence=CONSEQUENCE_RE.test(q);
  const asksForAutonomy=AUTONOMY_RE.test(q);
  const asksForMoney=REVENUE_RE.test(q);
  const asksForEvidence=EVIDENCE_RE.test(q);
  const hasCondition=CONDITION_RE.test(q);
  const content=contentTokens(q);
  const noExternal=/\b(?:do not|don't|never|without)\b[^.]{0,28}\bexternal action\b/i.test(q);
  const noSpend=/\b(?:do not|don't|never|without|no)\b[^.]{0,20}\b(?:spend|spending|payment|pay|cost)\b/i.test(q)||/\b£0\b/.test(q);
  const contradictions=[];
  const cashConflict=numericConflict(budgets,spends);
  if(cashConflict)contradictions.push(cashConflict);
  if(noExternal&&hasConsequence)contradictions.push({id:'EXTERNAL_ACTION_CONFLICT',detail:'request asks for a consequential external action while also forbidding external actions'});
  if(noSpend&&spends.some(x=>x.value>0))contradictions.push({id:'SPEND_CONFLICT',detail:'request forbids spend while also requesting positive spend'});
  const measurable=money.length>0||hasCondition||asksForEvidence||/\b(today|tomorrow|tonight|by\s+\w+|\d+\s*(?:hours?|days?|weeks?)|\d{4}-\d{2}-\d{2})\b/i.test(q);
  const shortSpecific=words.length<=6&&hasAction&&(content.length>=1||measurable)&&vague.length===0;
  const vagueHeavy=vague.length>=2&&(!measurable||vague.length>=3);
  const underSpecified=!request||(!hasAction&&content.length<2)||(!shortSpecific&&vagueHeavy)||(hasAction&&content.length===0&&!measurable);
  return {
    request,
    wordCount:words.length,
    money,
    budgets,
    spends,
    vagueTerms:uniq(vague.map(x=>x.toLowerCase())),
    contentTokens:uniq(content),
    hasAction,
    hasConsequence,
    asksForAutonomy,
    asksForMoney,
    asksForEvidence,
    hasCondition,
    noExternal,
    noSpend,
    shortSpecific,
    underSpecified,
    contradictions,
    contradictory:contradictions.length>0
  };
}

export function requirementProfile(rawRequest){
  const a=analyzeRequest(rawRequest);
  const requirements=[];
  for(const m of a.money)requirements.push({id:'value:'+m.canonical,type:'exact-value',value:m.canonical});
  if(a.asksForAutonomy)requirements.push({id:'autonomy-boundary',type:'concept',terms:['human','authority','authorization','consent','approval']});
  if(a.asksForMoney)requirements.push({id:'revenue-truth',type:'concept',terms:['sale','payout','reconcile','verified revenue','cash revenue','receipt']});
  if(a.hasConsequence)requirements.push({id:'consequential-boundary',type:'concept',terms:['authority','approval','human','side effect','authorization']});
  if(a.asksForEvidence)requirements.push({id:'evidence',type:'concept',terms:['evidence','proof','verify','verification','reconcile','receipt']});
  if(a.noExternal)requirements.push({id:'no-external-action',type:'concept',terms:['no external','do not execute','without external','blocked external','hold external']});
  if(a.noSpend)requirements.push({id:'no-spend',type:'concept',terms:['no spend','do not spend','zero spend','without spend','blocked spend']});
  return {...a,requirements};
}

export const REQUEST_ANALYSIS_VERSION='wolf-request-analysis/2.0';
