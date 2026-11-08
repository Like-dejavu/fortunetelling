/* ============================================================
   玄鉴 · 主界面（智能问句入口）
   覆盖 home 路由；注册各功能页的参数预填器。
   加载顺序须在所有 views 之后。
   ============================================================ */
(function (root) {
  'use strict';
  var App = root.XJApp, U = root.XJUI, I = root.XJIntent, C = root.XJCalendar;

  /* ---------------- 表单预填工具 ---------------- */
  function byId(id) { return document.getElementById(id); }

  function fire(el, type) {
    if (!el) return;
    try {
      if (typeof Event === 'function') { el.dispatchEvent(new Event(type, { bubbles: true, cancelable: true })); return; }
    } catch (e) { /* 落到下面的兜底 */ }
    try { if (el.fire) el.fire(type); } catch (e2) { /* 忽略 */ }
  }

  function fireKey(el, key) {
    if (!el) return;
    try {
      if (typeof KeyboardEvent === 'function') {
        el.dispatchEvent(new KeyboardEvent('keydown', { key: key, bubbles: true, cancelable: true }));
        return;
      }
    } catch (e) { /* 落到下面的兜底 */ }
    try { if (el.fire) el.fire('keydown', { key: key }); } catch (e2) { /* 忽略 */ }
  }

  function set(form, name, val) {
    if (!form || val == null || val === '' || !form.querySelectorAll) return;
    var els = form.querySelectorAll('[name="' + name + '"]');
    if (!els || !els.length) return;
    var el = els[0], i;
    if (el.type === 'radio') {
      for (i = 0; i < els.length; i++) if (els[i].value === String(val)) els[i].checked = true;
      fire(els[0], 'change');
      return;
    }
    if (el.options && el.options.length) {
      var ok = false;
      for (i = 0; i < el.options.length; i++) if (String(el.options[i].value) === String(val)) ok = true;
      if (!ok) return;
    }
    el.value = String(val);
    fire(el, 'change');
  }

  function setMany(form, params, names) {
    names.forEach(function (n) { set(form, n, params[n]); });
  }

  /* ---------------- 各页预填器 ---------------- */
  App.prefill('bazi', function (p) {
    var f = byId('bz-form');
    setMany(f, p, ['date', 'time', 'gender', 'ziRule', 'lon', 'ts']);
    fire(f, 'submit');
  });

  App.prefill('ziwei', function (p) {
    var f = byId('zw-form');
    setMany(f, p, ['date', 'hour', 'gender']);
    fire(f, 'submit');
  });

  App.prefill('heluo', function (p) {
    var f = byId('hl2-form');
    setMany(f, p, ['date', 'time', 'gender']);
    fire(f, 'submit');
  });

  App.prefill('huangli', function (p) {
    var a = byId('hl-form'), b = byId('zr-form');
    if (p.date) { set(a, 'date', p.date); set(b, 'from', p.date); }
    if (p.item) set(b, 'item', p.item);
    fire(a, 'submit');
    if (p.item) fire(b, 'submit');
  });

  App.prefill('meihua', function (p) {
    var f = byId('mh-form');
    if (p.mode) set(f, 'mode', p.mode);
    setMany(f, p, ['date', 'hour', 'n1', 'n2', 'q']);
    fire(f, 'submit');
  });

  App.prefill('liuyao', function (p) {
    var f = byId('ly-form');
    setMany(f, p, ['date', 'q']);
    fire(f, 'submit');
    if (p.cast) {
      var b = byId('ly-cast');
      if (b) { try { if (b.click) b.click(); else fire(b, 'click'); } catch (e) { /* 忽略 */ } }
    }
  });

  App.prefill('dream', function (p, arg) {
    if (arg) return; /* 路由 arg 已由解梦页自行检索 */
    var q = byId('dream-q');
    if (q && p.q) { q.value = p.q; fireKey(q, 'Enter'); }
  });

  App.prefill('daodejing', function (p, arg) {
    if (arg) return; /* 路由 arg 已由道德经页定位章节 */
    var q = byId('dd-q');
    if (q && p.q) { q.value = p.q; fireKey(q, 'Enter'); }
  });

  /* ---------------- 今日简卡 ---------------- */
  function todayCard() {
    try {
      var d = new Date(), f = C.fourPillars(d, {});
      var jc = C.jianchu(C.ZHI.indexOf(f.month.zhi), C.ZHI.indexOf(f.day.zhi));
      var lu = root.XJLunar ? root.XJLunar.solarToLunar(d) : null;
      return U.card('今日 · ' + (d.getMonth() + 1) + '月' + d.getDate() + '日',
        '<dl class="kv" style="grid-template-columns:76px 1fr">' +
        '<dt>干支</dt><dd><b>' + f.year.gan + f.year.zhi + '</b>年　<b>' + f.month.gan + f.month.zhi + '</b>月　<b style="color:var(--cinnabar)">' + f.day.gan + f.day.zhi + '</b>日</dd>' +
        (lu && !lu.outOfRange ? '<dt>农历</dt><dd>' + lu.textLong + '</dd>' : '') +
        '<dt>建除</dt><dd>' + jc.name + '日 · ' + (jc.isHuangDao ? '<span class="badge on">黄道</span>' : '<span class="badge">黑道</span>') + '</dd>' +
        '<dt>宜</dt><dd class="yi">' + (jc.yiji.yi || '—') + '</dd>' +
        '<dt>忌</dt><dd class="ji">' + (jc.yiji.ji || '—') + '</dd>' +
        '</dl><p class="small muted" style="margin:12px 0 0">想细查或择日？直接问「明天宜嫁娶吗」。</p>',
        jc.name + '日');
    } catch (e) {
      return U.card('今日', '<p class="muted small">历法数据未就绪，可前往<a href="#/huangli">黄历吉凶</a>查看。</p>');
    }
  }

  /* ---------------- 主界面 ---------------- */
  var GROUPS = [
    { name: '历日', sub: '观天时 · 察宜忌' },
    { name: '命数', sub: '推禀气 · 定格局' },
    { name: '卜筮', sub: '揲蓍策 · 观体用' },
    { name: '象纬', sub: '辨梦象 · 明兆应' },
    { name: '相法', sub: '审神骨 · 察形色' },
    { name: '典籍', sub: '寻原文 · 核出处' },
    { name: '本站', sub: '存所问 · 备复核' }
  ];

  function heroHtml() {
    var taiji = U.taiji('taiji portal-taiji');
    return '<div class="hero portal-hero">' + taiji +
      '<h1>玄鉴</h1>' +
      '<div class="epi">观乎天文，以察时变；观乎人文，以化成天下</div>' +
      '<div class="epi-src">《周易 · 贲卦 · 彖传》</div></div>';
  }

  function oracleHtml() {
    var ex = I.examples.slice(0, 6);
    return '<section class="oracle" aria-label="智能问句入口">' +
      '<div class="oracle-head"><span class="oracle-seal">問</span>' +
      '<div><div class="oracle-title">一念之问，直达其术</div>' +
      '<div class="oracle-sub">不必翻找菜单。写下所问，玄鉴先辨其类，再引其法，并把生辰、梦象、章句一并带过去。</div></div></div>' +
      '<form id="portal-form" class="oracle-box" autocomplete="off">' +
      '<span class="oracle-glyph" aria-hidden="true">鉴</span>' +
      '<input type="search" id="portal-q" class="oracle-input" autocomplete="off" spellcheck="false" ' +
      'placeholder="如：我昨晚梦见一条蛇 / 1990年6月17日 10:30 男，排八字" aria-label="输入你的问题">' +
      '<button type="submit" class="btn oracle-btn">起 鉴</button></form>' +
      '<div id="portal-sug" class="oracle-sug" aria-live="polite"></div>' +
      '<div class="oracle-ex"><span class="ex-label">试 问</span>' +
      ex.map(function (q) {
        return '<button type="button" class="ex-chip" data-q="' + U.esc(q) + '">' + U.esc(q.length > 20 ? q.slice(0, 19) + '…' : q) + '</button>';
      }).join('') + '</div>' +
      '<div class="oracle-help"><span>按 <kbd>/</kbd> 唤起 · <kbd>↑</kbd><kbd>↓</kbd> 择术 · <kbd>Enter</kbd> 直达</span>' +
      '<span>所问只在本地解析，不上传、不留存</span></div>' +
      '</section>';
  }

  function groupsHtml() {
    return GROUPS.map(function (g) {
      var list = I.functions.filter(function (f) { return f.group === g.name; });
      if (!list.length) return '';
      return '<div class="fn-group"><div class="fn-group-head"><b>' + g.name + '</b><span>' + g.sub + '</span></div>' +
        '<div class="fn-grid">' + list.map(function (f) {
          return '<a class="fn-card" href="#/' + f.id + '" data-fn="' + f.id + '">' +
            '<span class="fn-gl">' + f.gl + '</span>' +
            '<span class="fn-body"><b>' + f.name + '</b>' +
            '<span class="fn-ds">' + f.ds + '</span>' +
            '<span class="fn-kw">' + U.esc(f.kws) + '</span></span>' +
            '<span class="fn-arrow">↗</span></a>';
        }).join('') + '</div></div>';
    }).join('');
  }

  function howHtml() {
    var rows = [
      ['梦见蛇 / 梦到落水', '周公解梦', '自动检索该梦象'],
      ['生辰 + 时刻 + 男/女', '四柱 · 紫微 · 河洛', '自动带入并排盘'],
      ['明天宜嫁娶吗', '黄历吉凶', '自动查该日、筛选吉日'],
      ['帮我摇一卦，问求财', '六爻纳甲', '自动代为摇卦'],
      ['用 3 和 8 起一卦', '梅花易数', '自动切到数字起卦'],
      ['道德经第八章 / 上善若水', '道德经', '自动定位到该章']
    ];
    return U.card('玄鉴如何听懂一句话',
      '<p class="small">输入框里不必写功能名。写下所问，先按<b>关键词</b>辨其术，再按<b>日期、时刻、性别、梦象、章句</b>抽取参数，' +
      '跳过去即替你填好表单并算出结果。若一句里含混不清，会列出几个去处供你择一，绝不擅自替你决定。</p>' +
      '<table><thead><tr><th>你可以这样写</th><th>去往</th><th>带过去</th></tr></thead><tbody>' +
      rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td><b>' + r[1] + '</b></td><td class="small">' + r[2] + '</td></tr>'; }).join('') +
      '</tbody></table>', '问句之法');
  }

  App.page('home', {
    render: function () {
      return '<div class="portal">' +
        heroHtml() +
        oracleHtml() +
        '<div class="portal-sec"><h2>诸术 · 分门而入</h2><span>亦可点选，或回到上方一问直达</span></div>' +
        groupsHtml() +
        '<div class="grid-2 portal-bottom">' + todayCard() + howHtml() + '</div>' +
        '<div class="card portal-disc">' + U.disclaimer() + '</div>' +
        '</div>';
    },

    after: function () {
      var form = byId('portal-form'), q = byId('portal-q'), box = byId('portal-sug');
      var state = { results: [], active: 0, text: '' };

      function esc(s) { return U.esc(s); }

      function defaultSug() {
        var quick = ['dream', 'bazi', 'huangli', 'liuyao'];
        var cards = quick.map(function (id) {
          var f = null;
          I.functions.forEach(function (x) { if (x.id === id) f = x; });
          if (!f) return '';
          return '<a class="sug-quick" href="#/' + f.id + '"><b>' + f.gl + '</b>' + f.name + '</a>';
        }).join('');
        return '<div class="sug-idle"><span class="sug-idle-mark">象</span>' +
          '<div><b>所问未起，十二术皆备。</b><span>写下问题，或先从常问处入：</span></div>' +
          '<div class="sug-quicks">' + cards + '</div></div>';
      }

      function sugHtml(data) {
        if (!data.text) return defaultSug();
        if (!data.results.length) {
          return '<div class="sug-empty">未辨明所问。可换个说法，或试试「梦见蛇」「排八字」「明天宜嫁娶吗」；' +
            '也可直接点下方十二术。</div>';
        }
        var head = data.best
          ? '<div class="sug-head">已辨为 <b>' + esc(data.best.name) + '</b><span>按 Enter 直达，或另择一术</span></div>'
          : '<div class="sug-head dim">所问含混，请择一术<span>玄鉴不替你臆断</span></div>';
        return head + '<div class="sug-list">' + data.results.map(function (r, i) {
          var why = r.why && r.why.length ? r.why.join(' · ') : (r.hit && r.hit.length ? '命中「' + r.hit.join('、') + '」' : r.ds);
          return '<button type="button" class="sug-item' + (i === state.active ? ' on' : '') + '" data-i="' + i + '">' +
            '<span class="sug-gl">' + r.gl + '</span>' +
            '<span class="sug-main"><b>' + esc(r.name) + '</b><span class="sug-why">' + esc(why) + '</span></span>' +
            '<span class="sug-tag">' + esc(r.group) + '</span>' +
            '<span class="sug-go">前往 ↗</span></button>';
        }).join('') + '</div>';
      }

      function repaint() {
        if (!box) return;
        box.innerHTML = sugHtml({ text: state.text, results: state.results, best: state.best });
        bindItems();
      }

      function markActive() {
        if (!box || !box.querySelectorAll) return;
        var items = box.querySelectorAll('.sug-item');
        for (var i = 0; i < items.length; i++) {
          if (items[i].classList) items[i].classList.toggle('on', i === state.active);
        }
      }

      function go(r) {
        var params = {}, trackParams = {}, k;
        for (k in r.params) if (Object.prototype.hasOwnProperty.call(r.params, k)) {
          params[k] = r.params[k];
          trackParams[k] = r.params[k];
        }
        params._q = state.text || r.name;
        var qs = I.queryOf(params);
        var hash = '#/' + r.id + (r.arg ? '/' + encodeURIComponent(r.arg) : '') + (qs ? '?' + qs : '');
        /* 记下这一问（只写本机浏览器，见 history.js） */
        if (root.XJHistory) root.XJHistory.add({
          route: r.id, text: state.text || '',
          summary: (r.why && r.why.length) ? r.why.join(' · ') : '',
          arg: r.arg || '', params: trackParams, hash: hash, source: 'ask'
        });
        if (location.hash === hash) { if (App.render) App.render(); }
        else location.hash = hash;
      }

      function bindItems() {
        if (!box || !box.querySelectorAll) return;
        var items = box.querySelectorAll('.sug-item');
        Array.prototype.forEach.call(items, function (el) {
          U.on(el, 'click', function () {
            var i = parseInt(el.getAttribute('data-i'), 10);
            var r = state.results[i];
            if (r) go(r);
          });
        });
      }

      function update(v) {
        state.text = v;
        state.active = 0;
        var data = I.parse(v);
        state.results = data.results;
        state.best = data.best;
        repaint();
      }

      if (q) {
        U.on(q, 'input', function () { update(q.value); });
        U.on(q, 'keydown', function (e) {
          var key = e && e.key ? e.key : '';
          if (key === 'ArrowDown' || key === 'ArrowUp') {
            if (!state.results.length) return;
            if (e.preventDefault) e.preventDefault();
            state.active = (state.active + (key === 'ArrowDown' ? 1 : -1) + state.results.length) % state.results.length;
            markActive();
          }
        });
      }

      if (form) {
        U.on(form, 'submit', function (e) {
          if (e && e.preventDefault) e.preventDefault();
          var v = q ? (q.value || '').replace(/^\s+|\s+$/g, '') : '';
          /* 仅在文本变化时才重解析，保留 ↑↓ 选中的那一项 */
          if (v !== state.text) update(v);
          var r = state.results[state.active];
          if (r) go(r);
          else if (q && q.focus) q.focus();
        });
      }

      /* 快捷问法 */
      if (document.querySelectorAll) {
        Array.prototype.forEach.call(document.querySelectorAll('.ex-chip'), function (b) {
          U.on(b, 'click', function () {
            var v = b.getAttribute('data-q') || '';
            if (q) q.value = v;
            update(v);
            var r = state.results[0];
            if (r) go(r);
          });
        });
      }

      /* 全局 / 唤起：由 app.js 统一绑定，这里只负责聚焦 */
      if (App.onFocusOracle) App.onFocusOracle(function () {
        if (q && q.focus) { try { q.focus(); } catch (e) { /* 忽略 */ } }
      });

      repaint();
    }
  });
}(typeof window !== 'undefined' ? window : this));
