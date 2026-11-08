/* ============================================================
   玄鉴 · 应用外壳  window.XJApp
   极简哈希路由 + 视觉构件
   ============================================================ */
(function (root) {
  'use strict';
  var App = {};
  var pages = {};
  App.pages = pages;

  App.page = function (id, def) { pages[id] = def; };

  /* ---------------- 工具 ---------------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function h(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; }
  function on(el, ev, fn) { el.addEventListener(ev, fn); return el; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmtDate(d) { return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日'; }
  function fmtTime(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }

  /* ---------------- 视觉构件 ---------------- */
  var U = {};
  U.esc = esc;
  U.h = h;
  U.on = on;
  U.fmtDate = fmtDate;

  U.card = function (title, bodyHtml, tag) {
    return '<section class="card">' +
      (title ? '<div class="card-title"><h2>' + title + '</h2>' + (tag ? '<span class="tag">' + tag + '</span>' : '') + '</div>' : '') +
      bodyHtml + '</section>';
  };

  U.pillars = function (f, labels) {
    labels = labels || ['年柱', '月柱', '日柱', '时柱'];
    var cols = [f.year, f.month, f.day, f.hour];
    var wx = root.XJCalendar.wuxingOfGan, wz = root.XJCalendar.wuxingOfZhi;
    var cells = cols.map(function (p, i) {
      return '<div class="' + (i === 2 ? 'pillar-day' : '') + '">' +
        '<div class="pillar-gz">' + p.gan + '<br>' + p.zhi + '</div>' +
        '<div class="gz-meta"><span class="wx-' + wx(p.gan) + '">' + wx(p.gan) + '</span>·<span class="wx-' + wz(p.zhi) + '">' + wz(p.zhi) + '</span></div>' +
        '<div class="gz-meta">' + (p.nayin || '') + '</div>' +
        '</div>';
    }).join('');
    return '<div class="pillars">' +
      '<div><div class="pillar-head">&nbsp;</div>' + labels.map(function (l, i) { return '<div class="pillar-head" style="background:none">' + l + '</div>'; }).join('') + '</div>' +
      cells + '</div>';
  };

  /* 更紧凑的四柱：行式表格 */
  U.pillarsTable = function (f) {
    var C = root.XJCalendar;
    var cols = [f.year, f.month, f.day, f.hour];
    var heads = ['', '年柱', '月柱', '日柱', '时柱'];
    var rows = [];
    rows.push(['干支', cols.map(function (p) { return p.gan + p.zhi; })]);
    rows.push(['天干', cols.map(function (p) { return '<span class="wx-' + C.wuxingOfGan(p.gan) + '">' + p.gan + '（' + C.wuxingOfGan(p.gan) + '）</span>'; })]);
    rows.push(['地支', cols.map(function (p) { return '<span class="wx-' + C.wuxingOfZhi(p.zhi) + '">' + p.zhi + '（' + C.wuxingOfZhi(p.zhi) + '）</span>'; })]);
    rows.push(['藏干', cols.map(function (p) { return C.CANG_GAN[p.zhi].join('·'); })]);
    rows.push(['纳音', cols.map(function (p) { return p.nayin || C.nayin(p.gan + p.zhi); })]);
    var html = '<table><thead><tr>' + heads.map(function (x) { return '<th>' + x + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.forEach(function (r) {
      html += '<tr><td style="color:var(--ink-4);white-space:nowrap">' + r[0] + '</td>' +
        r[1].map(function (c, i) { return '<td' + (i === 2 ? ' style="background:rgba(169,138,82,.08)"' : '') + '>' + c + '</td>'; }).join('') + '</tr>';
    });
    html += '</tbody></table>';
    return html;
  };

  U.wxBars = function (pct) {
    var order = ['木', '火', '土', '金', '水'];
    return '<div class="wx-bars">' + order.map(function (w) {
      var v = pct[w] || 0;
      return '<div class="wx-bar"><span class="wx-' + w + '">' + w + '</span>' +
        '<span class="track"><span class="fill wx-' + w + '" style="width:' + Math.min(100, v * 2.2) + '%"></span></span>' +
        '<span class="val">' + v.toFixed(1) + '%</span></div>';
    }).join('') + '</div>';
  };

  U.sections = function (secs) {
    return '<div class="section-list">' + secs.map(function (s) {
      return '<div class="section-item"><h3>' + s.title + '</h3><p>' + s.body + '</p>' +
        (s.basis ? '<div class="basis">' + s.basis + '</div>' : '') + '</div>';
    }).join('') + '</div>';
  };

  U.hexFigure = function (binary, movingIdx, small) {
    var lines = '';
    for (var i = 5; i >= 0; i--) {
      var yang = binary.charAt(i) === '1';
      var moving = movingIdx === (i + 1);
      lines += '<div class="hex-line ' + (yang ? 'i1' : 'i0') + (moving ? ' moving' : '') + '">' +
        (yang ? '<i></i>' : '<em><i></i><i></i></em>') + '</div>';
    }
    return '<div class="hex-figure"' + (small ? ' style="padding:10px 8px;gap:5px"' : '') + '>' + lines + '</div>';
  };

  /* 完整阴阳鱼 logo（全站唯一来源）：
     墨底 + 左半纸白 + 上下两个半圆成 S 界 + 两仪各一鱼眼 + 泥金外圈。
     旧版把两个鱼眼都画在同色区，形同无眼，故此处以圆叠加构造重写。 */
  U.taiji = function (cls, ring) {
    return '<svg class="' + (cls || 'taiji') + '" viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="48" fill="#1d1b18"/>' +
      '<path d="M50 2A48 48 0 0 0 50 98Z" fill="#f4eee0"/>' +
      '<circle cx="50" cy="26" r="24" fill="#f4eee0"/>' +
      '<circle cx="50" cy="74" r="24" fill="#1d1b18"/>' +
      '<circle cx="50" cy="26" r="8" fill="#1d1b18"/>' +
      '<circle cx="50" cy="74" r="8" fill="#f4eee0"/>' +
      '<circle cx="50" cy="50" r="48" fill="none" stroke="' + (ring || '#a98a52') + '" stroke-width="1.4"/>' +
      '</svg>';
  };

  U.quote = function (text, src) {
    return '<div class="quote">' + text + (src ? '<span class="src">—— ' + src + '</span>' : '') + '</div>';
  };

  U.field = function (label, controlHtml, hint) {
    return '<div class="field"><label>' + label + '</label>' + controlHtml + (hint ? '<span class="hint">' + hint + '</span>' : '') + '</div>';
  };

  U.select = function (name, options, val, extra) {
    return '<select name="' + name + '" ' + (extra || '') + '>' + options.map(function (o) {
      var v = typeof o === 'string' ? o : o.v, t = typeof o === 'string' ? o : o.t;
      return '<option value="' + esc(v) + '"' + (String(v) === String(val) ? ' selected' : '') + '>' + esc(t) + '</option>';
    }).join('') + '</select>';
  };

  U.radios = function (name, options, val) {
    return '<div class="radios">' + options.map(function (o) {
      var v = typeof o === 'string' ? o : o.v, t = typeof o === 'string' ? o : o.t;
      return '<label><input type="radio" name="' + name + '" value="' + esc(v) + '"' + (String(v) === String(val) ? ' checked' : '') + '>' + esc(t) + '</label>';
    }).join('') + '</div>';
  };

  U.formVal = function (form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    if (!el) return '';
    if (el.type === 'radio') {
      var c = form.querySelector('[name="' + name + '"]:checked');
      return c ? c.value : '';
    }
    return el.value;
  };

  U.notice = function (html) { return '<div class="notice">' + html + '</div>'; };

  U.err = function (msg) { return '<p class="err">' + msg + '</p>'; };

  U.disclaimer = function () {
    return U.notice('<b>关于准确性：</b>本站所出，皆为依经据典之推演：历法用天文算法（定气、真太阳时），四柱依《子平真诠》《滴天髓》，' +
      '纳甲六爻依京房八宫、《增删卜易》，梅花依邵雍体用互变，紫微依《紫微斗数全书》安星诀，河洛依陈抟《河洛真数》求数成卦，' +
      '相术依《冰鉴》《麻衣相法》。<b>凡推演之处，皆列出计算过程与所据条文，供君复核。</b>' +
      '唯命理本为「象数之学」，非科学预测；节气时刻有数分钟误差，古籍版本亦有异文，请以理性视之，勿以决断生死大事。');
  };

  /* ---------------- 路由 ---------------- */
  /* 支持 #/page/arg?k=v&k2=v2 —— 问句解析后的参数随链接传递，可刷新、可分享 */
  function currentRoute() {
    var raw = location.hash.replace(/^#\/?/, '');
    var qi = raw.indexOf('?');
    var qs = qi >= 0 ? raw.slice(qi + 1) : '';
    var path = qi >= 0 ? raw.slice(0, qi) : raw;
    var parts = path.split('/');
    var params = {};
    if (qs) qs.split('&').forEach(function (kv) {
      if (!kv) return;
      var i = kv.indexOf('=');
      var k = i < 0 ? kv : kv.slice(0, i), v = i < 0 ? '' : kv.slice(i + 1);
      try { k = decodeURIComponent(k); v = decodeURIComponent(v); } catch (e) { /* 原样 */ }
      if (k) params[k] = v;
    });
    var arg = parts[1] || '';
    try { arg = decodeURIComponent(arg); } catch (e) { /* 原样 */ }
    return { id: parts[0] || 'home', arg: arg, params: params };
  }

  App.currentRoute = currentRoute;

  App.go = function (id, arg, params) {
    var s = '#/' + id + (arg ? '/' + encodeURIComponent(arg) : '');
    if (params) {
      var pairs = [];
      Object.keys(params).forEach(function (k) {
        var v = params[k];
        if (v === '' || v == null) return;
        pairs.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
      });
      if (pairs.length) s += '?' + pairs.join('&');
    }
    if (location.hash === s) render();
    else location.hash = s;
  };

  /* ---------------- 参数预填 ---------------- */
  var prefillers = {};
  var focusOracle = null;
  App.prefill = function (id, fn) { prefillers[id] = fn; };
  App.onFocusOracle = function (fn) { focusOracle = fn; };

  App.applyParams = function (r) {
    var fn = prefillers[r.id];
    if (!fn) return;
    var keys = Object.keys(r.params || {}).filter(function (k) { return k.charAt(0) !== '_'; });
    if (!keys.length && !r.arg) return;
    try { fn(r.params || {}, r.arg || ''); } catch (e) { if (root.console) console.error(e); }
  };

  /* 来路条：让用户知道自己因哪句话到了这里，并可随时换问法 */
  function consultHtml(r) {
    var q = r.params && r.params._q;
    if (!q || r.id === 'home') return '';
    var name = r.id;
    if (root.XJIntent) root.XJIntent.functions.forEach(function (f) { if (f.id === r.id) name = f.name; });
    var carried = Object.keys(r.params || {}).filter(function (k) { return k.charAt(0) !== '_'; });
    var sub = '已转至 <b>' + esc(name) + '</b>' +
      (carried.length || r.arg ? ' · 已带入所问参数并自动推算' : ' · 可在此页细究');
    return '<div class="consult-bar"><span class="cb-seal">鉴</span>' +
      '<div class="cb-txt"><div class="cb-q">自「' + esc(q) + '」而来</div>' +
      '<div class="cb-sub">' + sub + '</div></div>' +
      '<a href="#/home" class="cb-back">换个问法 ↗</a></div>';
  }

  function render() {
    var r = currentRoute();
    var def = pages[r.id] || pages.home;
    var main = document.getElementById('app');
    var bar = consultHtml(r);
    main.innerHTML = '';
    try {
      var node = def.render(r.arg);
      if (typeof node === 'string') main.innerHTML = bar + node;
      else if (node) {
        main.appendChild(node);
        if (bar && main.insertBefore) {
          var d = document.createElement('div');
          d.innerHTML = bar;
          if (d.firstElementChild) main.insertBefore(d.firstElementChild, main.firstChild);
        }
      }
    } catch (e) {
      main.innerHTML = '<div class="card"><div class="card-title"><h2>出错了</h2></div>' +
        '<p class="err">' + esc(e && e.message ? e.message : e) + '</p>' +
        '<pre class="small muted" style="white-space:pre-wrap">' + esc(e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n') : '') + '</pre></div>';
      if (root.console) console.error(e);
    }
    /* 导航高亮 */
    Array.prototype.forEach.call(document.querySelectorAll('.nav a'), function (a) {
      a.classList.toggle('on', a.getAttribute('data-route') === r.id);
    });
    window.scrollTo(0, 0);
    if (def.after) try { def.after(r.arg); } catch (e2) { console.error(e2); }
    App.applyParams(r);
  }

  App.render = render;
  App.start = function () {
    window.addEventListener('hashchange', render);
    /* 任意页面按 / 回到主界面并聚焦问句框 */
    if (document.addEventListener) document.addEventListener('keydown', function (e) {
      if (!e || e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target || {}, tag = String(t.tagName || '').toUpperCase();
      if (/INPUT|TEXTAREA|SELECT/.test(tag) || t.isContentEditable) return;
      if (e.preventDefault) e.preventDefault();
      if (currentRoute().id !== 'home') App.go('home');
      setTimeout(function () {
        if (focusOracle) focusOracle();
        else { var el = document.getElementById('portal-q'); if (el && el.focus) el.focus(); }
      }, 0);
    });
    render();
  };

  root.XJApp = App;
  root.XJUI = U;
}(typeof window !== 'undefined' ? window : this));
