/* 四柱八字 */
(function (root) {
  'use strict';
  var App = root.XJApp, U = root.XJUI, C = root.XJCalendar, B = root.XJBazi;

  function renderResult(r) {
    var out = [];
    var f = r.pillars;
    var d = r.detail;

    /* 排盘信息 */
    var info = [];
    if (root.XJLunar) {
      var lu = root.XJLunar.solarToLunar(r.input.date);
      if (lu && !lu.outOfRange) info.push('农历 ' + lu.textLong);
    }
    info.push('四柱 ' + f.year.gan + f.year.zhi + ' ' + f.month.gan + f.month.zhi + ' ' + f.day.gan + f.day.zhi + ' ' + f.hour.gan + f.hour.zhi);
    if (r.lunarJie) info.push('生于「' + r.lunarJie.name + '」后（交节 ' + r.lunarJie.date.toLocaleString('zh-CN', { hour12: false }) + '），故月柱取 ' + f.month.gan + f.month.zhi);
    if (r.input.trueSolar) {
      var corr = C.trueSolar(r.input.original, 120);
      info.push('已按真太阳时校正：以当地经度换算，出生时刻由 ' +
        r.input.original.getHours() + ':' + ('0' + r.input.original.getMinutes()).slice(-2) +
        ' 校为 ' + r.input.date.getHours() + ':' + ('0' + r.input.date.getMinutes()).slice(-2) + '（含均时差）');
    }
    out.push(U.card('排盘', '<p class="small muted">' + info.join('；') + '</p>' + U.pillarsTable(f), r.gender + '命'));

    /* 十神与藏干 */
    var heads = ['', '年柱', '月柱', '日柱', '时柱'];
    var cols = [d.year, d.month, d.day, d.hour];
    var rows = '';
    rows += '<tr><td class="muted">天干十神</td>' + cols.map(function (c, i) {
      return '<td>' + (i === 2 ? '<b style="color:var(--cinnabar)">日主</b>' : c.ganSS) + '</td>';
    }).join('') + '</tr>';
    rows += '<tr><td class="muted">地支藏干</td>' + cols.map(function (c) {
      return '<td class="small">' + c.cang.map(function (x) {
        return '<span class="wx-' + x.wx + '">' + x.gan + '</span><span class="muted">·' + x.ss + '</span>';
      }).join('<br>') + '</td>';
    }).join('') + '</tr>';
    rows += '<tr><td class="muted">十二长生</td>' + cols.map(function (c) { return '<td>' + c.changsheng + '</td>'; }).join('') + '</tr>';
    rows += '<tr><td class="muted">纳音</td>' + cols.map(function (c) { return '<td class="small">' + c.nayin + '</td>'; }).join('') + '</tr>';
    rows += '<tr><td class="muted">旬空</td>' + cols.map(function (c) { return '<td>' + (c.kong ? '空' : '—') + '</td>'; }).join('') + '</tr>';

    out.push(U.card('十神 · 藏干 · 长生',
      '<table><thead><tr>' + heads.map(function (x) { return '<th>' + x + '</th>'; }).join('') + '</tr></thead><tbody>' + rows + '</tbody></table>',
      '日主 ' + d.day.gan + '（' + d.day.ganWx + '）'));

    /* 五行旺衰 */
    var y = r.yongshen;
    var wxC = '<div class="grid-2">' + U.wxBars(r.power.pct) +
      '<div class="kv" style="grid-template-columns:96px 1fr">' +
      '<dt>同党</dt><dd>' + y.same.toFixed(1) + '%（比劫 ' + r.tally['比劫'].toFixed(2) + '＋印星 ' + r.tally['印星'].toFixed(2) + '）</dd>' +
      '<dt>判为</dt><dd><b>' + y.level + '</b></dd>' +
      '<dt>格局</dt><dd><b>' + r.geju.name + '</b></dd>' +
      '<dt>用神</dt><dd><b class="wx-' + y.primary.wx + '">' + y.primary.wx + '</b>　' + y.primary.why + '</dd>' +
      '<dt>喜神</dt><dd><b class="wx-' + y.secondary.wx + '">' + y.secondary.wx + '</b>　' + y.secondary.why + '</dd>' +
      '<dt>忌神</dt><dd>' + (y.avoid.length ? y.avoid.map(function (w) { return '<span class="wx-' + w + '">' + w + '</span>'; }).join('、') : '—') + '</dd>' +
      (y.tiaohou ? '<dt>调候</dt><dd>' + y.tiaohou + (y.tiaohouPriority ? '（调候为急）' : '') + '</dd>' : '') +
      '</div></div>';
    out.push(U.card('五行旺衰与用神', wxC,
      '扶抑 · 格局 · 调候'));

    /* 大运 */
    var dy = r.dayun;
    var dyHtml = '<p class="small muted">' + (dy.forward ? '阳男阴女，大运顺行' : '阴男阳女，大运逆行') +
      '；自出生 ' + dy.jie.name + '起算，三日折一年，起运 ' + dy.startAge + ' 岁 ' + dy.startMonth + ' 个月。</p>' +
      '<table><thead><tr><th>大运</th><th>干支</th><th>十神</th><th>起止岁</th><th>起年</th><th>纳音</th></tr></thead><tbody>' +
      dy.list.map(function (x, i) {
        return '<tr><td>' + (i + 1) + '</td><td><b style="font-size:16px">' + x.gan + x.zhi + '</b></td><td>' + (x.shishen || '—') + '</td><td>' +
          x.startAge + '–' + x.endAge + '</td><td>' + x.startYear + '</td><td class="small">' + x.nayin + '</td></tr>';
      }).join('') + '</tbody></table>';
    out.push(U.card('大运', dyHtml, '十年一运'));

    /* 流年 */
    if (r.liunian && r.liunian.length) {
      out.push(U.card('流年', '<table><thead><tr><th>年</th><th>干支</th><th>十神</th><th>虚岁</th></tr></thead><tbody>' +
        r.liunian.slice(0, 12).map(function (l) {
          return '<tr><td>' + l.year + '</td><td><b>' + l.gan + l.zhi + '</b></td><td>' + l.shishen + '</td><td>' + l.age + '</td></tr>';
        }).join('') + '</tbody></table>', '未来十二年'));
    }

    /* 神煞 */
    if (r.shensha && r.shensha.length) {
      out.push(U.card('神煞', '<div class="feature-list">' + r.shensha.map(function (s) {
        return '<div class="feature"><h4>' + s.name + '<span class="muted small">（' + s.pos + '）</span></h4>' +
          '<div class="f-desc">' + s.meaning + '</div><div class="basis">' + s.src + '</div></div>';
      }).join('') + '</div>'));
    }

    /* 刑冲合害 */
    if (r.relations && r.relations.length) {
      out.push(U.card('刑冲合害', '<table><thead><tr><th>关系</th><th>所在</th><th>主事</th></tr></thead><tbody>' +
        r.relations.map(function (x) {
          return '<tr><td>' + (x.type || '天干合') + '</td><td>' + x.text + '</td><td class="small">' + (x.note || '') + '</td></tr>';
        }).join('') + '</tbody></table>'));
    }

    /* 断语 */
    out.push(U.card('断语', U.sections(r.sections), '每条皆附所据'));

    out.push('<div class="card">' + U.notice('<b>读法：</b>八字所论者，「气势之偏」与「用神之向」而已。格局定其体，用神定其用，大运流年定其时。' +
      '若用神得地而得运助，则偏者可正；若忌神当令，则虽美格亦有蹇滞。此中轻重，页内已逐条列明。') + U.disclaimer() + '</div>');
    return out.join('');
  }

  App.page('bazi', {
    render: function () {
      var html = '<div class="page-head"><h1>四柱八字</h1>' +
        '<p class="lede">八字者，以年月日时四柱干支，写一人禀气之偏全。此法本于《渊海子平》，至《子平真诠》而格法大明，' +
        '《滴天髓》畅其旺衰，《穷通宝鉴》明其调候。本站排盘依天文历算（定气、真太阳时），论断则扶抑、格局、调候三路并用，每段断语皆注所据。</p></div>';

      html += '<div class="card"><div class="card-title"><h2>输入生辰</h2><span class="tag">公历 · 北京时间</span></div>' +
        '<form id="bz-form"><div class="form-grid">' +
        U.field('出生日期（公历）', '<input type="date" name="date" value="1990-06-17" required>') +
        U.field('出生时刻', '<input type="time" name="time" value="10:30" step="60">', '不确定者可填 12:00，时柱仅供参考') +
        U.field('性别', U.radios('gender', ['男', '女'], '男'), '大运顺逆依阴阳男女而定') +
        U.field('子时划分', U.select('ziRule', [{ v: 'late', t: '夜子时（23:00 起为次日）' }, { v: 'early', t: '早子时（23:00 仍属当日）' }], 'late')) +
        U.field('经度（真太阳时）', '<input type="number" name="lon" value="116.4" step="0.1" min="73" max="135">', '东经，北京 116.4，上海 121.5') +
        U.field('真太阳时', U.radios('ts', [{ v: '1', t: '校正' }, { v: '0', t: '不校正' }], '1'), '校正含经度差与均时差') +
        '</div><div class="btn-row"><button class="btn" type="submit">排盘</button>' +
        '<span class="muted small">日期范围 1900–2100（农历表上限）；节气时刻误差约数分钟</span></div></form></div>';

      html += '<div id="bz-out"></div>';
      return html;
    },
    after: function () {
      var f = document.getElementById('bz-form');
      var out = document.getElementById('bz-out');
      function run() {
        try {
          var dv = U.formVal(f, 'date'), tv = U.formVal(f, 'time') || '12:00';
          if (!dv) return;
          var p = dv.split('-').map(Number), t = tv.split(':').map(Number);
          var dt = new Date(p[0], p[1] - 1, p[2], t[0] || 0, t[1] || 0, 0);
          var r = B.analyze({
            date: dt,
            gender: U.formVal(f, 'gender') || '男',
            ziRule: U.formVal(f, 'ziRule') === 'early' ? 'early' : 'late',
            trueSolar: U.formVal(f, 'ts') === '1',
            longitude: parseFloat(U.formVal(f, 'lon')) || 120
          });
          out.innerHTML = renderResult(r);
        } catch (e) {
          out.innerHTML = U.err('排盘失败：' + (e && e.message ? e.message : e));
          console.error(e);
        }
      }
      U.on(f, 'submit', function (e) { e.preventDefault(); run(); });
      run();
    }
  });
}(typeof window !== 'undefined' ? window : this));
