// Record the real public, deterministic WOLF judge. Never simulate decisions or edit page DOM.
import assert from 'node:assert/strict';
import { mkdir, copyFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const BASE = (process.env.WOLF_JUDGE_URL || 'https://wolf-braincore-evaluator.onrender.com').replace(/\/+$/, '');
const OUT = 'artifacts/wolf-judge-video';
await mkdir(OUT + '/tmp', { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: OUT + '/tmp', size: { width: 1280, height: 720 } },
  locale: 'en-GB', deviceScaleFactor: 1,
});
const page = await context.newPage();
page.setDefaultTimeout(15000);
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const pause = ms => page.waitForTimeout(ms);

try {
  const response = await page.goto(BASE + '/?demo=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
  assert.equal(response?.status(), 200);
  await page.locator('#request').waitFor({ state: 'visible' });
  assert.match(await page.locator('#request').inputValue(), /£100 budget/);
  assert.equal(await page.locator('#learningSkillsLink').isHidden(), true);
  await pause(6500);

  await page.locator('#run').click();
  await page.waitForFunction(() => document.querySelector('#quickBadge')?.textContent === 'PROMOTE');
  assert.equal(await page.locator('#scoreBaseline').innerText(), '50/100');
  assert.equal(await page.locator('#scoreCandidate').innerText(), '94/100');
  await pause(13000);

  await page.locator('#evidenceToggle').click();
  await page.locator('#scoreBaseline').scrollIntoViewIfNeeded();
  await pause(10000);
  await page.locator('#receipt').scrollIntoViewIfNeeded();
  assert.match((await page.locator('#receipt .receipt-hash code').innerText()).trim(), /^[a-f0-9]{64}$/);
  await pause(12000);

  await page.locator('#benchmark').click();
  await page.locator('#benchmarkResults').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#benchmarkRows .benchmark-row').count(), 8);
  assert.match(await page.locator('#benchmarkSummary').innerText(), /8\/8/);
  await pause(13000);

  await page.locator('#back').click();
  await pause(3000);
  await page.locator('[data-scenario="conflict"]').click();
  await page.locator('#run').click();
  await page.waitForFunction(() => document.querySelector('#quickBadge')?.textContent === 'HOLD');
  assert.equal(await page.locator('#integrityStatus').innerText(), 'CONFLICTING');
  await pause(11000);

  await page.locator('#evidenceToggle').click();
  await page.locator('#blockers').scrollIntoViewIfNeeded();
  assert.match(await page.locator('#blockers').innerText(), /CRITICAL_REQUEST_CONFLICT/);
  await pause(12000);

  await page.locator('#back').click();
  await pause(8000);
  assert.deepEqual(errors, [], 'no uncaught browser page exceptions');
} finally {
  const recording = page.video();
  await context.close();
  await browser.close();
  if (recording) {
    const rawPath = await recording.path();
    await copyFile(rawPath, OUT + '/wolf-judge-demo-raw.webm');
  }
}
console.log(JSON.stringify({ ok: true, url: BASE + '/?demo=1', recording: OUT + '/wolf-judge-demo-raw.webm', note: 'Unaltered public browser interactions: PROMOTE, evidence SHA-256, 8-case benchmark, HOLD on conflict; captions applied only after capture.' }));
