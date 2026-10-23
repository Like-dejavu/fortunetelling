/* 首页 · 黄历吉凶 · 依据说明 */
(function (root) {
  'use strict';
  var App = root.XJApp, U = root.XJUI, C = root.XJCalendar;

  function todayPillars(d) { return C.fourPillars(d, {}); }

  /* ---------- 吉神方位（依日干起，通行之说） ---------- */
  var XI_SHEN = { '甲': '艮（东北）', '己': '艮（东北）', '乙': '乾（西北）', '庚': '乾（西北）', '丙': '坤（西南）', '辛': '坤（西南）', '丁': '离（正南）', '壬': '离（正南）', '戊': '巽（东南）', '癸': '巽（东南）' };
  var CAI_SHEN = { '甲': '艮（东北）', '乙': '艮（东北）', '丙': '坤（西南）', '丁': '坤（西南）', '戊': '坎（正北）', '己': '坎（正北）', '庚': '震（正东）', '辛': '震（正东）', '壬': '离（正南）', '癸': '离（正南）' };

  var ITEMS = ['嫁娶', '出行', '开市', '动土', '安葬', '祭祀', '修造', '纳财', '上任', '求医', '栽种', '入学'];

  function dayInfo(d) {
    var f = todayPillars(d);
    var mz = C.ZHI.indexOf(f.month.zhi), dz = C.ZHI.indexOf(f.day.zhi);
    var jc = C.jianchu(mz, dz);
    var cs = C.chongSha(dz);
    var lu = root.XJLunar ? root.XJLunar.solarToLunar(d) : null;
    return {
      dt: d, four: f, jianchu: jc, chongsha: cs, lunar: lu,
      pengzuGan: C.PENGZU_GAN[C.GAN.indexOf(f.day.gan)],
      pengzuZhi: C.PENGZU_ZHI[dz],
      xiShen: XI_SHEN[f.day.gan], caiShen: CAI_SHEN[f.day.gan],
      lastJie: C.lastJie(d), nextJie: C.nextJie(d)
    };
  }

  function huangliCard(info, compact) {
    var f = info.four;
    var jc = info.jianchu;
    var b = [];
    b.push('<div class="kv" style="grid-template-columns:96px 1fr">');
    b.push('<dt>公历</dt><dd>' + info.dt.getFullYear() + ' 年 ' + (info.dt.getMonth() + 1) + ' 月 ' + info.dt.getDate() + ' 日 ' + '周' + '日一二三四五六'.charAt(info.dt.getDay()) + '</dd>');
    if (info.lunar && !info.lunar.outOfRange) {
      b.push('<dt>农历</dt><dd>' + info.lunar.textLong + '（' + info.lunar.yearShengxiao + '年）</dd>');
    }
    b.push('<dt>干支</dt><dd><span class="hl">' + f.year.gan + f.year.zhi + '</span>年　<span class="hl">' + f.month.gan + f.month.zhi + '</span>月　<span class="hl" style="color:var(--cinnabar)">' + f.day.gan + f.day.zhi + '</span>日　<span class="muted small">（时柱随时辰而变，须与具体时刻同参，此处不列）</span></dd>');
    b.push('<dt>建除</dt><dd><b>' + jc.name + '日</b>　' + (jc.isHuangDao ? '<span class="badge on">黄道</span>' : '<span class="badge">黑道</span>') + '　<span class="muted small">（除、危、定、执、成、开为黄道）</span></dd>');
    b.push('<dt>宜</dt><dd class="yi">' + (jc.yiji.yi || '—') + '</dd>');
    b.push('<dt>忌</dt><dd class="ji">' + (jc.yiji.ji || '—') + '</dd>');
    b.push('<dt>冲煞</dt><dd>冲' + info.chongsha.chongZhi + '（' + info.chongsha.chongShengxiao + '）煞' + info.chongsha.sha + '</dd>');
    b.push('<dt>彭祖</dt><dd>' + info.pengzuGan + '；' + info.pengzuZhi + '</dd>');
    b.push('<dt>吉神方</dt><dd>喜神 ' + info.xiShen + '　财神 ' + info.caiShen + '</dd>');
    b.push('<dt>节气</dt><dd>节令「' + info.lastJie.name + '」后 ' + Math.floor((info.dt - info.lastJie.date) / 864e5) + ' 日，距「' + info.nextJie.name + '」尚有 ' + Math.ceil((info.nextJie.date - info.dt) / 864e5) + ' 日</dd>');
    b.push('</div>');
    return U.card(compact ? '今日' : '黄历', b.join(''), jc.name + '日');
  }

  /* ================= 首页 ================= */
  var ENTRIES = [
    { id: 'ask', gl: '问', en: 'Ask', ds: '把所问交与术数 · 择法而断' },
    { id: 'huangli', gl: '吉', en: 'Almanac', ds: '建除十二神 · 宜忌 · 冲煞' },
    { id: 'bazi', gl: '命', en: 'Four Pillars', ds: '子平八字 · 五行旺衰 · 用神' },
    { id: 'liuyao', gl: '卦', en: 'Six Lines', ds: '京房纳甲 · 世应六亲 · 动变' },
    { id: 'meihua', gl: '梅', en: 'Plum Blossom', ds: '体用互变 · 先天起卦' },
    { id: 'ziwei', gl: '斗', en: 'Zi Wei', ds: '紫微安星 · 十二宫 · 四化' },
    { id: 'heluo', gl: '洛', en: 'He Luo', ds: '河洛真数 · 天地二数成卦' },
    { id: 'cezi', gl: '字', en: 'Character', ds: '测字秘牒 · 十法 · 观梅' },
    { id: 'dream', gl: '梦', en: 'Dreams', ds: '周公解梦 · 十类梦象' },
    { id: 'palm', gl: '掌', en: 'Palmistry', ds: '三才纹 · 五行手 · 掌丘' },
    { id: 'face', gl: '相', en: 'Physiognomy', ds: '三停五岳 · 五官十二宫' },
    { id: 'daodejing', gl: '道', en: 'Tao Te Ching', ds: '八十一章全文 · 义理索引' }
  ];

  App.page('home', {
    render: function () {
      var info = dayInfo(new Date());
      var taiji = '<svg class="taiji" viewBox="0 0 100 100" aria-hidden="true">' +
        '<circle cx="50" cy="50" r="48" fill="#1d1b18"/>' +
        '<path d="M50 2a48 48 0 0 1 0 96 24 24 0 0 1 0-48 24 24 0 0 0 0-48z" fill="#f4eee0"/>' +
        '<circle cx="50" cy="26" r="8" fill="#1d1b18"/><circle cx="50" cy="74" r="8" fill="#f4eee0"/></svg>';

      var html = '<div class="hero">' + taiji +
        '<h1>玄鉴</h1>' +
        '<div class="epi">观乎天文，以察时变；观乎人文，以化成天下</div>' +
        '<div class="epi-src">《周易·贲卦·彖传》</div>' +
        '</div>';

      html += '<div class="entry-grid">' + ENTRIES.map(function (e) {
        return '<a class="entry" href="#/' + e.id + '"><span class="gl">' + e.gl + '</span>' +
          '<span class="en">' + e.en + '</span><span class="ds">' + e.ds + '</span></a>';
      }).join('') + '</div>';

      html += '<div class="card"><div class="card-title"><h2>本站如何「有理有据」</h2><span class="tag">方法</span></div>' +
        '<p>一切结果由三道工序生成：<b>一、依算法推出象</b>（历法用 Meeus 视黄经定节气、儒略日定干支；四柱用五虎遁五鼠遁、藏干纳音；六爻用京房八宫纳甲；梅花用先天数体用；紫微用安星诀）；' +
        '<b>二、依经义定断</b>（每一段断语都挂一部书、一句话，如《子平真诠》论格局、《增删卜易》论用神、《冰鉴》论神骨）；' +
        '<b>三、列出过程供复核</b>（五行权重、用神取舍、卦爻五行、安星位置，全部可查）。</p>' +
        '<p class="muted small">凡引号内的文字为古籍原文（如《道德经》《周易》卦爻辞、《冰鉴》句）；未加引号者为依经义之推演，不冒充原文，并注明「依法推演」。</p>' +
        '</div>';

      html += huangliCard(info, true);
      html += '<div class="card">' + U.disclaimer() + '</div>';
      return html;
    }
  });

  /* ================= 黄历 · 算吉凶 ================= */
  App.page('huangli', {
    render: function () {
      var now = new Date();
      var dstr = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
      var html = '<div class="page-head"><h1>黄历 · 算吉凶</h1>' +
        '<p class="lede">择日之要，在建除十二神与日辰冲煞。建除依月建与日支相配而生：正月建寅，寅日即「建」，卯日「除」，顺行十二辰。' +
        '所谓「除、危、定、执、成、开」六日为黄道，余六日为黑道。此处一切宜忌，皆由建除值日与日辰干支推出，不假外求。</p></div>';

      html += '<div class="card"><div class="card-title"><h2>查一日</h2><span class="tag">建除 · 冲煞 · 彭祖</span></div>' +
        '<form id="hl-form"><div class="form-grid">' +
        U.field('公历日期', '<input type="date" name="date" value="' + dstr + '">') +
        '</div><div class="btn-row"><button class="btn" type="submit">推算此日</button></div></form>' +
        '<div id="hl-out" style="margin-top:20px"></div></div>';

      html += '<div class="card"><div class="card-title"><h2>择日 · 择一事而求吉日</h2><span class="tag">未来 60 日</span></div>' +
        '<p class="small muted">依建除值日之宜忌筛选：凡所宜含此事、所忌不含此事者，列为可用之日；并可避开冲生肖之日。' +
        '（建除宜忌为通行之说，古书所载互有出入，故只作参考，不作独断。）</p>' +
        '<form id="zr-form"><div class="form-grid">' +
        U.field('所行之事', U.select('item', ITEMS, '嫁娶')) +
        U.field('起始日期', '<input type="date" name="from" value="' + dstr + '">') +
        U.field('避冲生肖（可空）', U.select('sx', [{ v: '', t: '不避' }].concat(C.SHENGXIAO.map(function (s) { return { v: s, t: s }; })), '')) +
        U.field('查看天数', U.select('days', [{ v: 30, t: '30 日' }, { v: 60, t: '60 日' }, { v: 90, t: '90 日' }], 60)) +
        '</div><div class="btn-row"><button class="btn" type="submit">筛选吉日</button></div></form>' +
        '<div id="zr-out" style="margin-top:18px"></div></div>';

      html += '<div class="card"><div class="card-title"><h2>建除十二神宜忌总表</h2><span class="tag">通行之说</span></div>' +
        '<table><thead><tr><th>值日</th><th>黄黑道</th><th>所宜</th><th>所忌</th></tr></thead><tbody>' +
        Object.keys(C.JIANCHU_YIJI).map(function (k) {
          var y = C.JIANCHU_YIJI[k];
          var huang = ['除', '危', '定', '执', '成', '开'].indexOf(k) >= 0;
          return '<tr><td><b>' + k + '</b></td><td>' + (huang ? '<span class="badge on">黄道</span>' : '<span class="badge">黑道</span>') + '</td><td>' + y.yi + '</td><td>' + y.ji + '</td></tr>';
        }).join('') + '</tbody></table></div>';

      return html;
    },
    after: function () {
      var f = document.getElementById('hl-form');
      var out = document.getElementById('hl-out');
      function run() {
        var v = U.formVal(f, 'date');
        if (!v) return;
        var parts = v.split('-').map(Number);
        var d = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
        var info = dayInfo(d);
        out.innerHTML = huangliCard(info, false);
      }
      U.on(f, 'submit', function (e) { e.preventDefault(); run(); });
      run();

      var zf = document.getElementById('zr-form'), zout = document.getElementById('zr-out');
      function pick() {
        var item = U.formVal(zf, 'item'), from = U.formVal(zf, 'from');
        var sx = U.formVal(zf, 'sx'), days = parseInt(U.formVal(zf, 'days'), 10) || 60;
        if (!from) return;
        var p = from.split('-').map(Number);
        var start = new Date(p[0], p[1] - 1, p[2], 12, 0, 0);
        var rows = [];
        for (var i = 0; i < days; i++) {
          var d = new Date(start.getTime() + i * 864e5);
          var info = dayInfo(d);
          var yi = info.jianchu.yiji.yi || '', ji = info.jianchu.yiji.ji || '';
          if (yi.indexOf(item) < 0) continue;
          if (ji.indexOf(item) >= 0) continue;
          if (sx && info.chongsha.chongShengxiao === sx) continue;
          rows.push(info);
        }
        if (!rows.length) { zout.innerHTML = U.notice('此期间无合乎条件之日。可放宽天数，或换一事。'); return; }
        zout.innerHTML = '<p class="small">共得 <b>' + rows.length + '</b> 日。黄道日以朱色标出。</p>' +
          '<table><thead><tr><th>公历</th><th>农历</th><th>干支</th><th>建除</th><th>宜（摘）</th><th>冲煞</th></tr></thead><tbody>' +
          rows.slice(0, 40).map(function (r) {
            return '<tr' + (r.jianchu.isHuangDao ? ' style="background:rgba(156,43,35,.05)"' : '') + '>' +
              '<td>' + (r.dt.getMonth() + 1) + '/' + r.dt.getDate() + ' 周' + '日一二三四五六'.charAt(r.dt.getDay()) + '</td>' +
              '<td class="small">' + (r.lunar && !r.lunar.outOfRange ? r.lunar.monthName + r.lunar.dayName : '—') + '</td>' +
              '<td>' + r.four.day.gan + r.four.day.zhi + '</td>' +
              '<td>' + r.jianchu.name + (r.jianchu.isHuangDao ? ' <span class="badge on">黄</span>' : '') + '</td>' +
              '<td class="small">' + r.jianchu.yiji.yi + '</td>' +
              '<td class="small">冲' + r.chongsha.chongShengxiao + ' 煞' + r.chongsha.sha + '</td></tr>';
          }).join('') + '</tbody></table>' +
          '<p class="small muted" style="margin-top:10px">只列前 40 日。择日尚需合主事者八字，勿单凭建除。</p>';
      }
      U.on(zf, 'submit', function (e) { e.preventDefault(); pick(); });
      pick();
    }
  });

  /* ================= 依据 ================= */
  App.page('about', {
    render: function () {
      var books = [
        ['周易 / 易经', '六十四卦卦辞、彖传、象传、爻辞；占筮之体例。', '卦爻辞逐字录入（据维基文库《周易》），六爻、梅花、河洛诸占皆以之为断辞。'],
        ['周公解梦', '梦象分类与吉凶断语。', '通行本（民间辑本）条目，注明「通行本」，不冒充《周公》原书。'],
        ['六爻 / 京房纳甲', '八宫卦序、纳甲、世应、六亲、六神、动变生克。', '《京房易传》八宫次第；断法参《增删卜易》《卜筮正宗》。'],
        ['梅花易数', '先天数起卦、体用、互卦、变卦。', '邵雍《梅花易数》卷一所载年月日时起卦法与体用生克。'],
        ['子平八字', '四柱、十神、藏干、旺衰、格局、用神、大运。', '《渊海子平》《子平真诠》论格局，《滴天髓》论旺衰，《穷通宝鉴》论调候。'],
        ['紫微斗数', '安命身宫、五行局、十四主星、四化、大限。', '《紫微斗数全书》安星诀。星曜亮度古表歧异，本站改以星曜五行与宫位五行生克论得地，已在页内注明。'],
        ['河洛理数', '天地二数成卦、先天后天、元堂。', '陈抟《河洛真数》求数法、成卦法、定数合卦例、遇十不用、遇五寄宫。'],
        ['测字秘牒 / 神机相字法', '测字十法（装头、接脚、穿心、包笼、破解、添笔、减笔、对关、摘字、观梅）、观梅数笔画、部首五行、字义吉凶、月建日辰生克。', '清·程省《测字秘牒》，十法引文逐字取自殆知阁整理本；《神机相字法》原书已佚，仅存《四库全书总目》卷一一一之提要，故只作通说，不引正文。'],
        ['冰鉴', '神、骨、气、色、声、须眉。', '曾国藩《冰鉴》。本站只引可确证之句，余标「相书通说」。'],
        ['麻衣相法 / 神相全编', '三停五岳、五官十二宫、三才纹、五行手。', '五官之名（保寿、监察、审辨、出纳、采听）本于此系相书。'],
        ['道德经', '八十一章全文，义理索引。', '王弼通行本，取维基文库经文，已剔王弼注。'],
        ['协纪辨方书', '建除十二神、宜忌、黄道黑道。', '建除起例与「除危定执成开为黄道」之说。']
      ];
      var html = '<div class="page-head"><h1>依据 · 方法与限度</h1>' +
        '<p class="lede">术数之所以可信者，不在其灵，而在其「可复按」。故本站每一断语，必附所据；每一推算，必列过程。</p></div>';

      html += U.card('所据典籍', '<table><thead><tr><th>典籍</th><th>所取内容</th><th>说明</th></tr></thead><tbody>' +
        books.map(function (b) { return '<tr><td><b>' + b[0] + '</b></td><td>' + b[1] + '</td><td class="small">' + b[2] + '</td></tr>'; }).join('') +
        '</tbody></table>');

      html += U.card('三道工序', '<div class="section-list">' +
        '<div class="section-item"><h3>一 · 依算法推出象</h3><p>历法：Meeus 视黄经解定气，得二十四节气时刻；儒略日推日干支（锚点 1949-10-01 甲子日）；五虎遁定月干、五鼠遁定时干；藏干、纳音、旬空皆依表推算。' +
        '六爻：八宫卦序由「本宫→逐爻变→游魂→归魂」生成，纳甲依京房表，世应依宫序定。紫微：五行局由命宫纳音定，安紫微星依「商数除局、余数奇逆偶顺」之法。</p></div>' +
        '<div class="section-item"><h3>二 · 依经义定断</h3><p>断语不作玄虚之谈：八字论格局则引《子平真诠》「八字用神，专求月令」；论用神则分扶抑、调候、通关三路；' +
        '六爻论用神则先取六亲所主，再看月建日辰生克；梅花论体用则「体为己、用为事」。每一段皆指明据何书何法。</p></div>' +
        '<div class="section-item"><h3>三 · 列出过程供复核</h3><p>五行权重有具体百分比与算式，用神取舍有得分与理由，卦爻有纳甲与旺衰，安星有位置与局数，梦境有分类与条目。' +
        '君可逐条核对，若有不合，即是本站之误，而非典籍之误。</p></div></div>');

      html += U.card('限度与诚实', '<div class="section-list">' +
        '<div class="section-item"><h3>节气误差</h3><p>本站节气用低精度视黄经算法（Meeus 第 25 章），与紫金山天文台历书相较，多在数分钟之内（例：2024 年立春本站 16:20，历书 16:26）。' +
        '故生于节气交节前后数分钟者，年柱月柱或有出入，页面会同时列出交节时刻，供君自辨。</p></div>' +
        '<div class="section-item"><h3>版本异文</h3><p>古籍传本互有出入：紫微星曜亮度表各家不同，河洛理数求数亦有异说，建除宜忌各书不一。遇此等处，本站取一说并注明「一说」，不掩饰分歧。</p></div>' +
        '<div class="section-item"><h3>原文与推演之分</h3><p>加引号者为原文，可查；未加引号者为依经义之推演。本站不作「伪引」——不把推演之词挂在古人名下。</p></div>' +
        '<div class="section-item"><h3>不作决断</h3><p>命理为象数之学，长于「审势」，短于「定命」。凡疾病、诉讼、投资、婚姻之决断，请咨询专业人士。本站所出，只供参详。</p></div></div>');

      html += '<div class="card">' + U.disclaimer() + '</div>';
      return html;
    }
  });
}(typeof window !== 'undefined' ? window : this));
