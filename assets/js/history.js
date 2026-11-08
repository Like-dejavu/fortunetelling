/* ============================================================
   玄鉴 · 查询历史  window.XJHistory
   纯本地：只写浏览器 localStorage，不上传、不发请求、不采集身份信息。
   若 localStorage 不可用（无痕模式 / 某些 file:// 环境），自动退化为内存存储。
   ============================================================ */
(function (root) {
  'use strict';
  var H = {};
  var KEY = 'xuanjian.history.v1';
  var MAX = 300;          /* 最多保留条数 */
  var MERGE_MS = 4000;    /* 同键且 4 秒内的连续事件合并为一次查询 */
  var mem = [];
  var persistent = null;

  /* ---------------- 存储 ---------------- */
  function usable() {
    if (persistent !== null) return persistent;
    try {
      var ls = root.localStorage;
      if (!ls) { persistent = false; return false; }
      var probe = '__xj_probe__';
      ls.setItem(probe, '1'); ls.removeItem(probe);
      persistent = true;
    } catch (e) { persistent = false; }
    return persistent;
  }

  function all() {
    if (usable()) {
      try {
        var v = JSON.parse(root.localStorage.getItem(KEY) || '[]');
        return Object.prototype.toString.call(v) === '[object Array]' ? v : [];
      } catch (e) { return mem.slice(); }
    }
    return mem.slice();
  }

  function save(list) {
    if (usable()) {
      try { root.localStorage.setItem(KEY, JSON.stringify(list)); return true; }
      catch (e) { mem = list.slice(); return false; }
    }
    mem = list.slice();
    return false;
  }

  /* ---------------- 元数据 ---------------- */
  function fnOf(id) {
    var f = null;
    if (root.XJIntent && root.XJIntent.functions) {
      root.XJIntent.functions.forEach(function (x) { if (x.id === id) f = x; });
    }
    return f || { id: id, name: id, gl: '·', group: '其他' };
  }

  function cut(s, n) {
    s = String(s == null ? '' : s).replace(/[\r\n]+/g, ' ');
    return s.length > n ? s.slice(0, n) + '…' : s;
  }

  /* 同一查询的判定：功能 + 关键参数 */
  var KEY_FIELDS = ['date', 'time', 'hour', 'gender', 'q', 'item', 'n1', 'n2', 'mode', 'chapter'];
  function keyOf(e) {
    var p = e.params || {};
    return e.route + '|' + (e.arg || '') + '|' + KEY_FIELDS.map(function (k) {
      return p[k] == null ? '' : String(p[k]);
    }).join('|');
  }

  function hashFor(e) {
    if (e.hash) return e.hash;
    var p = {}, k;
    for (k in (e.params || {})) if (Object.prototype.hasOwnProperty.call(e.params, k)) p[k] = e.params[k];
    if (e.text) p._q = e.text;
    var qs = root.XJIntent ? root.XJIntent.queryOf(p) : '';
    return '#/' + e.route + (e.arg ? '/' + encodeURIComponent(e.arg) : '') + (qs ? '?' + qs : '');
  }

  /* 依据表单值生成一句人能看懂的摘要 */
  function describe(route, p, arg) {
    var s = [];
    p = p || {};
    switch (route) {
      case 'bazi': case 'heluo':
        if (p.date) s.push(p.date); if (p.time) s.push(p.time); if (p.gender) s.push(p.gender);
        break;
      case 'ziwei':
        if (p.date) s.push(p.date); if (p.hour != null) s.push('时支序 ' + p.hour); if (p.gender) s.push(p.gender);
        break;
      case 'huangli':
        if (p.item) s.push('择「' + p.item + '」');
        if (p.date || p.from) s.push((p.date || p.from) + ' 起');
        break;
      case 'liuyao':
        if (p.q) s.push('问「' + p.q + '」'); if (p.date) s.push(p.date);
        break;
      case 'meihua':
        if (p.mode === 'num' && p.n1 != null) s.push('数字 ' + p.n1 + '、' + p.n2);
        else if (p.date) s.push('时间起卦 ' + p.date);
        if (p.q) s.push('问「' + p.q + '」');
        break;
      case 'dream':
        if (arg || p.q) s.push('检索「' + (arg || p.q) + '」');
        break;
      case 'daodejing':
        if (arg) s.push('第 ' + arg + ' 章'); else if (p.q) s.push('检索「' + p.q + '」');
        break;
      case 'palm':
        if (p.shape) s.push('手形 ' + p.shape); if (p['天纹']) s.push('天纹 ' + p['天纹']);
        break;
      case 'face':
        if (p.santing) s.push('三停 ' + p.santing); if (p['鼻']) s.push('鼻 ' + p['鼻']);
        break;
    }
    return s.length ? s.join(' · ') : '推算一次';
  }

  /* ---------------- 对外 API ---------------- */
  H.all = all;
  H.available = usable;
  H.max = MAX;

  H.add = function (e0) {
    if (!e0 || !e0.route) return null;
    if (e0.route === 'home' || e0.route === 'mine' || e0.route === 'about') return null;
    var f = fnOf(e0.route);
    var e = {
      route: e0.route,
      title: e0.title || f.name,
      gl: e0.gl || f.gl,
      group: e0.group || f.group,
      text: cut(e0.text || '', 120),
      summary: cut(e0.summary || describe(e0.route, e0.params, e0.arg), 100),
      arg: e0.arg || '',
      params: e0.params || {},
      hash: e0.hash || '',
      source: e0.source || 'form',
      t: e0.t || Date.now()
    };
    e.hash = hashFor(e);
    var list = all();
    var k = keyOf(e);
    var first = list[0];

    /* 主界面问句跳转 → 目标页自动填表 → 自动推算，可能连着触发多个表单，
       这是同一次查询，合并之；隔了较久或参数不同者才另记一条 */
    var sameKey = first && first.key === k;
    var chained = first && first.route === e.route && first.source === 'ask' &&
      e.source === 'form' && (e.t - first.t) < 1200;
    if (first && (sameKey || chained) && Math.abs(e.t - first.t) < MERGE_MS) {
      if (e.text && (!first.text || e.text.length > first.text.length)) first.text = e.text;
      if (e.summary && first.summary === '推算一次') first.summary = e.summary;
      if (e.source === 'ask') first.source = 'ask';
      if (!first.hash) first.hash = e.hash;
      first.t = Math.max(first.t, e.t);
      first.times = (first.times || 1);
      save(list);
      return first;
    }

    e.id = 'h' + e.t.toString(36) + Math.random().toString(36).slice(2, 6);
    e.key = k;
    e.times = 1;
    list.unshift(e);
    if (list.length > MAX) list.length = MAX;
    save(list);
    return e;
  };

  H.track = H.add;

  H.remove = function (id) {
    var list = all().filter(function (x) { return x.id !== id; });
    save(list);
    return list;
  };

  H.clear = function () { mem = []; save([]); };

  H.stats = function () {
    var list = all(), count = {}, top = null, topN = 0, today = 0;
    var d = new Date(); d.setHours(0, 0, 0, 0);
    list.forEach(function (x) {
      count[x.route] = (count[x.route] || 0) + 1;
      if (x.t >= d.getTime()) today++;
    });
    Object.keys(count).forEach(function (k) { if (count[k] > topN) { topN = count[k]; top = k; } });
    return {
      total: list.length,
      kinds: Object.keys(count).length,
      today: today,
      last: list.length ? list[0].t : 0,
      top: top ? fnOf(top).name : '—',
      topN: topN
    };
  };

  H.export = function (fmt) {
    var list = all();
    if (fmt === 'csv') {
      var rows = ['时间,功能,所问,摘要,链接'];
      list.forEach(function (x) {
        function c(v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }
        rows.push([new Date(x.t).toLocaleString('zh-CN'), x.title, x.text, x.summary, x.hash].map(c).join(','));
      });
      return '\ufeff' + rows.join('\r\n');
    }
    return JSON.stringify({ app: '玄鉴', version: 1, exportedAt: new Date().toISOString(), items: list }, null, 2);
  };

  /* ---------------- 自动埋点（全局委托，不改动任何功能页） ---------------- */
  var FORM_ROUTE = {
    'bz-form': 'bazi', 'zw-form': 'ziwei', 'hl2-form': 'heluo',
    'hl-form': 'huangli', 'zr-form': 'huangli', 'mh-form': 'meihua',
    'ly-form': 'liuyao', 'palm-form': 'palm', 'face-form': 'face'
  };

  function formParams(form) {
    var p = {}, els = (form && form.querySelectorAll) ? form.querySelectorAll('[name]') : [];
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!el.name) continue;
      if (el.type === 'radio') { if (el.checked) p[el.name] = el.value; }
      else if (el.type !== 'submit' && el.type !== 'button') p[el.name] = el.value;
    }
    return p;
  }

  function routeNow() {
    if (root.XJApp && root.XJApp.currentRoute) return root.XJApp.currentRoute().id;
    var h = (root.location && root.location.hash || '').replace(/^#\/?/, '').split(/[/?]/)[0];
    return h || 'home';
  }

  function recordForm(form) {
    var route = FORM_ROUTE[form.id || ''];
    if (!route) return;
    var p = formParams(form);
    H.add({ route: route, params: p, summary: describe(route, p, ''), source: 'form' });
  }

  function recordDream(q) {
    var v = String(q || '').replace(/^\s+|\s+$/g, '');
    if (!v) return;
    H.add({ route: 'dream', arg: v, params: { q: v }, summary: describe('dream', { q: v }, v), source: 'form' });
  }

  function recordChapter(no, text) {
    H.add({ route: 'daodejing', arg: String(no), params: {}, summary: describe('daodejing', {}, no), source: 'form', text: text || '' });
  }

  if (root.document && root.document.addEventListener) {
    var doc = root.document;

    /* 所有推算表单 */
    doc.addEventListener('submit', function (e) {
      var form = e && e.target;
      if (form && form.id && form.id !== 'portal-form') recordForm(form);
    }, true);

    /* 解梦检索、道德经章节、代为摇卦等非表单交互 */
    doc.addEventListener('click', function (e) {
      var t = e && e.target;
      if (!t) return;
      var el = t.closest ? t.closest('#dream-btn, .dream-cat-btn, .chapter-list a, .dd-hit, #ly-cast') : null;
      if (!el) return;
      if (el.id === 'dream-btn') {
        var q = doc.getElementById('dream-q');
        recordDream(q ? q.value : '');
      } else if (el.id === 'ly-cast') {
        var f = doc.getElementById('ly-form');
        var p = formParams(f);
        H.add({ route: 'liuyao', params: p, summary: '代为摇卦 · ' + describe('liuyao', p, ''), source: 'form' });
      } else if (el.className && String(el.className).indexOf('dream-cat-btn') >= 0) {
        H.add({ route: 'dream', params: { q: el.textContent || '' }, summary: '浏览梦象分类 · ' + cut(el.textContent || '', 20), source: 'form' });
      } else if (el.getAttribute('data-no')) {
        recordChapter(el.getAttribute('data-no'), '');
      }
    }, true);

    /* 解梦 / 道德经检索框回车 */
    doc.addEventListener('keydown', function (e) {
      if (!e || e.key !== 'Enter' || !e.target) return;
      var t = e.target;
      if (t.id === 'dream-q') recordDream(t.value);
      else if (t.id === 'dd-q') {
        var v = String(t.value || '').replace(/^\s+|\s+$/g, '');
        if (v) H.add({ route: 'daodejing', params: { q: v }, summary: describe('daodejing', { q: v }, ''), source: 'form' });
      }
    }, true);
  }

  root.XJHistory = H;
  if (typeof module !== 'undefined' && module.exports) module.exports = H;
}(typeof window !== 'undefined' ? window : this));
