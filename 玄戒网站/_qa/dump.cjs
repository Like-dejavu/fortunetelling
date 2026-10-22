/* 导出各页渲染结果，便于人工审阅 */
const fs = require('fs');
const path = require('path');
const BASE = path.resolve(__dirname, '..', 'xuanjian');
const OUT = __dirname;

function FakeEl(id) {
  this.id = id; this._html = ''; this._listeners = {}; this.value = '';
  this.selectedIndex = 0; this.options = [{ value: 'x' }];
  this.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
  this.style = {};
}
FakeEl.prototype.addEventListener = function (ev, fn) { (this._listeners[ev] = this._listeners[ev] || []).push(fn); };
FakeEl.prototype.fire = function (t, extra) { (this._listeners[t] || []).forEach(f => f(Object.assign({ type: t, preventDefault() {}, target: this }, extra || {}))); };
FakeEl.prototype.querySelector = function (sel) {
  const m = /\[name="([^"]+)"\]/.exec(sel || '');
  if (m && m[1]) return ctl(m[1]);
  return null;
};
FakeEl.prototype.querySelectorAll = function () { return []; };
Object.defineProperty(FakeEl.prototype, 'innerHTML', { get() { return this._html; }, set(v) { this._html = String(v); } });

const DEF = {
  date: '1990-06-17', time: '10:30', hour: '5', gender: '女', ziRule: 'late', ts: '1', lon: '116.4',
  shape: '土', '天纹': '长而秀', '人纹': '深而明', '地纹': '长而秀', qiu: '金星丘', se: '红润',
  santing: '上停匀', '眉': '清秀而长', '眼': '黑白分明', '鼻': '准头丰隆', '口': '唇厚而方', '耳': '厚大贴脑',
  qise: '明润', n1: '7', n2: '13', q: '求财谋事', mode: 'time', y0: '7', y1: '8', y2: '9', y3: '7', y4: '8', y5: '9',
  li: '1', jie: '1', kw: ''
};
const cache = {};
function ctl(name) {
  if (!cache[name]) { const e = new FakeEl('ctl-' + name); if (DEF[name] !== undefined) e.value = DEF[name]; cache[name] = e; }
  return cache[name];
}
const store = {};
const document = {
  getElementById(id) { return store[id] || (store[id] = new FakeEl(id)); },
  querySelector() { return null; }, querySelectorAll() { return []; },
  createElement() { return new FakeEl('tmp'); }, addEventListener() {}
};
const win = { document, location: { hash: '#/home' }, scrollTo() {}, addEventListener() {} };
win.window = win;
global.window = win; global.document = document; global.location = win.location;
global.MouseEvent = function (t, o) { return Object.assign({ type: t }, o); };

['lib/calendar', 'lib/lunar', 'lib/bazi', 'lib/liuyao', 'lib/meihua', 'lib/ziwei', 'lib/heluo', 'lib/xiang',
  'data/hexagrams', 'data/dreams', 'data/daodejing', 'app',
  'views/home', 'views/bazi', 'views/divine', 'views/ziwei', 'views/xiang', 'views/dream', 'views/daodejing'
].forEach(l => require(path.join(BASE, 'assets/js', l + '.js')));

const App = win.XJApp;
['home', 'huangli', 'bazi', 'liuyao', 'meihua', 'ziwei', 'heluo', 'dream', 'palm', 'face', 'daodejing', 'about'].forEach(id => {
  const def = App.pages[id];
  const html = def.render('');
  let after = '';
  try { def.after && def.after(''); } catch (e) { after = '<pre style="color:red">AFTER ERROR: ' + e.message + '\n' + e.stack + '</pre>'; }
  const outs = Object.keys(store).filter(k => /-out$/.test(k)).map(k => '<div class="OUT" data-id="' + k + '">' + store[k]._html + '</div>').join('\n');
  fs.writeFileSync(path.join(OUT, 'page-' + id + '.html'),
    '<!DOCTYPE html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../xuanjian/assets/css/style.css"></head><body><div id="app">' + html + outs + after + '</div></body></html>', 'utf8');
  console.log(id, html.length, 'outs', outs.length);
});
console.log('done');
