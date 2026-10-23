/* 玄鉴 · 问事页  #/ask 与 #/ask/<问题>
   一句所问，跨六爻、梅花、解梦、测字、黄历诸门取象，出一个主答与几候旁参，
   末以今日白话解之。取象全在本地，不联网。 */
(function (root) {
  'use strict';
  var App = root.XJApp, U = root.XJUI;

  /* 示例问题：点击填入并即占 */
  var EXAMPLES = [
    '我下个月能升职吗',
    '梦见掉牙是什么意思',
    '最近总丢东西，还能找回吗',
    '问一字：明',
    '这桩买卖能不能成',
    '今年适合换工作吗'
  ];

  var METHODS = [
    { v: 'auto', t: '随问随占' },
    { v: 'meihua', t: '梅花' },
    { v: 'liuyao', t: '六爻' }
  ];

  var METHOD_NAME = { auto: '随问随占', meihua: '梅花起例', liuyao: '六爻纳甲' };

  function dec(s) {
    s = String(s === null || s === undefined ? '' : s);
    try { return decodeURIComponent(s); } catch (e) { return s; }
  }
  function trim(s) { return String(s || '').replace(/^\s+|\s+$/g, ''); }

  /* ---------- 头部 ---------- */
  function head() {
    return '<div class="page-head"><h1>问事</h1>' +
      '<p class="lede">所问须一事，不可一问数事。心中悬着一件，凝神把它写成一句话，' +
      '然后起卦——这一刻的时辰便与你的事相触，所谓触机而占。' +
      '若只是随口一问，或同时挂着几头，象就散了，断得再细也无用。</p></div>';
  }

  /* ---------- 表单 ---------- */
  function chips() {
    var h = '', i;
    for (i = 0; i < EXAMPLES.length; i++) {
      h += '<button type="button" class="chip" data-q="' + U.esc(EXAMPLES[i]) + '">' +
        U.esc(EXAMPLES[i]) + '</button>';
    }
    return '<div class="ask-chips"><span class="small muted">试问：</span>' + h + '</div>';
  }

  function formHtml(q, method) {
    var h = '<form class="ask-form" id="ask-form">';
    h += U.field('所问何事',
      '<textarea name="q" rows="2" placeholder="如：我下个月能升职吗">' + U.esc(q) + '</textarea>',
      '一事一问，写清时间与所涉之人。不问生死、不问他人隐私、不一次挂几件事。');
    h += U.field('起卦方式', U.radios('method', METHODS, method || 'auto'),
      '不明所以者取「随问随占」，站内自择其宜；指名下法者，按所指之法断。');
    h += '<div class="btn-row"><button class="btn" type="submit">起 卦</button>' +
      '<span class="small muted">所问不必长，一句足矣。</span></div>';
    h += '</form>';
    return h + (q ? '' : chips());
  }

  /* ---------- 结果 ---------- */
  function srcLine(method, dt) {
    var t = '';
    try { t = U.fmtDate(dt); } catch (e) { t = ''; }
    return '以此刻起卦，触机而占：' + (t || '当下') + ' · ' + (METHOD_NAME[method] || METHOD_NAME.auto);
  }

  function outHtml(q, method, dt) {
    if (!root.XJAsk || !root.XJAsk.answer) {
      return U.notice('问事一法尚未接入本站；请稍后再来，或先看他页。');
    }
    var r;
    try {
      r = root.XJAsk.answer(q, { method: method, date: dt });
    } catch (e) {
      return U.err('此问未能取象：' + (e && e.message ? e.message : e));
    }
    var h = '<p class="ask-src">' + U.esc(srcLine(method, dt)) + '</p>';
    h += (r && r.html) || U.err('未得所答。');
    return h + U.disclaimer();
  }

  /* ---------- 页面 ---------- */
  function render(arg) {
    var q = trim(dec(arg));
    var h = head();
    h += formHtml(q, 'auto');
    h += '<div class="ask-out" id="ask-out"></div>';
    if (!q) {
      h += '<p class="small muted">没有想法时，可从上面的例子入手；也可以直接问一个字，如「问一字：明」。</p>';
    }
    return h;
  }

  function after(arg) {
    var form = document.getElementById('ask-form');
    var out = document.getElementById('ask-out');
    var q0 = trim(dec(arg));

    function paint(q) {
      if (!out) return;
      var method = 'auto';
      if (form) {
        try { method = U.formVal(form, 'method') || 'auto'; } catch (e) { method = 'auto'; }
      }
      out.innerHTML = outHtml(q, method, new Date());
    }

    function go(q) {
      q = trim(q);
      if (!q) {
        if (out) out.innerHTML = U.notice('先写下一句所问之事，再起卦。');
        return;
      }
      var target = '#/ask/' + encodeURIComponent(q);
      /* 地址可分享、可刷新；路由若已在此处，须自己重画 */
      if (location.hash === target) paint(q);
      else location.hash = target;
    }

    if (form) U.on(form, 'submit', function (e) {
      if (e && e.preventDefault) e.preventDefault();
      go(U.formVal(form, 'q'));
    });

    /* 示例 chips：填入并即占 */
    var box = document.querySelector('.ask-chips');
    if (box) U.on(box, 'click', function (e) {
      var t = e && e.target ? e.target : null;
      var q = t && t.getAttribute ? t.getAttribute('data-q') : '';
      if (!q) return;
      if (form) {
        var ta = form.querySelector('[name="q"]');
        if (ta) ta.value = q;
      }
      go(q);
    });

    if (q0) paint(q0);
  }

  App.page('ask', { render: render, after: after });
}(typeof window !== 'undefined' ? window : this));
