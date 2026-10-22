/* 假 DOM 冒烟测试：跑通所有视图的 render() 与 after() */
const path = require('path');
const BASE = path.resolve(__dirname, '..', 'xuanjian');

function FakeEl(id) {
  this.id = id; this._html = ''; this._listeners = {};
  this.value = DEF[id] !== undefined ? DEF[id] : '';
  this.selectedIndex = 0;
  this.options = [{ value: 'x' }, { value: 'y' }];
  this.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
  this.style = {};
}
FakeEl.prototype.addEventListener = function (ev, fn) { (this._listeners[ev] = this._listeners[ev] || []).push(fn); };
FakeEl.prototype.dispatchEvent = function (ev) { const t = ev.type || ev; (this._listeners[t] || []).forEach(f => f({ type: t, preventDefault() {}, target: this, key: '' })); };
FakeEl.prototype.fire = function (t, extra) { (this._listeners[t] || []).forEach(f => f(Object.assign({ type: t, preventDefault() {}, target: this }, extra || {}))); };
FakeEl.prototype.querySelector = function (sel) {
  const m = /\[name="([^"]+)"\]/.exec(sel || '');
  if (m && m[1]) return ctl(m[1]);
  return null;
};
FakeEl.prototype.querySelectorAll = function () { return []; };
FakeEl.prototype.appendChild = function () {};
Object.defineProperty(FakeEl.prototype, 'innerHTML', { get() { return this._html; }, set(v) { this._html = String(v); } });

const DEF = {
  date: '1990-06-17', time: '10:30', hour: '5', gender: '女', ziRule: '晚子',
  longitude: '116.4', truesolar: 'on', shape: '土', '天纹': '长而秀', '人纹': '深而明', '地纹': '长而秀',
  qiu: '均平', se: '红润', santing: '上停匀', '眉': '清秀而长', '眼': '黑白分明', '鼻': '准头丰隆', '口': '唇厚而方', '耳': '厚大贴脑',
  qise: '明润', vals: '7', question: '求财', method: 'time', n1: '7', n2: '13', q: '求财', mode: 'time', ts: '1', lon: '116.4'
};
const ctlCache = {};
function ctl(name) {
  if (!ctlCache[name]) {
    const e = new FakeEl('ctl-' + name);
    if (DEF[name] !== undefined) e.value = DEF[name];
    if (/^y\d$/.test(name)) e.value = '7';
    ctlCache[name] = e;
  }
  return ctlCache[name];
}

const store = {};
const document = {
  getElementById(id) { return store[id] || (store[id] = new FakeEl(id)); },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  createElement() { return new FakeEl('tmp'); },
  addEventListener() {}
};
const win = { document, location: { hash: '#/home' }, scrollTo() {}, addEventListener() {}, navigator: {} };
win.window = win;
global.window = win; global.document = document; global.location = win.location;
global.MouseEvent = function (t, o) { return Object.assign({ type: t }, o); };
global.setTimeout = setTimeout; global.clearTimeout = clearTimeout;

/* 直接按 index.html 的 <script src> 顺序加载，保证与真实页面一致 */
const fs = require('fs');
const idxHtml = fs.readFileSync(path.join(BASE, 'index.html'), 'utf8');
const srcs = [...idxHtml.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
if (!srcs.length) throw new Error('index.html 未找到 <script src>');
srcs.forEach(s => { require(path.join(BASE, s)); });
console.log('loaded scripts:', srcs.length, srcs.map(s => s.replace('assets/js/', '')).join(', '));

const App = win.XJApp;
const ids = ['home', 'huangli', 'bazi', 'liuyao', 'meihua', 'ziwei', 'heluo', 'dream', 'palm', 'face', 'daodejing', 'about'];
let problems = [];
let ddSaved = '';
ids.forEach(id => {
  const def = App.pages[id];
  if (!def) { problems.push(id + ': 未注册'); return; }
  let html = '';
  try { html = def.render(''); } catch (e) { problems.push(id + ': render 抛错 ' + e.message); return; }
  if (typeof html !== 'string') { problems.push(id + ': render 非字符串'); return; }
  ['undefined', 'NaN', '[object', 'null，', '>null<'].forEach(bad => {
    if (html.indexOf(bad) >= 0) {
      const i = html.indexOf(bad);
      problems.push(id + ': 含 ' + bad + ' @ ' + JSON.stringify(html.slice(Math.max(0, i - 60), i + 40)));
    }
  });
  let afterErr = '';
  try { if (def.after) def.after(''); } catch (e) { afterErr = e.stack.split('\n').slice(0, 3).join(' | '); }
  if (afterErr) problems.push(id + ': after 抛错 ' + afterErr);
  const outIds = Object.keys(store).filter(k => /-out$/.test(k) && store[k]._html.length);
  const outs = outIds.map(k => k + '=' + store[k]._html.length).join(',');
  if (store['dd-out'] && store['dd-out']._html.length) {
    const h = store['dd-out']._html;
    ddSaved = h;
    console.log('   daodejing ch1:', /第1章/.test(h) ? 'ok' : 'MISSING', h.length);
  }
  console.log(id.padEnd(10), 'html=' + String(html.length).padStart(6), afterErr ? 'ERR' : 'ok  ', outs);
  Object.keys(store).forEach(k => { if (/-out$/.test(k)) store[k]._html = ''; });
});

/* 解梦检索：手动触发 input 监听 */
try {
  const q = store['dream-q'];
  if (q && q._listeners.input) {
    q.value = '蛇';
    q.fire('input');
    // 防抖：直接调用一次 keydown Enter 路径
    q.fire('keydown', { key: 'Enter' });
    const html = store['dream-out']._html;
    console.log('dream search 蛇 ->', html.length, 'bytes', /<div class="dream-item">/.test(html) ? 'items=' + (html.match(/dream-item/g) || []).length : 'NO ITEMS');
    if (html.indexOf('undefined') >= 0) problems.push('dream: 检索结果含 undefined');
  } else problems.push('dream: 未绑定 input');
} catch (e) { problems.push('dream 检索异常 ' + e.message); }

/* 道德经：章节渲染（取渲染当时的快照，避免后续页面重置 store） */
try {
  const html = ddSaved || store['dd-out']._html;
  console.log('daodejing out ->', html.length, /第1章/.test(html) ? 'ch1 ok' : 'ch1 MISSING');
  if (!/第1章/.test(html)) problems.push('daodejing: 未渲染首章');
} catch (e) { problems.push('daodejing 异常 ' + e.message); }

console.log('\n=== problems:', problems.length, '===');
problems.forEach(p => console.log(' -', p));

