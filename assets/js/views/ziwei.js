/* 紫微斗数 · 河洛理数 */
(function (root) {
  'use strict';
  var App = root.XJApp, U = root.XJUI, C = root.XJCalendar;

  /* 紫微十二宫在四四方盘中的位置 */
  var POS = { 5: [1, 1], 6: [1, 2], 7: [1, 3], 8: [1, 4], 9: [2, 4], 10: [3, 4], 11: [4, 4], 0: [4, 3], 1: [4, 2], 2: [4, 1], 3: [3, 1], 4: [2, 1] };

  function gongCell(g, isMing, isShen) {
    var stars = g.stars.map(function (s) {
      var hua = g.sihua && g.sihua[s.name];
      return '<span class="zw-star" title="' + s.desc + '">' + s.name + (hua ? '<i class="hua">' + hua + '</i>' : '') + '</span>';
    }).join('');
    var fu = (g.fu || []).map(function (f) { return '<span class="zw-fu">' + f + '</span>'; }).join('');
    return '<div class="zw-gong' + (isMing ? ' ming' : '') + '">' +
      '<div class="zw-head"><span class="zw-name">' + g.name + '</span>' +
      '<span class="zw-gz">' + g.gan + g.zhi + '<span class="muted">' + g.wx + '</span></span></div>' +
      '<div class="zw-stars">' + stars + '</div>' +
      '<div class="zw-fu-row">' + fu + '</div>' +
      (isShen ? '<div class="zw-shen">身宫</div>' : '') +
      '</div>';
  }

  App.page('ziwei', {
    render: function () {
      var html = '<div class="page-head"><h1>紫微斗数</h1>' +
        '<p class="lede">紫微以农历生日与时辰安命宫：寅宫起正月，顺数至生月，再由生月宫起子时、逆数至生时，即命宫；由生月宫起子时顺数至生时，即身宫。' +
        '命宫纳音定五行局（水二、木三、金四、土五、火六），依局数与生日安紫微星，天府与之相对，十四主星依次布列。' +
        '本法依《紫微斗数全书》安星诀；星曜亮度古表歧异，故不用亮度，改以星曜五行与宫位五行之生克论「得地」与否，页面已注明。</p></div>';

      html += '<div class="card"><div class="card-title"><h2>排盘</h2><span class="tag">公历输入 · 自动换算农历</span></div>' +
        '<form id="zw-form"><div class="form-grid">' +
        U.field('出生日期（公历）', '<input type="date" name="date" value="1990-06-17">') +
        U.field('出生时辰', U.select('hour', C.ZHI.map(function (z, i) { return { v: i, t: z + '时（' + C.SHICHEN_NAME[i] + '）' }; }), 5)) +
        U.field('性别', U.radios('gender', ['男', '女'], '女'), '决定大限顺逆') +
        '<div style="grid-column:1/-1">' + U.askField('') + '</div>' +
        '</div><div class="btn-row"><button class="btn" type="submit">排紫微盘</button>' +
        '<span class="muted small">农历范围 1900–2100</span></div></form></div>' +
        '<div id="zw-out"></div>';
      return html;
    },
    after: function () {
      var f = document.getElementById('zw-form'), out = document.getElementById('zw-out');
      function run() {
        try {
          var dv = U.formVal(f, 'date').split('-').map(Number);
          var hz = parseInt(U.formVal(f, 'hour'), 10);
          var dt = new Date(dv[0], dv[1] - 1, dv[2], hz === 0 ? 0 : hz * 2 - 1, 30, 0);
          var r = root.XJZiwei.analyze({ date: dt, gender: U.formVal(f, 'gender') || '男' });
          out.innerHTML = renderZiwei(r, U.askValue(f));
        } catch (e) {
          out.innerHTML = U.err('排盘失败：' + (e && e.message ? e.message : e));
          console.error(e);
        }
      }
      U.on(f, 'submit', function (e) { e.preventDefault(); run(); });
      run();
    }
  });

  function renderZiwei(r, q) {
    var out = [];
    var cells = [];
    for (var i = 0; i < 12; i++) {
      var g = null;
      for (var k = 0; k < r.gongs.length; k++) if (r.gongs[k].idx === i) g = r.gongs[k];
      if (!g) continue;
      var p = POS[i];
      cells.push('<div class="zw-cell" style="grid-row:' + p[0] + ';grid-column:' + p[1] + '">' +
        gongCell(g, i === r.ming, i === r.shen) + '</div>');
    }
    var center = '<div class="zw-cell zw-center" style="grid-row:2/4;grid-column:2/4">' +
      '<div class="zw-center-in">' +
      '<div class="zw-year">' + r.yearGZ.text + '年 · ' + r.gender + '命</div>' +
      '<div class="zw-ju">' + r.juName + '</div>' +
      '<dl class="kv" style="grid-template-columns:64px 1fr;text-align:left;margin-top:10px">' +
      '<dt>农历</dt><dd>' + r.lunar.ly + '年' + (r.lunar.isLeap ? '闰' : '') + r.lunar.lm + '月' + r.lunar.ld + '日 ' + r.hourZhi + '时</dd>' +
      '<dt>命宫</dt><dd>' + r.mingGong.gan + r.mingGong.zhi + '（' + r.mingGong.wx + '）</dd>' +
      '<dt>身宫</dt><dd>' + r.shenGong.name + '（' + r.shenGong.gan + r.shenGong.zhi + '）</dd>' +
      '<dt>命主</dt><dd>' + r.mingZhu + '</dd>' +
      '<dt>身主</dt><dd>' + r.shenZhu + '</dd>' +
      '<dt>四化</dt><dd>' + ['禄', '权', '科', '忌'].map(function (h, i) {
        return r.sihua.list[i] + '<span class="hua">' + h + '</span>';
      }).join(' ') + '</dd>' +
      '<dt>大限</dt><dd>' + (r.forward ? '顺行' : '逆行') + '，起 ' + r.ju + ' 岁</dd>' +
      '</dl></div></div>';

    out.push('<div class="card"><div class="card-title"><h2>命盘</h2><span class="tag">十二宫 · 十四主星</span></div>' +
      '<div class="zw-scroll"><div class="zw-board">' + center + cells.join('') + '</div></div>' +
      '<p class="small muted" style="margin-top:12px">红框为命宫，身宫另标。星下小字为四化（禄权科忌）。「得地」以星曜五行与宫位五行生克判：宫生星、星宫比和为得地，星生宫为泄，宫克星为受制。</p></div>');

    /* 命宫断 */
    var secs = [];
    secs.push({
      title: '命宫总论',
      body: '命宫在<b>' + r.mingGong.gan + r.mingGong.zhi + '</b>（' + r.mingGong.wx + '），' + r.juName + '。所坐主星：' +
        (r.mingGong.stars.length ? r.mingGong.stars.map(function (s) {
          return '<b>' + s.name + '</b>（' + s.wx + '，' + s.de + '）——' + s.desc;
        }).join('；') : '本宫无主星，借对宫（迁移）之星为用。'),
      basis: '《紫微斗数全书》论命宫、星曜性情'
    });
    var san = r.sanfang.map(function (i) {
      var g = null;
      for (var k = 0; k < r.gongs.length; k++) if (r.gongs[k].idx === i) g = r.gongs[k];
      return g;
    }).filter(Boolean);
    secs.push({
      title: '三方四正',
      body: '命宫三方四正为：' + san.map(function (g) {
        return g.name + '（' + g.gan + g.zhi + '）' + (g.stars.length ? '：' + g.stars.map(function (s) { return s.name; }).join('、') : '：空宫');
      }).join('　') + '。三方所聚之星，即一生所遇之势；吉星聚则助力多，煞星会则磨炼重。',
      basis: '《紫微斗数全书》论三方四正'
    });
    if (r.shenGong) {
      secs.push({
        title: '身宫',
        body: '身宫落<b>' + r.shenGong.name + '</b>（' + r.shenGong.gan + r.shenGong.zhi + '）。身宫主后天作为与中年后之趋向：落命宫者自主性强，落财帛者重实利，落官禄者重事业，落夫妻者重情感，落迁移者宜外出发展。',
        basis: '《紫微斗数全书》论身宫'
      });
    }
    out.push(U.card('命理断语', U.sections(secs), '依法推演'));

    var mBox = U.modern('ziwei', r, q);
    if (mBox) out.push(mBox);

    /* 大限 */
    out.push(U.card('大限', '<table><thead><tr><th>限</th><th>宫位</th><th>干支</th><th>岁数</th><th>主星</th></tr></thead><tbody>' +
      r.dayun.map(function (d, i) {
        return '<tr' + (d.gong === '命宫' ? ' style="background:rgba(156,43,35,.05)"' : '') + '><td>' + (i + 1) + '</td><td>' + d.gong + '</td><td>' + d.gan + d.zhi + '</td><td>' + d.from + '–' + d.to + '</td><td class="small">' + (d.stars.join('、') || '空宫') + '</td></tr>';
      }).join('') + '</tbody></table>' +
      '<p class="small muted" style="margin-top:10px">大限一宫十年，' + (r.forward ? '阳男阴女顺行' : '阴男阳女逆行') + '。限内吉凶，须合本命、流年参看，非独以主星断。</p>', '十年一限'));

    out.push('<div class="card">' + U.notice('<b>关于亮度：</b>紫微诸星有「庙旺利陷」之说，然传本亮度表互有出入（《全书》与《全集》即不同），' +
      '本站不敢以一家之表冒充定论，故改用<b>星曜五行与宫位五行的生克</b>判其得地与否——此为依法推演，已在星名后注明。') + U.disclaimer() + '</div>');
    return out.join('');
  }

  /* ================= 河洛理数 ================= */
  App.page('heluo', {
    render: function () {
      var html = '<div class="page-head"><h1>河洛理数</h1>' +
        '<p class="lede">河洛理数以人之一生系于天地二数：天干配河图之数、地支配洛书之数，奇数属阳为天数，偶数属阴为地数。' +
        '天数除二十五、地数除三十，取其余数，依「一坎二坤三震四巽五寄宫六乾七兑八艮九离」成上下卦，' +
        '阳男阴女天卦居上、阴男阳女地卦居下，合为先天卦；六爻俱变、内外互移，则为后天卦。' +
        '此法出陈抟《河洛真数》，为宋以来「以数明理」之一派。</p></div>';

      html += '<div class="card"><div class="card-title"><h2>起数</h2><span class="tag">天地二数 · 先天后天</span></div>' +
        '<form id="hl2-form"><div class="form-grid">' +
        U.field('出生日期（公历）', '<input type="date" name="date" value="1990-06-17">') +
        U.field('出生时刻', '<input type="time" name="time" value="10:30">') +
        U.field('性别', U.radios('gender', ['男', '女'], '男')) +
        '<div style="grid-column:1/-1">' + U.askField('') + '</div>' +
        '</div><div class="btn-row"><button class="btn" type="submit">推河洛数</button></div></form></div>' +
        '<div id="hl2-out"></div>';

      html += U.card('化数表', '<table><thead><tr><th>天干（河图数）</th><th>数</th><th>地支（洛书数）</th><th>数</th></tr></thead><tbody>' +
        [['甲', '3', '子', '1'], ['乙', '8', '丑', '10'], ['丙', '7', '寅', '3'], ['丁', '2', '卯', '8'], ['戊', '5', '辰', '5'], ['己', '10', '巳', '7'],
        ['庚', '9', '午', '2'], ['辛', '4', '未', '10'], ['壬', '1', '申', '9'], ['癸', '6', '酉', '4'], ['', '', '戌', '5'], ['', '', '亥', '6']].map(function (r) {
          return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td></tr>';
        }).join('') + '</tbody></table>' +
        '<p class="small muted" style="margin-top:10px">河图数依五行：木三八、火二七、土五十、金四九、水一六，阳干取奇、阴干取偶；' +
        '洛书数依方位：一六水（子亥）、二七火（巳午）、三八木（寅卯）、四九金（申酉）、五十土（辰戌丑未）。' +
        '奇数为天、偶数为地，与干支阴阳恰相合。</p>', '《河洛真数·求数法》');

      return html;
    },
    after: function () {
      var f = document.getElementById('hl2-form'), out = document.getElementById('hl2-out');
      function run() {
        try {
          var dv = U.formVal(f, 'date').split('-').map(Number);
          var tv = U.formVal(f, 'time').split(':').map(Number);
          var dt = new Date(dv[0], dv[1] - 1, dv[2], tv[0] || 0, tv[1] || 0, 0);
          var r = root.XJHeluo.analyze({ date: dt, gender: U.formVal(f, 'gender') || '男', year: dv[0] });
          out.innerHTML = renderHeluo(r, U.askValue(f));
        } catch (e) {
          out.innerHTML = U.err('起数失败：' + (e && e.message ? e.message : e));
          console.error(e);
        }
      }
      U.on(f, 'submit', function (e) { e.preventDefault(); run(); });
      run();
    }
  });

  function renderHeluo(r, q) {
    var out = [];
    out.push(U.card('化数', '<table><thead><tr><th>柱</th><th>干支</th><th>干数</th><th>支数</th><th>归</th></tr></thead><tbody>' +
      r.detail.map(function (d) {
        return '<tr><td>' + d.col + '</td><td><b>' + d.gz + '</b></td>' +
          '<td>' + d.gan + ' → ' + d.ganNum + (d.ganOdd ? '（阳）' : '（阴）') + '</td>' +
          '<td>' + d.zhi + ' → ' + d.zhiNum + (d.zhiOdd ? '（阳）' : '（阴）') + '</td>' +
          '<td>' + (d.ganOdd ? '天' : '地') + (d.zhiOdd ? '天' : '地') + '</td></tr>';
      }).join('') + '</tbody></table>' +
      '<p class="small" style="margin-top:12px">天数合计 <b>' + r.heavenly + '</b>，地数合计 <b>' + r.earthly + '</b>。' +
      '（天数' + r.hState + '二十五，地数' + r.eState + '三十。）</p>',
      '天干河图 · 地支洛书'));

    out.push(U.card('先天 · 后天', '<div class="hex-wrap" style="grid-template-columns:1fr 1fr;gap:20px">' +
      '<div style="text-align:center"><div class="small muted">先天卦 · ' + r.tianGua + '上' + r.diGua + '下</div>' +
      U.hexFigure(r.xiantian.bin) + '<div style="margin-top:8px"><b>' + r.xiantian.name + '</b></div></div>' +
      '<div style="text-align:center"><div class="small muted">后天卦 · 六爻俱变内外互移</div>' +
      U.hexFigure(r.houtian.bin) + '<div style="margin-top:8px"><b>' + r.houtian.name + '</b></div></div>' +
      '</div>' +
      '<div class="kv" style="margin-top:18px;grid-template-columns:100px 1fr">' +
      '<dt>元堂</dt><dd>' + r.yuantang.name + '（第 ' + r.yuantang.pos + ' 爻）<span class="muted small">　依生时阴阳择爻之简法</span></dd>' +
      '<dt>三元</dt><dd>' + r.yuan + (r.jiGongNote ? '；' + r.jiGongNote : '') + '</dd>' +
      '</div>', '《河洛真数·成卦法》'));

    out.push(U.card('推断', '<ul style="margin:0;padding-left:20px;line-height:2">' +
      r.reasons.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
      '<div class="quote" style="margin-top:16px">' + r.verdict + '<span class="src">' + r.classic + '</span></div>' +
      '<p class="small muted" style="margin-top:12px">「元堂」为一卦之枢，主一生出处进退。原法于阴阳时、重数、乾坤特例皆有细例，本站取简法，故元堂一项只作参考。</p>',
      '《河洛真数·起例》'));

    /* 卦辞 */
    var H = root.XJHexagrams;
    if (H) {
      var a = r.xianInfo, b = r.houInfo;
      var t = '';
      if (a) t += '<h3>' + a.full + '</h3>' + U.quote('「' + a.text + '」', '卦辞');
      if (b) t += '<hr class="rule"><h3>' + b.full + '</h3>' + U.quote('「' + b.text + '」', '卦辞');
      if (t) out.push(U.card('卦辞', t, '《周易》'));
    }
    var mBox2 = U.modern('heluo', r, q);
    if (mBox2) out.push(mBox2);
    out.push('<div class="card">' + U.notice('<b>传本之异：</b>河洛理数求数之法，传本略有出入（有以天干配洛书、地支配河图者，亦有专用太玄数者）。' +
      '本站依《河洛真数》原文「天干配河图之数、地支配洛书之数」之说，并依「遇十不用」「遇五寄宫」二例，过程全列于上，供君按验。') + U.disclaimer() + '</div>');
    return out.join('');
  }
}(typeof window !== 'undefined' ? window : this));
