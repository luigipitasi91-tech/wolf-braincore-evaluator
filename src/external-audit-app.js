import {auditExternalPlans} from './external-audit.mjs';

const $=id=>document.getElementById(id);
const plan=(label,goal,constraints=[],assumptions=[],unknowns=[],definitionOfDone=[],steps=[],verification=[])=>({label,goal,constraints,assumptions,unknowns,definitionOfDone,steps,verification});
const exampleRequest='Publish a pricing page today under a £25 budget, only after human approval, and verify the live result.';
const sampleBase=plan('Synthetic baseline (NOT external model data)',exampleRequest,[],['We can proceed.'],[],['A pricing page exists.'],['Create the page.','Publish.'],['Check that it was produced.']);
const sampleCandidate=plan('Synthetic candidate (NOT external model data)',exampleRequest,
 ['Maintain the £25 maximum budget.','Require human approval before publishing.'],
 ['The domain and approval authority are not yet known.'],
 ['Which domain and who can approve publication?'],
 ['The page is deployed only after human approval.','£25 budget is not exceeded and the live result is verified with evidence.','Never publish without approval.'],
 ['Confirm authorization and target.','Build the smallest version.','Wait for human approval.','Publish.','Verify the live page.'],
 ['Compare published page with approved scope and verify live result.','Record evidence of the published page and expense ledger.']);
let downloadData=null;
function appendList(id,items){$(id).replaceChildren();for(const item of items){const li=document.createElement('li');li.textContent=item;$(id).append(li);}}
function metric(label,value){const div=document.createElement('div');div.className='metric';const small=document.createElement('span');small.textContent=label;const b=document.createElement('b');b.textContent=value;div.append(small,b);return div;}
function clean(){for(const id of ['request','requirements','baseline','candidate'])$(id).value='';$('errors').textContent='';$('outcome').hidden=true;$('download').disabled=true;downloadData=null;}
async function digest(text){
 const bytes=new TextEncoder().encode(text),h=await crypto.subtle.digest('SHA-256',bytes);
 return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
$('sample').addEventListener('click',()=>{
 $('request').value=exampleRequest;$('requirements').value='£25\nhuman approval\nverify';
 $('baseline').value=JSON.stringify(sampleBase,null,2);
 $('candidate').value=JSON.stringify(sampleCandidate,null,2);
 $('errors').textContent='Synthetic example loaded. Replace with real independently obtained agent outputs before making any real comparison.';
 $('outcome').hidden=true;downloadData=null;$('download').disabled=true;
});
$('reset').addEventListener('click',clean);
$('form').addEventListener('submit',async event=>{
 event.preventDefault();
 $('errors').textContent='';$('outcome').hidden=true;downloadData=null;$('download').disabled=true;
 try{
  const request=$('request').value;
  const baseline=JSON.parse($('baseline').value);
  const candidate=JSON.parse($('candidate').value);
  const requiredConstraints=$('requirements').value.split(/\r?\n/g).map(x=>x.trim()).filter(Boolean);
  const result=auditExternalPlans({request,baseline,candidate,requiredConstraints});
  const canonical=JSON.stringify(result);
  const hash=await digest(canonical);
  $('outcome').dataset.verdict=result.verdict;$('verdict').textContent=result.verdict;
  $('caveats').textContent='Provisional WOLF heuristic decision. Scores do not prove factual correctness, source identity or model intelligence. HUMAN REVIEW REQUIRED.';
  $('metrics').replaceChildren(
   metric('External baseline',result.evidence.baselineScore+'/100'),
   metric('External candidate',result.evidence.candidateScore+'/100'),
   metric('Delta',String(result.evidence.delta))
  );
  appendList('constraints',result.evidence.requiredConstraintChecks.map(x=>(x.presentInCandidate?'MENTIONED: ':'MISSING: ')+x.value+' (literal only)'));
  appendList('blockers',[...result.evidence.rubricBlockers,...result.evidence.externalAuditBlockers,
   'Original rubric verdict: '+result.originalRubricDecision,
   'Provider identity: NOT VERIFIED',
   'Independent ground truth: NOT AVAILABLE']);
  $('receipt').textContent='Evaluation JSON SHA-256: '+hash+' · no third-party uploads or external model calls.';
  downloadData=JSON.stringify({evaluation:result,sha256:hash,hashCovers:'JSON.stringify(evaluation)',sourceDisclosure:'user-supplied; no provider attestation'},null,2);
  $('download').disabled=false;$('outcome').hidden=false;
 }catch(error){$('errors').textContent='Cannot evaluate: '+String(error?.message||error).slice(0,250);}
});
$('download').addEventListener('click',()=>{
 if(!downloadData)return;
 const u=URL.createObjectURL(new Blob([downloadData],{type:'application/json'}));
 const a=document.createElement('a');a.href=u;a.download='wolf-external-evidence.json';a.click();
 setTimeout(()=>URL.revokeObjectURL(u),1000);
});
