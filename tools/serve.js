// HVAC Toolbox Pro — zero-dependency static server for local preview.
// Usage: node tools/serve.js [port]   (default 8080) — serves ./app
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..', 'app');
const PORT = Number(process.argv[2] || 8080);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

createServer(async (req, res) => {
  try {
    let url = decodeURIComponent((req.url || '/').split('?')[0]);
    if (url.endsWith('/')) url += 'index.html';
    const file = normalize(join(ROOT, url));
    if (!file.startsWith(ROOT)) throw new Error('forbidden');
    const data = await readFile(file);
    res.writeHead(200, {
      'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'Service-Worker-Allowed': '/',
    });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found — try http://localhost:' + PORT + '/index.html');
  }
}).listen(PORT, () => {
  console.log(`HVAC Toolbox Pro: http://localhost:${PORT}/`);
});
