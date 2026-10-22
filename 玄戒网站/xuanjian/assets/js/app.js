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
  function currentRoute() {
    var hash = location.hash.replace(/^#\/?/, '');
    var parts = hash.split('/');
    return { id: parts[0] || 'home', arg: parts[1] || '' };
  }

  App.go = function (id, arg) {
    location.hash = '#/' + id + (arg ? '/' + arg : '');
  };

  function render() {
    var r = currentRoute();
    var def = pages[r.id] || pages.home;
    var main = document.getElementById('app');
    main.innerHTML = '';
    try {
      var node = def.render(r.arg);
      if (typeof node === 'string') main.innerHTML = node;
      else if (node) main.appendChild(node);
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
  }

  App.render = render;
  App.start = function () {
    window.addEventListener('hashchange', render);
    render();
  };

  root.XJApp = App;
  root.XJUI = U;
}(typeof window !== 'undefined' ? window : this));
