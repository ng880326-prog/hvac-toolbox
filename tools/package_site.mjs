// tools/package_site.mjs — build / verify the store-submission copy of the app.
//
// app/ is the only source of truth: tools/serve.js serves it, GitHub Pages deploys it, and
// capacitor.config.json points its webDir at it. dist/hvac-toolbox-site/ is a byte-for-byte mirror
// produced here, because the Microsoft Store / Google Play submissions upload a folder or zip.
// That mirror silently rotted once — it was missing privacy.html (an instant store rejection),
// js/data/vectors.js and js/modules/validate.js, and still shipped the old engine whose
// Hyland-Wexler ice coefficient was 1000x off. Nothing detected it, because nothing compared.
//
// Usage:
//   node tools/package_site.mjs           rebuild the mirror + zip, print a summary
//   node tools/package_site.mjs --check   fail (exit 1) if the mirror differs from app/
//   node tools/package_site.mjs --zip     rebuild the zip only
//
// Zero dependencies: the zip writer below emits stored/deflated entries with a real CRC-32, so no
// external archiver is required on any platform.

import { createHash } from 'node:crypto';
import { deflateRawSync } from 'node:zlib';
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const SRC = join(ROOT, 'app');
const MIRROR = join(ROOT, 'dist', 'hvac-toolbox-site');
const ZIP = join(ROOT, 'dist', 'hvac-toolbox-site.zip');
const MANIFEST = join(ROOT, 'docs', 'verification', 'dist_manifest.json');

const args = new Set(process.argv.slice(2));
const CHECK = args.has('--check');

/** Sorted relative paths of every file under dir, using forward slashes. */
async function walk(dir, base = dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full, base));
    else out.push(relative(base, full).split(sep).join('/'));
  }
  return out.sort();
}

async function digestOf(file) {
  return createHash('sha256').update(await readFile(file)).digest('hex');
}

/** Map of relative path -> sha256 for a whole tree. */
async function treeDigests(dir) {
  const map = new Map();
  for (const rel of await walk(dir)) map.set(rel, await digestOf(join(dir, rel)));
  return map;
}

// --- minimal zip (deflate) -------------------------------------------------
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function dosStamp(date) {
  const time = ((date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)) & 0xffff;
  const day = (((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()) & 0xffff;
  return { time, day };
}

async function makeZip(dir, outFile) {
  const names = await walk(dir);
  const locals = [];
  const central = [];
  let offset = 0;

  for (const name of names) {
    const raw = await readFile(join(dir, name));
    const crc = crc32(raw);
    const deflated = deflateRawSync(raw, { level: 9 });
    const body = deflated.length < raw.length ? deflated : raw;
    const method = deflated.length < raw.length ? 8 : 0;
    const nameBuf = Buffer.from(name, 'utf8');
    const stamp = dosStamp((await stat(join(dir, name))).mtime);

    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);          // UTF-8 names
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(stamp.time, 10);
    local.writeUInt16LE(stamp.day, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    nameBuf.copy(local, 30);
    locals.push(local, body);

    const cd = Buffer.alloc(46 + nameBuf.length);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0x0800, 8);
    cd.writeUInt16LE(method, 10);
    cd.writeUInt16LE(stamp.time, 12);
    cd.writeUInt16LE(stamp.day, 14);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(body.length, 20);
    cd.writeUInt32LE(raw.length, 24);
    cd.writeUInt16LE(nameBuf.length, 28);
    cd.writeUInt32LE(0, 38);                 // external attributes
    cd.writeUInt32LE(offset, 42);
    nameBuf.copy(cd, 46);
    central.push(cd);

    offset += local.length + body.length;
  }

  const cdBuf = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(names.length, 8);
  eocd.writeUInt16LE(names.length, 10);
  eocd.writeUInt32LE(cdBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);

  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, Buffer.concat([...locals, cdBuf, eocd]));
  return names.length;
}

// --- main ------------------------------------------------------------------
const appFiles = await treeDigests(SRC);

if (CHECK) {
  let mirror = new Map();
  try {
    mirror = await treeDigests(MIRROR);
  } catch {
    console.error('✘ dist/hvac-toolbox-site/ is missing — run: node tools/package_site.mjs');
    process.exit(1);
  }
  const missing = [...appFiles.keys()].filter((f) => !mirror.has(f));
  const extra = [...mirror.keys()].filter((f) => !appFiles.has(f));
  const changed = [...appFiles.keys()].filter((f) => mirror.has(f) && mirror.get(f) !== appFiles.get(f));
  if (missing.length || extra.length || changed.length) {
    console.error('✘ dist/ has drifted from app/ — run: node tools/package_site.mjs');
    if (missing.length) console.error('  missing in dist: ' + missing.join(', '));
    if (extra.length) console.error('  stale in dist  : ' + extra.join(', '));
    if (changed.length) console.error('  outdated       : ' + changed.join(', '));
    process.exit(1);
  }
  console.log(`✔ dist/ matches app/ (${appFiles.size} files)`);
  process.exit(0);
}

await rm(MIRROR, { recursive: true, force: true });
await cp(SRC, MIRROR, { recursive: true });
const mirrored = await treeDigests(MIRROR);
for (const [file, hash] of appFiles) {
  if (mirrored.get(file) !== hash) throw new Error('mirror mismatch after copy: ' + file);
}

let zipCount = 0;
if (args.has('--zip') || !args.size) zipCount = await makeZip(MIRROR, ZIP);

await mkdir(dirname(MANIFEST), { recursive: true });
await writeFile(MANIFEST, JSON.stringify({
  source: 'app/',
  mirror: 'dist/hvac-toolbox-site/',
  zip: 'dist/hvac-toolbox-site.zip',
  generatedBy: 'tools/package_site.mjs',
  files: Object.fromEntries([...appFiles.entries()].map(([k, v]) => [k, v.slice(0, 12)])),
}, null, 2) + '\n');

console.log(`✔ mirrored app/ -> dist/hvac-toolbox-site/ (${appFiles.size} files, ${zipCount} zipped)`);
console.log('  manifest: docs/verification/dist_manifest.json');
