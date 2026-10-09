// Live Chromium browser acceptance test. Run only in the dedicated GitHub Actions workflow.
// No paid models, browser credentials, payment calls, or third-party discovery scoring.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const BASE = (process.env.WOLF_JUDGE_URL || 'https://wolf-braincore-evaluator.onrender.com').replace(/\/+$/, '');
const DIR = 'artifacts/judge-browser';
await mkdir(DIR, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const failures = [];
const results = [];

async function scenario(name, run) {
  try {
    await run();
    results.push({ scenario: name, status: 'PASS' });
    console.log('PASS ' + name);
  } catch (error) {
    failures.push({ scenario: name, message: String(error?.stack || error) });
    console.error('FAIL ' + name + ': ' + String(error?.stack || error));
  }
}

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-GB' });
const page = await desktop.newPage();
page.setDefaultTimeout(15000);
const pageErrors = [];
page.on('pageerror', error => pageErrors.push(error.message));

async function openJudge(url = '/?demo=1') {
  const response = await page.goto(BASE + url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  assert.equal(response?.status(), 200, 'judge page HTTP 200 required');
  await page.locator('#request').waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('#request')?.value.length > 20);
}
async function submitAndReadDecision() {
  await page.locator('#run').click();
  await page.waitForFunction(() => ['PROMOTE','HOLD','REJECT'].includes(document.querySelector('#quickBadge')?.textContent));
  return (await page.locator('#quickBadge').innerText()).trim();
}

await scenario('desktop: canonical judge request, deterministic PROMOTE + SHA-256 receipt', async () => {
  await openJudge();
  assert.equal(await page.locator('#learningSkillsLink').isHidden(), true);
  assert.match(await page.locator('#request').inputValue(), /£100 budget/);
  assert.equal(await submitAndReadDecision(), 'PROMOTE');
  assert.equal(await page.locator('#scoreBaseline').innerText(), '50/100');
  assert.equal(await page.locator('#scoreCandidate').innerText(), '94/100');
  assert.equal(await page.locator('#scoreDelta').innerText(), '+44');
  await page.locator('#evidenceToggle').click();
  assert.equal(await page.locator('#evidenceToggle').getAttribute('aria-expanded'), 'true');
  const hash = (await page.locator('#receipt .receipt-hash code').innerText()).trim();
  assert.match(hash, /^[a-f0-9]{64}$/, 'real SHA-256 receipt required');
  await page.screenshot({ path: DIR + '/desktop-promote.png', fullPage: true });
});
await scenario('judge benchmark: eight fixed cases, eight expectations met', async () => {
  await page.locator('#benchmark').click();
  await page.locator('#benchmarkResults').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#benchmarkRows .benchmark-row').count(), 8);
  assert.match(await page.locator('#benchmarkSummary').innerText(), /8\/8/);
  await page.screenshot({ path: DIR + '/desktop-benchmark.png', fullPage: true });
});
await scenario('judge demo cannot be altered by injected learning skill query', async () => {
  await openJudge('/?demo=1&skill=error-simulator&lang=it');
  assert.equal(await page.locator('#learningSkillsLink').isHidden(), true);
  assert.equal(await submitAndReadDecision(), 'PROMOTE');
  assert.equal(await page.locator('#scoreCandidate').innerText(), '94/100');
  assert.doesNotMatch(await page.locator('#quickMeta').innerText(), /Learning skill/i);
});
await scenario('conflicting request cannot promote', async () => {
  await openJudge();
  await page.locator('[data-scenario="conflict"]').click();
  assert.equal(await submitAndReadDecision(), 'HOLD');
  assert.equal(await page.locator('#integrityStatus').innerText(), 'CONFLICTING');
  assert.match(await page.locator('#blockers').innerText(), /CRITICAL_REQUEST_CONFLICT/);
  await page.screenshot({ path: DIR + '/desktop-hold.png', fullPage: true });
});
await scenario('vague request pauses for clarification, no source-based scoring', async () => {
  // Mock optional third-party Discovery only; deterministic evaluator is the real live app.
  await page.route('https://wolf-discovery-api.onrender.com/**', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ webEnabled: false, webResults: [], visuals: [], partial: false })
  }));
  await openJudge();
  await page.locator('[data-scenario="vague"]').click();
  await page.locator('#run').click();
  await page.locator('#discoveryPanel').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#results').getAttribute('data-mode'), 'discovery');
  assert.equal(await page.locator('#benchmark').isHidden(), true);
  assert.equal(await page.locator('#clarifyRequest').isVisible(), true);
  await page.screenshot({ path: DIR + '/desktop-clarification.png', fullPage: true });
  await page.unrouteAll({ behavior: 'wait' });
});
await scenario('normal Learning Skills Pack composes localized pedagogical contract', async () => {
  const response = await page.goto(BASE + '/skills.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  assert.equal(response?.status(), 200);
  await page.locator('#skillsLanguage').selectOption('it');
  await page.locator('[data-use-skill="error-simulator"]').click();
  await page.locator('#skillTopic').fill('Colloquio cabin crew in inglese');
  await page.locator('#skillGoal').fill('Rispondere correttamente a cinque domande');
  await page.locator('#skillTime').fill('7 giorni');
  await page.locator('#skillLevel').fill('Esperienza in aeroporto, pratica con inglese base');
  await page.locator('#skillForm button[type="submit"]').click();
  await page.locator('#skillOutput').waitFor({ state: 'visible' });
  const request = await page.locator('#skillPrompt').innerText();
  assert.match(request, /cabin crew/i);
  assert.match(request, /errori|error|tentativ/i);
  const url = new URL(await page.locator('#openInWolf').getAttribute('href'));
  assert.equal(url.searchParams.get('skill'), 'error-simulator');
  assert.equal(url.searchParams.get('lang'), 'it');
  await page.screenshot({ path: DIR + '/skills-italian.png', fullPage: true });
});

const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 1,
  isMobile: true, hasTouch: true, locale: 'en-GB'
});
const mobilePage = await mobile.newPage();
mobilePage.setDefaultTimeout(15000);
await scenario('mobile judge renders, works by touch and does not overflow horizontally', async () => {
  const response = await mobilePage.goto(BASE + '/?demo=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
  assert.equal(response?.status(), 200);
  await mobilePage.locator('#run').tap();
  await mobilePage.waitForFunction(() => document.querySelector('#quickBadge')?.textContent === 'PROMOTE');
  assert.equal(await mobilePage.locator('#quickBadge').innerText(), 'PROMOTE');
  const dimensions = await mobilePage.evaluate(() => ({ doc: document.documentElement.scrollWidth, view: window.innerWidth }));
  assert.ok(dimensions.doc <= dimensions.view + 3, 'horizontal overflow: ' + JSON.stringify(dimensions));
  await mobilePage.screenshot({ path: DIR + '/mobile-promote.png', fullPage: true });
});

await desktop.close();
await mobile.close();
await browser.close();
assert.deepEqual(pageErrors, [], 'uncaught page errors');
console.log(JSON.stringify({ ok: failures.length === 0, base: BASE, results, failures }, null, 2));
assert.equal(failures.length, 0, 'one or more live browser acceptance scenarios failed');
