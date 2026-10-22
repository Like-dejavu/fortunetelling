/* 粗查 SVG 坐标是否落在 viewBox 内（掌图 / 面图） */
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.resolve(__dirname, '../xuanjian/assets/js/views/xiang.js'), 'utf8');
const svgs = [...src.matchAll(/viewBox="([^"]+)"[\s\S]{0,60}?/g)].map(m => m[1]);
console.log('viewBoxes:', svgs.join(' ; '));
const nums = [...src.matchAll(/(?:d|points)="([^"]+)"/g)].map(m => m[1]).join(' ');
const coords = [...nums.matchAll(/-?\d+(?:\.\d+)?/g)].map(Number);
console.log('numeric tokens:', coords.length, 'min', Math.min(...coords), 'max', Math.max(...coords));
// 逐条 path 的绝对坐标范围
const paths = [...src.matchAll(/d="([^"]+)"/g)].map(m => m[1]);
let bad = 0;
paths.forEach((d, i) => {
  const c = [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map(Number);
  const mn = Math.min(...c), mx = Math.max(...c);
  if (mn < -20 || mx > 340) { bad++; if (bad <= 6) console.log('  path#' + i + ' range', mn, mx); }
});
console.log('paths:', paths.length, 'out-of-range:', bad);
