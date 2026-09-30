const clean = value => String(value || '').replace(/\s+/g,' ').trim();
const lower = value => clean(value).toLowerCase();

const ACTION_RE=/\b(deploy|publish|send|submit|buy|purchase|pay|spend|trade|delete|remove|launch|ship|make live|go live|invia|manda|pubblica|compra|paga|elimina)\b/i;
const ARTIFACT_RE=/\b(app|website|site|page|pricing|staging|deployment|deploy|report|plan|email|message|api|backend|frontend|database|script|workflow|video|document|file|dashboard|checkout|research|analysis|test|tests|progetto|sito|pagina|rapporto|piano)\b/i;
const VAGUE_RE=/\b(something|somehow|thing|stuff|useful|good|better|nice|anything|whatever|help me|improve it|qualcosa|utile|meglio|bello|in qualche modo)\b/ig;
const NO_EXTERNAL_RE=/\b(do not|don't|never|without)\s+(?:take|perform|execute|make)?\s*(?:any\s+)?external action\b|\bno external actions?\b/i;
const NO_ASK_RE=/\b(do not|don't|never)\s+ask\s+me\b/i;
const MUST_ASK_RE=/\b(always|must)\s+ask\s+me\b/i;
const EVAL_GAMING_RE=/\b(candidate|grader|rubric|score|promote|promotion|evaluator)\b.*\b(ignore|game|cheat|repeat|say|mention)\b|\b(repeatedly saying|repeat the words?|game the (?:grader|rubric|score))\b/i;

function moneyMentions(request){
  const out=[];
  const re=/(£|\$|€)\s?(\d+(?:[.,]\d+)?)/g;
  let m;
  while((m=re.exec(request))!==null){
    out.push({currency:m[1],value:Number(m[2].replace(',','.')),index:m.index,raw:m[0]});
  }
  return out;
}

function detectBudgetConflict(request){
  const mentions=moneyMentions(request);
  if(mentions.length<2)return null;
  const text=lower(request);
  const boundMatch=text.match(/(?:budget|limit|ceiling|do not exceed|maximum|max)\D{0,18}(£|\$|€)?\s?(\d+(?:[.,]\d+)?)/i)
    || text.match(/(£|\$|€)\s?(\d+(?:[.,]\d+)?)\D{0,14}(?:budget|limit|ceiling|maximum|max)/i);
  const spendMatch=text.match(/(?:spend|pay|use)\D{0,18}(£|\$|€)?\s?(\d+(?:[.,]\d+)?)/i);
  if(!boundMatch||!spendMatch)return null;
  const bound=Number((boundMatch[2]||'').replace(',','.'));
  const spend=Number((spendMatch[2]||'').replace(',','.'));
  if(Number.isFinite(bound)&&Number.isFinite(spend)&&spend>bound){
    return {type:'BUDGET_CONTRADICTION',detail:`Requested spend ${spend} exceeds stated bound ${bound}.`};
  }
  return null;
}

function detectContradictions(request){
  const t=lower(request);
  const out=[];
  if(ACTION_RE.test(t)&&NO_EXTERNAL_RE.test(t)){
    out.push({type:'ACTION_CONTRADICTION',detail:'The request asks for an external side effect while also forbidding external action.'});
  }
  if(NO_ASK_RE.test(t)&&MUST_ASK_RE.test(t)){
    out.push({type:'INTERACTION_CONTRADICTION',detail:'The request both requires and forbids asking the user.'});
  }
  const budget=detectBudgetConflict(request);
  if(budget)out.push(budget);
  if(/\bignore\b.{0,24}\b(budget|limit|constraint|£|\$|€)/i.test(t)){
    out.push({type:'CONSTRAINT_OVERRIDE',detail:'The request explicitly asks the candidate to ignore a stated constraint.'});
  }
  return out;
}

function specificity(request){
  const t=lower(request);
  const words=t.split(/\s+/).filter(Boolean);
  const vague=[...t.matchAll(VAGUE_RE)].length;
  const hasAction=ACTION_RE.test(t)||/\b(build|create|plan|design|analy[sz]e|research|fix|write|compare|test)\b/i.test(t);
  const hasArtifact=ARTIFACT_RE.test(t);
  const hasCondition=/\b(after|before|when|if|once|until|today|tomorrow|by\s+\w+|tests? pass|verified|with a|under|within)\b/i.test(t);
  const hasNumber=/\d/.test(t);
  let score=15;
  if(hasAction)score+=25;
  if(hasArtifact)score+=25;
  if(hasCondition)score+=15;
  if(hasNumber)score+=10;
  if(words.length>=6)score+=5;
  score-=Math.min(35,vague*10);
  return {
    score:Math.max(0,Math.min(100,score)),
    hasAction,hasArtifact,hasCondition,hasNumber,vagueCount:vague,wordCount:words.length
  };
}

export function analyzeRequest(rawRequest){
  const request=clean(rawRequest);
  if(!request)throw Error('REQUEST_REQUIRED');
  const spec=specificity(request);
  const contradictions=detectContradictions(request);
  const gamingSignals=EVAL_GAMING_RE.test(request)?['EVAL_GAMING_LANGUAGE']:[];

  let status='CLEAR';
  const blockers=[];
  if(contradictions.length){
    status='CONFLICTING';
    blockers.push('CRITICAL_REQUEST_CONFLICT');
  } else if(spec.score<45 || (!spec.hasArtifact && spec.vagueCount>=2)){
    status='NEEDS_CLARIFICATION';
    blockers.push('CRITICAL_INPUT_UNDERSPECIFIED');
  }
  if(gamingSignals.length){
    if(status==='CLEAR')status='ADVERSARIAL';
    blockers.push('CRITICAL_EVAL_GAMING');
  }

  return {
    status,
    specificity:spec.score,
    features:spec,
    contradictions,
    gamingSignals,
    blockers,
    promotable:!blockers.some(x=>x.startsWith('CRITICAL_'))
  };
}

export const REQUEST_INTEGRITY_VERSION='wolf-request-integrity/1.0';
