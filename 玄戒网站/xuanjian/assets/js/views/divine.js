/* 六爻纳甲 · 梅花易数 */
(function (root) {
  'use strict';
  var App = root.XJApp, U = root.XJUI, C = root.XJCalendar;

  function hexBlock(bin, moving, title, sub) {
    return '<div style="text-align:center">' +
      '<div class="small muted" style="letter-spacing:.16em;margin-bottom:6px">' + title + '</div>' +
      U.hexFigure(bin, moving) +
      (sub ? '<div class="small" style="margin-top:8px;letter-spacing:.1em">' + sub + '</div>' : '') + '</div>';
  }

  function hexagramText(info, movingPos) {
    if (!info) return '';
    var b = [];
    b.push(U.quote('「' + info.text + '」', info.full + ' · 卦辞'));
    if (info.tuan) b.push('<p class="small"><b>彖曰：</b>' + info.tuan + '</p>');
    if (info.xiang) b.push('<p class="small"><b>象曰：</b>' + info.xiang + '</p>');
    return b.join('');
  }

  /* ================= 六爻 ================= */
  var VAL_OPTS = [
    { v: 7, t: '少阳 ─' }, { v: 8, t: '少阴 ╍' }, { v: 9, t: '老阳 ○（动）' }, { v: 6, t: '老阴 ×（动）' }
  ];

  App.page('liuyao', {
    render: function () {
      var html = '<div class="page-head"><h1>六爻纳甲</h1>' +
        '<p class="lede">六爻之法，以铜钱三枚摇六次成卦：三背为老阳（○），两背为少阳，一背为少阴，三字为老阴（×）。' +
        '卦成而纳甲：乾纳甲壬、坤纳乙癸、震庚、巽辛、坎戊、离己、艮丙、兑丁。以卦宫定五行，以五行论六亲，以世应为彼此，' +
        '以月建日辰为权衡，以动爻变爻为机变。断法本《增删卜易》《卜筮正宗》。</p></div>';

      html += '<div class="card"><div class="card-title"><h2>起卦</h2><span class="tag">手摇 · 纳甲</span></div>' +
        '<form id="ly-form"><div class="form-grid">' +
        U.field('所问之事', '<input type="text" name="q" placeholder="如：求财、问病、谋事、寻物" value="求财">', '填关键词可自动取用神') +
        U.field('占卦日期', '<input type="date" name="date" value="' + new Date().toISOString().slice(0, 10) + '">') +
        '</div>' +
        '<div class="rule"></div>' +
        '<p class="small muted">自下而上，依次录入六爻（初爻 → 上爻）：</p>' +
        '<div class="form-grid" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr))">' +
        [0, 1, 2, 3, 4, 5].map(function (i) {
          return U.field(['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'][i], U.select('y' + i, VAL_OPTS, 7));
        }).join('') + '</div>' +
        '<div class="btn-row"><button class="btn" type="submit">纳甲断卦</button>' +
        '<button class="btn ghost" type="button" id="ly-cast">代为摇卦</button>' +
        '<span class="muted small">摇卦用 Math.random 模拟六次投三钱，可重复摇至心意安定</span></div></form>' +
        '<div id="ly-out" style="margin-top:22px"></div></div>';
      return html;
    },
    after: function () {
      var f = document.getElementById('ly-form'), out = document.getElementById('ly-out');
      function run(vals) {
        try {
          var dv = U.formVal(f, 'date');
          var p = dv.split('-').map(Number);
          var dt = new Date(p[0], p[1] - 1, p[2], new Date().getHours(), 0, 0);
          var q = U.formVal(f, 'q') || '';
          var r = root.XJLiuyao.analyze({ vals: vals, date: dt, question: q });
          out.innerHTML = renderLiuyao(r);
        } catch (e) {
          out.innerHTML = U.err('起卦失败：' + (e && e.message ? e.message : e));
          console.error(e);
        }
      }
      U.on(f, 'submit', function (e) {
        e.preventDefault();
        var vals = [0, 1, 2, 3, 4, 5].map(function (i) { return parseInt(U.formVal(f, 'y' + i), 10); });
        run(vals);
      });
      U.on(document.getElementById('ly-cast'), 'click', function () {
        run(root.XJLiuyao.cast());
      });
      run([7, 8, 8, 7, 8, 7]);
    }
  });

  function renderLiuyao(r) {
    var ben = r.ben, bian = r.bian, j = r.judge;
    var out = [];

    /* 卦体 */
    var hasMove = ben.yao.some(function (y) { return y.moving; });
    out.push('<div class="hex-wrap">' +
      hexBlock(ben.binary, null, '本卦', '<b>' + ben.full + '</b>') +
      (hasMove
        ? hexBlock(bian.binary, null, '变卦', '<b>' + bian.full + '</b>')
        : '<div style="text-align:center;align-self:center"><div class="small muted" style="letter-spacing:.16em;margin-bottom:8px">静卦</div>' +
          '<p class="muted small" style="max-width:15em;margin:0 auto;line-height:1.9">六爻不动，无变卦可看。<br>专以月建、日辰、旬空、世应断之。</p></div>') +
      '</div>');

    /* 基本信息 */
    var moving = ben.yao.filter(function (y) { return y.moving; }).map(function (y) { return '第' + y.pos + '爻'; });
    out.push('<div class="kv" style="margin-top:16px;grid-template-columns:100px 1fr">' +
      '<dt>卦宫</dt><dd>' + ben.palace + '宫（' + ben.gongWx + '）· ' + ben.seq + '</dd>' +
      '<dt>世应</dt><dd>世在' + ben.shi + '爻，应在' + ben.ying + '爻</dd>' +
      '<dt>动爻</dt><dd>' + (moving.length ? moving.join('、') : '无（静卦）') + '</dd>' +
      '<dt>月建日辰</dt><dd>' + r.four.month.gan + r.four.month.zhi + '月　' + r.four.day.gan + r.four.day.zhi + '日　旬空' + r.kong.join('、') + '</dd>' +
      '<dt>用神</dt><dd><b>' + r.useType + '</b>' + (r.q && r.q.matched ? '（依所问「' + r.q.label + '」取）' : '（未明所问，依「六亲通用」取）') +
      '，现于' + (r.useIdx >= 0 ? '第' + (r.useIdx + 1) + '爻' : '伏神') + '</dd>' +
      '</div>');

    /* 六爻表 */
    var rows = '';
    for (var i = 5; i >= 0; i--) {
      var y = ben.yao[i];
      var shiYing = y.pos === ben.shi ? '<span class="badge on">世</span>' : y.pos === ben.ying ? '<span class="badge">应</span>' : '';
      var mark = y.moving ? ('<span class="yao-move">' + (y.oldYang ? '○ 老阳' : '× 老阴') + ' 动</span>') : '';
      var useHi = (i === r.useIdx) ? ' style="background:rgba(156,43,35,.07)"' : '';
      rows += '<tr' + useHi + '>' +
        '<td class="muted small">' + y.liushen + '</td>' +
        '<td><b style="font-size:16px">' + y.gz + '</b> <span class="wx-' + y.wx + '">' + y.wx + '</span></td>' +
        '<td>' + y.liuqin + (i === r.useIdx ? ' ★' : '') + '</td>' +
        '<td>' + shiYing + '</td>' +
        '<td>' + (y.kong ? '<span class="badge">空</span>' : '') + (y.yuePo ? '<span class="badge">月破</span>' : '') + (y.riPo ? '<span class="badge">日破</span>' : '') + mark + '</td>' +
        '<td class="small">' + (y.moving && y.bianGZ ? y.bianGZ + ' ' + y.bianQin + '（' + y.huitou + '）' : '—') + '</td>' +
        '</tr>';
    }
    out.push('<table style="margin-top:18px"><thead><tr><th>六神</th><th>纳甲</th><th>六亲</th><th>世应</th><th>旺衰</th><th>变爻</th></tr></thead><tbody>' + rows + '</tbody></table>');
    if (r.fuShen) out.push(U.notice('用神不上卦，取本宫纯卦同位为<b>伏神</b>：' + r.fuShen.gz + ' ' + r.fuShen.liuqin + '（' + r.fuShen.note + '）'));

    /* 断语 */
    out.push('<div class="card-title" style="margin-top:26px"><h2>断卦</h2>' +
      '<span class="tag">' + j.score + ' 分 · ' + j.verdict + '</span></div>');
    out.push('<div class="section-list">' + j.reasons.map(function (x) {
      return '<div class="section-item"><h3>' + (x.d > 0 ? '＋' : x.d < 0 ? '−' : '') + Math.abs(x.d) + '</h3>' +
        '<p>' + x.text + '</p>' + (x.ref ? '<div class="basis">' + x.ref + '</div>' : '') + '</div>';
    }).join('') + '</div>');

    /* 卦辞 */
    var info = root.XJLiuyao.hexInfo(ben.binary), binfo = root.XJLiuyao.hexInfo(bian.binary);
    if (info) {
      var mv = ben.yao.filter(function (y) { return y.moving; })[0];
      var t = '<h3 style="letter-spacing:.14em">' + info.full + '</h3>' + hexagramText(info);
      if (mv && info.yao && info.yao[mv.pos - 1]) {
        t += U.quote('「' + info.yao[mv.pos - 1].text + '」', '第' + mv.pos + '爻爻辞（动爻所取）');
      }
      if (binfo && bian.binary !== ben.binary) {
        t += '<hr class="rule"><h3 style="letter-spacing:.14em">变卦 ' + binfo.full + '</h3>' + hexagramText(binfo);
      }
      out.push(U.card('卦爻辞', t, '《周易》'));
    }
    out.push('<div class="card">' + U.notice('<b>断法要点：</b>用神为事之主体，原神生之、忌神克之、仇神克原神。月建司一月之权，日辰主一日之令，' +
      '「月建为提纲，日辰为主宰」。用神旺相而临日月、得动爻生扶者吉；休囚而受克、逢空破者凶。动必有因，变必有应，' +
      '故须兼看变爻回头生克。') + '</div>');
    return out.join('');
  }

  /* ================= 梅花易数 ================= */
  App.page('meihua', {
    render: function () {
      var html = '<div class="page-head"><h1>梅花易数</h1>' +
        '<p class="lede">邵康节观梅而占，以数起卦：先天数为体（乾一、兑二、离三、震四、巽五、坎六、艮七、坤八），' +
        '年月日时相加取上下卦，总数取动爻。卦成而分体用：动者为用，静者为体。体为己、用为事，' +
        '用生体则吉，体克用则成，体生用则耗，用克体则凶。再参互卦以观中段，变卦以观终局。' +
        '依法则「不动不占、不因事不占」。</p></div>';

      html += '<div class="card"><div class="card-title"><h2>起卦</h2><span class="tag">时间 · 数字</span></div>' +
        '<form id="mh-form">' +
        U.field('起卦方式', U.radios('mode', [{ v: 'time', t: '年月日时起卦' }, { v: 'num', t: '数字起卦' }], 'time')) +
        '<div id="time-box" style="margin-top:14px"><div class="form-grid">' +
        U.field('公历日期', '<input type="date" name="date" value="' + new Date().toISOString().slice(0, 10) + '">', '依农历年月日与时支取数') +
        U.field('时辰', U.select('hour', C.ZHI.map(function (z, i) { return { v: i, t: z + '时（' + C.SHICHEN_NAME[i] + '）' }; }), new Date().getHours() >= 23 ? 0 : Math.floor((new Date().getHours() + 1) / 2) % 12)) +
        '</div></div>' +
        '<div id="num-box" style="display:none;margin-top:14px"><div class="form-grid">' +
        U.field('第一数', '<input type="number" name="n1" value="7" min="0">', '取为上卦') +
        U.field('第二数', '<input type="number" name="n2" value="13" min="0">', '取为下卦与动爻') +
        '</div></div>' +
        U.field('所问之事', '<input type="text" name="q" placeholder="如：问谋事、问失物" value="问事">') +
        '<div class="btn-row"><button class="btn" type="submit">起卦断事</button></div></form></div>' +
        '<div id="mh-out"></div>';
      return html;
    },
    after: function () {
      var f = document.getElementById('mh-form'), out = document.getElementById('mh-out');
      function toggle() {
        var timeMode = (f.querySelector('[name="mode"]:checked') || {}).value === 'time';
        document.getElementById('time-box').style.display = timeMode ? '' : 'none';
        document.getElementById('num-box').style.display = timeMode ? 'none' : '';
      }
      Array.prototype.forEach.call(f.querySelectorAll('[name="mode"]'), function (x) { x.addEventListener('change', toggle); });
      toggle();

      function run() {
        try {
          var timeMode = (f.querySelector('[name="mode"]:checked') || {}).value === 'time';
          var cast;
          if (timeMode) {
            var dv = U.formVal(f, 'date').split('-').map(Number);
            var hz = parseInt(U.formVal(f, 'hour'), 10);
            var dt = new Date(dv[0], dv[1] - 1, dv[2], hz * 2 === 0 ? 0 : hz * 2 - 1, 0, 0);
            /* 以所选时支构造时刻：子=23:00-01:00，取中间 */
            cast = root.XJMeihua.timeGua(dt, { hourZhiIdx: hz });
          } else {
            cast = root.XJMeihua.numGua(parseInt(U.formVal(f, 'n1'), 10) || 0, parseInt(U.formVal(f, 'n2'), 10) || 0);
          }
          var r = root.XJMeihua.analyze(cast, { question: U.formVal(f, 'q') });
          out.innerHTML = renderMeihua(r);
        } catch (e) {
          out.innerHTML = U.err('起卦失败：' + (e && e.message ? e.message : e));
          console.error(e);
        }
      }
      U.on(f, 'submit', function (e) { e.preventDefault(); run(); });
      run();
    }
  });

  function renderMeihua(r) {
    var out = [];
    out.push(U.card('起卦', '<p class="small">' + r.cast.method + '：' + r.cast.calc + '</p>' +
      '<div class="hex-wrap" style="grid-template-columns:repeat(3,1fr);gap:16px;margin-top:10px">' +
      hexBlock(r.ben.bin, null, '本卦', '<b>' + (r.ben.info ? r.ben.info.full : r.ben.name) + '</b>') +
      hexBlock(r.hu.bin, null, '互卦', '<b>' + (r.hu.info ? r.hu.info.full : r.hu.name) + '</b>') +
      hexBlock(r.bian.bin, r.moving, '变卦', '<b>' + (r.bian.info ? r.bian.info.full : r.bian.name) + '</b>') +
      '</div>', '《梅花易数》'));

    out.push(U.card('体用', '<div class="kv" style="grid-template-columns:86px 1fr">' +
      '<dt>体卦</dt><dd><b>' + r.ti.tri + '</b>（' + r.ti.wx + '）· ' + r.ti.role + '　<span class="muted small">' + r.ti.xiang + '</span></dd>' +
      '<dt>用卦</dt><dd><b>' + r.yong.tri + '</b>（' + r.yong.wx + '）· ' + r.yong.role + '　<span class="muted small">' + r.yong.xiang + '</span></dd>' +
      '<dt>体用关系</dt><dd><b>' + r.rel + '</b></dd>' +
      '<dt>旺衰</dt><dd>体卦' + r.ti.qi.qi + '（' + r.ti.qi.text + '）；用卦' + r.yong.qi.qi + '（' + r.yong.qi.text + '）</dd>' +
      '<dt>卦气</dt><dd>' + r.qiText + '</dd>' +
      '</div>', '动爻在' + r.moving + '爻为用'));

    out.push(U.card('断语', '<p class="small muted">合计 <b>' + r.score + '</b> 分 · <b>' + r.verdict + '</b></p>' +
      '<div class="section-list" style="margin-top:10px">' + r.reasons.map(function (x) {
        return '<div class="section-item"><h3>' + (x.d > 0 ? '＋' : x.d < 0 ? '−' : '') + Math.abs(x.d) + '</h3><p>' + x.text + '</p>' +
          (x.ref ? '<div class="basis">' + x.ref + '</div>' : '') + '</div>';
      }).join('') + '</div>'));

    var info = r.ben.info || (root.XJHexagrams ? null : null);
    if (info) {
      out.push(U.card('卦辞', hexagramText(info), '《周易》'));
    }
    out.push('<div class="card">' + U.notice('<b>体用之要：</b>体为己身、为所问之事的主体，用为所应之事、为外缘。' +
      '体宜旺不宜衰，用宜生体不宜克体。互卦见事之中途，变卦见事之结局。' +
      '《梅花易数》云「体用之诀，以动静论之」——动者为用，静者为体，此其纲也。') + '</div>');
    return out.join('');
  }
}(typeof window !== 'undefined' ? window : this));
