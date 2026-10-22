/* 周公解梦 */
(function (root) {
  'use strict';
  var App = root.XJApp, U = root.XJUI;

  var SRC_TAG = { '原典': ['原典', 's-yuan'], '通行': ['通行', 's-tong'], '演绎': ['演绎', 's-yan'] };
  var G_CLASS = { '吉': 'g-ji', '凶': 'g-xiong', '中': 'g-zhong' };

  var idx = null;
  function build() {
    if (idx) return idx;
    idx = [];
    root.XJDreams.forEach(function (c) {
      c.items.forEach(function (it) { idx.push({ cat: c.name, catId: c.id, it: it }); });
    });
    return idx;
  }

  function search(q) {
    q = String(q || '').trim();
    var all = build();
    if (!q) return [];
    var hits = [];
    all.forEach(function (row) {
      var it = row.it, best = 0;
      it.k.forEach(function (k) {
        if (k === q) best = Math.max(best, 100);
        else if (k.indexOf(q) >= 0) best = Math.max(best, 70 + Math.min(10, q.length));
        else if (q.indexOf(k) >= 0 && k.length >= 2) best = Math.max(best, 50 + k.length);
      });
      if (!best && it.t && it.t.indexOf(q) >= 0) best = 20;
      if (best) hits.push({ row: row, score: best });
    });
    hits.sort(function (a, b) { return b.score - a.score; });
    return hits;
  }

  function itemHtml(row, showCat) {
    var it = row.it;
    return '<div class="dream-item">' +
      '<div class="dream-head"><b>' + it.k[0] + '</b>' +
      '<span class="dream-g ' + G_CLASS[it.g] + '">' + it.g + '</span>' +
      '<span class="dream-src ' + (SRC_TAG[it.src] ? SRC_TAG[it.src][1] : '') + '">' + (SRC_TAG[it.src] ? SRC_TAG[it.src][0] : it.src) + '</span>' +
      (showCat ? '<span class="dream-cat">' + row.cat + '</span>' : '') + '</div>' +
      (it.quote ? '<div class="dream-quote">「' + it.quote + '」<span class="muted">《周公解梦》通行本</span></div>' : '') +
      '<p class="dream-text">' + it.t + '</p>' +
      '<div class="dream-keys">' + it.k.map(function (k) { return '<span>' + k + '</span>'; }).join('') + '</div>' +
      '</div>';
  }

  App.page('dream', {
    render: function () {
      var cats = root.XJDreams;
      var total = 0;
      cats.forEach(function (c) { total += c.items.length; });

      var html = '<div class="page-head"><h1>周公解梦</h1>' +
        '<p class="lede">《周公解梦》非周公手著，乃后世术家辑《周礼》「六梦」之义，而以七言歌诀流传于民间，明清以来刊本尤多。' +
        '其法以「象」取义：梦象为象，所兆为义，或取同形，或取反义，或取谐音，皆有条例。本站所收 <b>' + total + '</b> 条，' +
        '逐条注明可信层级——<b>原典</b>（通行本歌诀可查）、<b>通行</b>（民间通行说法）、<b>演绎</b>（依象义推演）。</p></div>';

      html += '<div class="card"><div class="card-title"><h2>查梦</h2><span class="tag">输入梦中所见</span></div>' +
        '<div class="dream-search"><input type="search" id="dream-q" placeholder="如：蛇、落水、登高、故人、牙齿脱落、飞" autocomplete="off">' +
        '<button class="btn" id="dream-btn">解</button></div>' +
        '<div class="dream-cats">' + cats.map(function (c) {
          return '<span class="badge dream-cat-btn" data-cat="' + c.id + '">' + c.name + '<i>' + c.items.length + '</i></span>';
        }).join('') + '</div>' +
        '</div><div id="dream-out"></div>';

      html += U.card('梦之条例',
        '<div class="grid-2"><div>' +
        '<h4>一、象同</h4><p class="small">梦象与所兆同类相从：梦升天则主显达，梦得财则主有余。此为最直之一路。</p>' +
        '<h4>二、象反</h4><p class="small">梦凶得吉、梦吉得凶，所谓「反者道之动」。如梦见死，古法多以为「主长寿」「主更生」，非直以死断死。</p>' +
        '<h4>三、谐音</h4><p class="small">取声之同：梦「鹿」为「禄」，梦「蝠」为「福」，梦「莲」为「连」，皆民间惯用。</p>' +
        '</div><div>' +
        '<h4>四、五行</h4><p class="small">以梦象所属五行，推其所应之脏腑、方位、时令，此术家之说，本站仅标「演绎」。</p>' +
        '<h4>五、情动</h4><p class="small">《周礼》六梦——正梦、噩梦、思梦、寤梦、喜梦、惧梦——以情之动为梦之端，此为最早的分类。</p>' +
        '<h4>六、身感</h4><p class="small">饥梦食、寒梦火、身压梦魇，皆由生理而起。故解梦先辨「因身」与「因象」。</p>' +
        '</div></div>' +
        '<p class="small muted" style="margin-top:14px">以上六条，前三条为《周公解梦》歌诀所常用，后三条为历代梦说通义（《周礼·春官》《列子·周穆王》《梦占逸旨》）。</p>',
        '解梦之法');

      html += '<div class="card">' + U.notice('<b>关于「原典」：</b>《周公解梦》流传者为民间辑本，七言歌诀各本文字小异（如「天门开贵人荐引」一作「天门开贵人引荐」）。' +
        '本站「原典」条之引文，取自通行辑本，已尽力核对；「通行」条为常见说法而无定本；「演绎」条为依象义推演，非原书文字，特此标明，不使相混。' +
        '梦者，心神之浮游，本无定解；以之自省则可，以之断吉凶则惑。') + U.disclaimer() + '</div>';
      return html;
    },
    after: function () {
      var q = document.getElementById('dream-q'), out = document.getElementById('dream-out');

      function showList(title, rows) {
        out.innerHTML = U.card(title, rows.length ?
          '<div class="dream-list">' + rows.map(function (r) { return itemHtml(r.row || r, true); }).join('') + '</div>' :
          '<p class="muted">未找到相关梦象。可换用更短的词，如「蛇」「水」「火」「血」「牙」。</p>',
          rows.length + ' 条');
      }

      function doSearch() {
        var v = q.value.trim();
        if (!v) { out.innerHTML = ''; return; }
        var hits = search(v).slice(0, 40);
        showList('「' + v + '」之解', hits);
      }

      U.on(q, 'input', function () {
        clearTimeout(doSearch._t);
        doSearch._t = setTimeout(doSearch, 180);
      });
      U.on(q, 'keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); doSearch(); } });
      U.on(document.getElementById('dream-btn'), 'click', doSearch);

      Array.prototype.forEach.call(document.querySelectorAll('.dream-cat-btn'), function (b) {
        U.on(b, 'click', function () {
          var id = b.getAttribute('data-cat'), cat = null;
          root.XJDreams.forEach(function (c) { if (c.id === id) cat = c; });
          if (!cat) return;
          Array.prototype.forEach.call(document.querySelectorAll('.dream-cat-btn'), function (o) { o.classList.toggle('on', o === b); });
          q.value = '';
          out.innerHTML = U.card(cat.name + ' · 梦象',
            '<div class="dream-list">' + cat.items.map(function (it) { return itemHtml({ cat: cat.name, catId: cat.id, it: it }, false); }).join('') + '</div>',
            cat.items.length + ' 条');
        });
      });

      /* 路由参数可直接查 */
      var arg = (location.hash || '').split('/')[2];
      if (arg) { q.value = decodeURIComponent(arg); doSearch(); }
    }
  });
}(typeof window !== 'undefined' ? window : this));
