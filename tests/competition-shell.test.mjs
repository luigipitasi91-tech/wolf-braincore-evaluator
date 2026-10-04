import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('competition shell stays focused on the independent evaluator kernel', async () => {
  const [html, app] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../src/app.js', import.meta.url), 'utf8')
  ]);

  assert.match(html, /Should this AI change be promoted\?/);
  assert.match(html, /INDEPENDENT AI CHANGE GATE/);
  assert.match(html, /Run benchmark/);
  assert.match(html, /SHA-256 evidence receipt/);

  assert.doesNotMatch(html, /MARKET INTELLIGENCE|1001 FAILURE LAB|Live research/i);
  assert.doesNotMatch(app, /live-research|market-lens|adamo-lab/i);

  assert.match(app, /comparePlans/);
  assert.match(app, /runBenchmark/);
  assert.match(app, /wolf-braincore-receipt\/2\.0/);
});
