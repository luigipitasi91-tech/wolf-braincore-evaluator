import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
const root=(process.env.WOLF_JUDGE_URL||'https://wolf-braincore-evaluator.onrender.com').replace(/\/+$/,'');
const dir='artifacts/external-evidence-browser';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const errors=[],results=[];
async function run(name,fn){
 try{await fn();console.log('PASS '+name);results.push(name);}
 catch(e){errors.push(name+': '+String(e?.stack||e));console.error('FAIL '+name+': '+String(e?.stack||e));}
}
const pc=await browser.newPage({viewport:{width:1390,height:930},acceptDownloads:true});
pc.on('pageerror',error=>errors.push('PAGE_JS: '+error.message));
await run('external studio loads and never reaches any third-party host',async()=>{
 const forbidden=[];
 pc.on('request',req=>{if(!req.url().startsWith(root)&&!req.url().startsWith('data:'))forbidden.push(req.url())});
 const response=await pc.goto(root+'/external.html',{waitUntil:'domcontentloaded',timeout:65000});
 assert.equal(response?.status(),200);
 assert.equal(await pc.locator('h1').innerText(),'Compare real agent outputs.');
 await pc.getByRole('button',{name:'Load clearly labeled synthetic example'}).click();
 assert.match(await pc.locator('#baseline').inputValue(),/Synthetic baseline/);
 await pc.getByRole('button',{name:'Evaluate both outputs'}).click();
 await pc.locator('#outcome:not([hidden])').waitFor();
 const verdict=(await pc.locator('#verdict').innerText()).trim();
 assert.ok(['PROMOTE','HOLD','REJECT'].includes(verdict));
 assert.match(await pc.locator('#receipt').innerText(),/[a-f0-9]{64}/);
 assert.match(await pc.locator('#caveats').innerText(),/HUMAN REVIEW REQUIRED/);
 assert.equal(forbidden.length,0,'browser transmitted data to third party');
 const dlPromise=pc.waitForEvent('download');
 await pc.getByRole('button',{name:'Download SHA-256 evidence JSON'}).click();
 const dl=await dlPromise;
 assert.equal(dl.suggestedFilename(),'wolf-external-evidence.json');
 await pc.screenshot({path:dir+'/desktop-evaluation.png',fullPage:true});
});
await run('missing required constraint fails closed in real browser',async()=>{
 await pc.locator('#requirements').fill('CONSTRAINT_NOT_PRESENT_12345');
 await pc.getByRole('button',{name:'Evaluate both outputs'}).click();
 await pc.waitForFunction(()=>document.querySelector('#blockers')?.textContent?.includes('REQUIRED_CONSTRAINT_NOT_MENTIONED'));
 assert.notEqual((await pc.locator('#verdict').innerText()).trim(),'PROMOTE');
});
await run('malformed and malicious text does not execute script',async()=>{
 await pc.locator('#candidate').fill(JSON.stringify({goal:'<img src=x onerror="window.__xss=1">'}));
 await pc.getByRole('button',{name:'Evaluate both outputs'}).click();
 assert.equal(await pc.evaluate(()=>window.__xss),undefined);
 await pc.locator('#candidate').fill('{');
 await pc.getByRole('button',{name:'Evaluate both outputs'}).click();
 assert.match(await pc.locator('#errors').innerText(),/Cannot evaluate:/);
});
await run('mobile view fits viewport',async()=>{
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 mobile.on('pageerror',error=>errors.push('MOBILE_JS: '+error.message));
 await mobile.goto(root+'/external.html',{waitUntil:'domcontentloaded',timeout:65000});
 await mobile.getByRole('button',{name:'Load clearly labeled synthetic example'}).tap();
 await mobile.getByRole('button',{name:'Evaluate both outputs'}).tap();
 await mobile.locator('#outcome:not([hidden])').waitFor();
 assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),true);
 await mobile.screenshot({path:dir+'/mobile-evaluation.png',fullPage:true});
 await mobile.close();
});
await run('official competition demo remains stable and independently judgeable',async()=>{
 await pc.goto(root+'/?demo=1',{waitUntil:'domcontentloaded',timeout:65000});
 await pc.locator('#run').click();
 await pc.waitForFunction(()=>['PROMOTE','HOLD','REJECT'].includes(document.querySelector('#quickBadge')?.textContent));
 assert.equal(await pc.locator('#quickBadge').innerText(),'PROMOTE');
 assert.equal(await pc.locator('#scoreBaseline').innerText(),'50/100');
 assert.equal(await pc.locator('#scoreCandidate').innerText(),'94/100');
});
await pc.close();await browser.close();
if(errors.length){console.error(JSON.stringify({status:'FAIL',results,errors}));process.exitCode=1}
else console.log(JSON.stringify({status:'PASS',scenarios:results.length,realChromium:true,independentModelOutputsVerified:false,providerCalls:0,judgeStable:true}));
