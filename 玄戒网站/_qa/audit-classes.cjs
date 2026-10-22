/* 静态审计：页面里用到的 class 是否都在 style.css 中定义 */
const fs = require('fs');
const path = require('path');
const BASE = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(BASE, 'xuanjian/assets/css/style.css'), 'utf8');
const files = ['home', 'huangli', 'bazi', 'liuyao', 'meihua', 'ziwei', 'heluo', 'dream', 'palm', 'face', 'daodejing', 'about'];
const used = new Map();
for (const f of files) {
  const p = path.join(__dirname, 'page-' + f + '.html');
  if (!fs.existsSync(p)) continue;
  const t = fs.readFileSync(p, 'utf8');
  const re = /class="([^"]+)"/g;
  let m;
  while ((m = re.exec(t))) {
    m[1].split(/\s+/).forEach(c => {
      if (!c) return;
      if (!used.has(c)) used.set(c, new Set());
      used.get(c).add(f);
    });
  }
}
const esc = c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const undef = [];
for (const [c, where] of used) {
  if (!new RegExp('\\.' + esc(c) + '(?![\\w-])').test(css)) undef.push(c + ' <' + [...where].join(',') + '>');
}
console.log('distinct classes in pages:', used.size);
console.log('未在 CSS 定义的 class:', undef.length ? '\n  ' + undef.join('\n  ') : '(none)');
