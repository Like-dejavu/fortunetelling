/* 道德经 */
(function (root) {
  'use strict';
  var App = root.XJApp, U = root.XJUI;

  var THEMES = {
    '道體': '道之本体', '無為': '无为而治', '治國': '治道', '自然': '自然', '處世': '处世',
    '柔弱': '柔弱胜刚强', '知足': '知足', '修身': '修身', '反本': '反本归根', '用兵': '用兵',
    '德論': '德论', '天道': '天道'
  };
  function themeList(c) {
    if (!c.theme) return [];
    return Array.isArray(c.theme) ? c.theme : [c.theme];
  }

  App.page('daodejing', {
    render: function (arg) {
      var D = root.XJDaoDeJing || root.XJDaodejing;
      if (!D) return '<div class="card"><p class="err">道德经数据未加载。</p></div>';

      var totalChars = D.reduce(function (a, c) { return a + c.text.length; }, 0);

      var html = '<div class="page-head"><h1>道德经</h1>' +
        '<p class="lede">《道德经》非占筮之书，然术数之学，须有义理为归。' +
        '老子言「道」为万物之宗、「反者道之动」，言「知常曰明，不知常妄作凶」——此正与《易》之「知几」、' +
        '《冰鉴》之「神藏」相通。故本站列之，以为诸术之衡：术可推象，义可定心。</p></div>';

      html += '<div class="grid-2"><div class="card dd-side">' +
        '<div class="dd-search"><input type="search" id="dd-q" placeholder="检索经文，如：上善若水" autocomplete="off"></div>' +
        '<ol class="chapter-list" id="dd-list">' + D.map(function (c) {
          return '<li><a href="javascript:void 0" data-no="' + c.no + '"><span class="no">' + c.no + '</span>' + c.title + '</a></li>';
        }).join('') + '</ol></div>' +
        '<div><div id="dd-out"></div>' +
        U.card('其书', '<dl class="kv" style="grid-template-columns:86px 1fr">' +
          '<dt>篇数</dt><dd>八十一章（道经三十七、德经四十四）</dd>' +
          '<dt>字数</dt><dd>约 ' + totalChars + ' 字（本站所收王弼本）</dd>' +
          '<dt>传本</dt><dd>王弼注本（通行本）、河上公本、帛书甲乙本、郭店楚简本</dd>' +
          '<dt>异文</dt><dd>帛书本「道可道也，非恒道也」（通行本作「非常道」，避汉文帝刘恒讳而改）</dd>' +
          '</dl>' +
          '<p class="small muted" style="margin-top:10px">本站经文取王弼本（通行本），源维基文库，已剔除王弼注文。' +
          '帛书、楚简异文甚多，非一页可尽，读者可参高明《帛书老子校注》。</p>', '王弼本') +
        '</div></div>';

      html += U.card('以道观术', 
        '<div class="grid-2"><div>' +
        '<h4>「知常曰明」</h4><p class="small">第十六章：「复命曰常，知常曰明。不知常，妄作凶。」术数所示者为「变」，' +
        '而老子所示者为「常」。知变而不知常，则趋避皆妄；知常而后知变，则吉凶不动其心。</p>' +
        '<h4>「反者道之动」</h4><p class="small">第四十章。此为解梦「象反」、六爻「物极必反」、八字「旺极则衰」诸说之共同根柢。</p>' +
        '</div><div>' +
        '<h4>「天网恢恢，疏而不失」</h4><p class="small">第七十三章。术家言「煞」「忌」，老子则言「网」——非有神司之，乃理之必然。</p>' +
        '<h4>「上善若水」</h4><p class="small">第八章。用神取「调候」者，取水火之济；取「通关」者，取水之顺下。此皆可通。</p>' +
        '</div></div>' +
        '<p class="small muted" style="margin-top:14px">右列四则，为本站「以经证术」之说，属编者之比附，非老子本意。读经者当以经解经，勿以术解经。</p>',
        '引经');

      return html;
    },
    after: function (arg) {
      var D = root.XJDaoDeJing || root.XJDaodejing;
      var out = document.getElementById('dd-out'), list = document.getElementById('dd-list');
      var q = document.getElementById('dd-q');

      function show(no) {
        var c = null;
        D.forEach(function (x) { if (x.no === no) c = x; });
        if (!c) { out.innerHTML = '<div class="card"><p class="muted">未找到该章。</p></div>'; return; }
        Array.prototype.forEach.call(list.querySelectorAll('a'), function (a) {
          a.classList.toggle('on', +a.getAttribute('data-no') === no);
        });
        out.innerHTML = U.card('第' + c.no + '章 · ' + c.title,
          '<div class="dd-text">' + c.text.replace(/\n/g, '<br>') + '</div>' +
          '<div class="dd-meta">' + themeList(c).map(function (t) {
            return '<span class="badge">' + (THEMES[t] || t) + '</span>';
          }).join('') + '</div>' +
          (c.keys && c.keys.length ? '<div class="small muted" style="margin-top:10px">要语：' + c.keys.join('、') + '</div>' : ''),
          '王弼本');
        window.scrollTo(0, 0);
      }

      U.on(list, 'click', function (e) {
        var a = e.target.closest ? e.target.closest('a') : null;
        if (!a) return;
        e.preventDefault();
        show(+a.getAttribute('data-no'));
      });

      function doSearch() {
        var v = q.value.trim();
        if (!v) return;
        var hits = D.filter(function (c) { return c.text.indexOf(v) >= 0 || c.title.indexOf(v) >= 0; });
        if (!hits.length) {
          out.innerHTML = '<div class="card"><p class="muted">经中无「' + U.esc(v) + '」二字。</p></div>';
          return;
        }
        out.innerHTML = U.card('「' + v + '」凡 ' + hits.length + ' 见',
          hits.map(function (c) {
            var i = c.text.indexOf(v);
            var seg = c.text.slice(Math.max(0, i - 18), i + v.length + 18);
            return '<div class="dd-hit" data-no="' + c.no + '"><b>第' + c.no + '章 · ' + c.title + '</b>' +
              '<p class="small">…' + U.esc(seg) + '…</p></div>';
          }).join(''), '检索');
        Array.prototype.forEach.call(out.querySelectorAll('.dd-hit'), function (d) {
          U.on(d, 'click', function () { show(+d.getAttribute('data-no')); });
        });
      }
      U.on(q, 'keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); doSearch(); } });
      U.on(q, 'input', function () { clearTimeout(doSearch._t); doSearch._t = setTimeout(doSearch, 220); });

      var start = arg ? parseInt(arg, 10) : 1;
      show(isNaN(start) || start < 1 || start > 81 ? 1 : start);
    }
  });
}(typeof window !== 'undefined' ? window : this));
