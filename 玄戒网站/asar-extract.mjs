import fs from 'node:fs';
import path from 'node:path';

const asar = 'E:\\deepseekharness\\resources\\app.asar';
const outDir = process.argv[3] ?? 'D:\\Users\\刘攀\\Documents\\deepseek-harness\\default-workspace\\asar-out';

const fd = fs.openSync(asar, 'r');
const sizeBuf = Buffer.alloc(8);
fs.readSync(fd, sizeBuf, 0, 8, 0);
const headerPickleSize = sizeBuf.readUInt32LE(4);
const sizeBuf2 = Buffer.alloc(8);
fs.readSync(fd, sizeBuf2, 0, 8, 8);
const headerSize = sizeBuf2.readUInt32LE(4);
const headerBuf = Buffer.alloc(headerSize);
fs.readSync(fd, headerBuf, 0, headerSize, 16);
const header = JSON.parse(headerBuf.toString('utf8'));
const baseOffset = 8 + headerPickleSize;

function walk(node, prefix, cb) {
  for (const [name, entry] of Object.entries(node.files ?? {})) {
    const p = prefix ? `${prefix}/${name}` : name;
    if (entry.files) walk(entry, p, cb);
    else cb(p, entry);
  }
}

const files = [];
walk(header, '', (p, e) => files.push({ path: p, size: e.size, offset: e.offset }));

if (process.argv[2] === 'list') {
  const re = new RegExp(process.argv[4] ?? '.', 'i');
  console.log(files.filter((f) => re.test(f.path)).map((f) => `${f.size}\t${f.path}`).join('\n'));
} else if (process.argv[2] === 'cat') {
  const target = process.argv[4];
  const entry = files.find((f) => f.path === target);
  if (!entry) { console.error('not found: ' + target); process.exit(1); }
  const buf = Buffer.alloc(entry.size);
  fs.readSync(fd, buf, 0, entry.size, baseOffset + Number(entry.offset));
  process.stdout.write(buf.toString('utf8'));
} else if (process.argv[2] === 'grep') {
  const re = new RegExp(process.argv[4], 'i');
  const scope = new RegExp(process.argv[5] ?? '\\.(js|mjs|cjs|json|yml|yaml|html|css)$', 'i');
  for (const f of files) {
    if (f.size > 30_000_000 || !scope.test(f.path)) continue;
    const buf = Buffer.alloc(f.size);
    fs.readSync(fd, buf, 0, f.size, baseOffset + Number(f.offset));
    const text = buf.toString('utf8');
    if (re.test(text)) {
      const lines = text.split('\n');
      lines.forEach((line, i) => {
        if (re.test(line)) console.log(`${f.path}:${i + 1}: ${line.trim().slice(0, 220)}`);
      });
    }
  }
}
fs.closeSync(fd);
