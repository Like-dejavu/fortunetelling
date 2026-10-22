import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const file = 'D:/Users/刘攀/Documents/deepseek-harness/default-workspace/xuanjian/assets/js/data/dreams.js';
const CATS = require(file);

const errs = [];
const seen = new Map();
const dup = [];
const kws = [];
let total = 0;
const srcCount = { '原典': 0, '通行': 0, '演绎': 0 };
const gCount = { '吉': 0, '凶': 0, '中': 0 };

if (!Array.isArray(CATS)) errs.push('导出不是数组');
if (CATS.length < 12 || CATS.length > 14) errs.push(`分类数 ${CATS.length} 不在 12~14`);

const rows = [];
for (const cat of CATS) {
  const n = cat.items.length;
  total += n;
  rows.push({ id: cat.id, name: cat.name, n });
  if (n < 15 || n > 30) errs.push(`分类 ${cat.name}(${cat.id}) 条目数 ${n} 不在 15~30`);
  for (const it of cat.items) {
    if (!Array.isArray(it.k) || it.k.length < 2 || it.k.length > 4) {
      errs.push(`[${cat.name}] 关键词数量异常: ${JSON.stringify(it.k)}`);
    }
    for (const w of it.k) {
      kws.push(w);
      if (typeof w !== 'string' || w.length < 1 || /\s/.test(w) || w !== w.toLowerCase()) {
        errs.push(`[${cat.name}] 关键词格式异常: ${JSON.stringify(w)}`);
      }
      if (seen.has(w)) dup.push(`${w} -> ${seen.get(w)} / ${cat.name}`);
      else seen.set(w, cat.name);
    }
    if (!['吉', '凶', '中'].includes(it.g)) errs.push(`[${cat.name}] g 非法: ${it.g}`);
    else gCount[it.g]++;
    if (!['原典', '通行', '演绎'].includes(it.src)) errs.push(`[${cat.name}] src 非法: ${it.src}`);
    else srcCount[it.src]++;
    const len = [...it.t].length;
    if (len < 10 || len > 80) errs.push(`[${cat.name}] t 长度 ${len}: ${it.t}`);
    if (len < 30 || len > 60) errs.push(`[${cat.name}] t 超建议区间(30~60) 实际 ${len}: ${it.k[0]}`);
    if (it.src === '原典') {
      if (!it.quote) errs.push(`[${cat.name}] 原典缺 quote: ${it.k[0]}`);
      else {
        const qlen = [...it.quote].length;
        if (qlen > 20) errs.push(`[${cat.name}] quote 超 20 字: ${it.quote} (${qlen})`);
      }
    } else if (it.quote) {
      errs.push(`[${cat.name}] 非原典却带 quote: ${it.k[0]}`);
    }
  }
}

console.log('=== 分类条目数 ===');
for (const r of rows) console.log(`${r.id.padEnd(10)} ${r.name.padEnd(8)} ${String(r.n).padStart(3)}`);
console.log(`总条目数: ${total}`);
console.log(`分类数: ${CATS.length}`);
console.log('\n=== 吉凶分布 ===', JSON.stringify(gCount));
console.log('=== 来源分布 ===', JSON.stringify(srcCount));
console.log('原典占比:', (srcCount['原典'] / total * 100).toFixed(1) + '%');
console.log('通行占比:', (srcCount['通行'] / total * 100).toFixed(1) + '%');
console.log('演绎占比:', (srcCount['演绎'] / total * 100).toFixed(1) + '%');
console.log('关键词总数:', kws.length, '唯一:', new Set(kws).size);
console.log('\n=== 重复关键词 ===');
console.log(dup.length ? dup.join('\n') : '无');
console.log('\n=== 校验错误 ===');
console.log(errs.length ? errs.join('\n') : '无');
console.log('\n结果:', errs.length === 0 && dup.length === 0 && total >= 300 ? 'PASS' : 'FAIL');
