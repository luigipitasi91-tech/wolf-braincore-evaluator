import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

http.createServer(async (req, res) => {
  const rawPath = new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname;
  const requested = rawPath === '/' ? '/index.html' : rawPath;
  const safe = normalize(requested).replace(/^(\.\.(\/|\\|$))+/, '');
  const path = join(root, safe);
  if (!path.startsWith(root)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const body = await readFile(path);
    res.writeHead(200, {
      'content-type': types[extname(path)] || 'application/octet-stream',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff'
    });
    res.end(body);
  } catch {
    res.writeHead(404, {'content-type':'text/plain; charset=utf-8'}).end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`WOLF BrainCore Evaluator: http://127.0.0.1:${port}`);
});
