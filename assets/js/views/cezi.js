/* ============================================================
   玄鉴 · 测字  window 路由 #/cezi
   依《测字秘牒》（清·程省）十法与《神机相字法》提要
   ============================================================ */
(function (root) {
  'use strict';
  var U = root.XJUI, App = root.XJApp;
  if (!U || !App) return;

  /* ---------------- 米字格 ---------------- */
  function ziGrid(ch) {
    return '<div class="zi-stage"><svg class="zi-grid" viewBox="0 0 200 200" role="img" aria-label="米字格">' +
      '<rect x="0.5" y="0.5" width="199" height="199" rx="2" class="zg-frame"/>' +
      '<line x1="100" y1="0" x2="100" y2="200" class="zg-line"/>' +
      '<line x1="0" y1="100" x2="200" y2="100" class="zg-line"/>' +
      '<line x1="0" y1="0" x2="200" y2="200" class="zg-line zg-dash"/>' +
      '<line x1="200" y1="0" x2="0" y2="200" class="zg-line zg-dash"/>' +
      '<text x="100" y="102" class="zg-char" text-anchor="middle">' + U.esc(ch) + '</text>' +
      '</svg></div>';
  }

  /* ---------------- 时间 ---------------- */
  function nowVal() {
    var d = new Date();
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function parseWhen(v) {
    if (!v) return new Date();
    var m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(v);
    if (!m) return new Date();
    return new Date(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 12, m[5] ? +m[5] : 0);
  }

  /* ---------------- 十法卡 ---------------- */
  function faCards(r) {
    var html = '<div class="fa-grid">';
    r.fa.forEach(function (f) {
      html += '<div class="fa-item' + (f.applied ? ' on' : '') + '">' +
        '<div class="fa-head"><b>' + f.name + '</b>' +
        (f.applied ? '<span class="badge on">已施</span>' : '<span class="badge">未施</span>') + '</div>' +
        '<p class="fa-gloss small muted">' + f.gloss + '</p>' +
        (f.applied ? '<p class="fa-find">' + f.finding + '</p>' : '') +
        (f.quote ? '<details class="fa-quote"><summary>本法原文</summary><div class="quote">' + f.quote +
          '<span class="src">《测字秘牒》</span></div></details>' : '') +
        '</div>';
    });
    return html + '</div>';
  }

  /* ---------------- 现代解释（无 XJModern 时的兜底） ---------------- */
  var MODERN = {
    career: {
      up: '职场上的「字」若与月建相生，等于你的时机与人脉同向。可主动争取，但把承诺写成条款。',
      mid: '此事不是不能，而是条件未齐。宜先补一处短板（一项证书、一位背书人），再动。',
      down: '当下阻力大于助力。与其硬推，不如换跑道、换话术、换汇报对象；三个月内不宜提加薪或跳槽的硬条件。'
    },
    wealth: {
      up: '此字见财气，周转尚可；但「利」从「禾」从「刂」，古人取象为有收有割，进项之外必有一笔支出。',
      mid: '可守不可攻。现金留出三成不动，别把短期周转当长期资金用。',
      down: '字象有耗。近期不宜借贷担保、不宜追高，合同里把违约责任与退出条款写清。'
    },
    love: {
      up: '两字相形则情相向。此时宜坦率，不宜试探；把话说破，比猜三个月有用。',
      mid: '情在兩可。对方不是不动，而是有所顾。先问清一件事：他到底怕什么。',
      down: '字形有离象。纠缠比分开更耗人；若已反复三次，就按已经结束来安排生活。'
    },
    study: {
      up: '文书之象清朗。按计划走即可，别临时换资料；考前一周只做旧题。',
      mid: '火候未到。把薄弱的章补上，比刷新的题有效。',
      down: '此时心神易散。减一半目标，保一科是实；环境上先隔断手机。'
    },
    health: {
      up: '气色之象平和。维持作息即可，别为进补而进补。',
      mid: '小恙宜早看，别拖成慢性的。此条只作提醒，不作诊断。',
      down: '字见滞象。宜查不宜猜，具体请就医；本条不作诊断依据。'
    },
    travel: {
      up: '行象通利。可动，但证件、票务留一手备份。',
      mid: '可行而多阻，留出半日余量，别把行程排满。',
      down: '此象不宜远行，或改期，或缩短。'
    },
    lawsuit: {
      up: '理在己方，然讼终非吉。能调则调。',
      mid: '胜负参半，取证为上。',
      down: '此象不宜硬碰，先求和解，把时间换成条件。'
    },
    lost: {
      up: '物在近处，问一问常走动的角落与借过东西的人。',
      mid: '去而复返者半，宜从「最后一次见到」处倒推。',
      down: '失者难复。及时止损，别再投入寻找成本。'
    },
    child: {
      up: '孕育之象和顺。顺其自然，勿求速。',
      mid: '宜调养，不宜急。',
      down: '此象示弱，宜先养身，缓图。'
    },
    house: {
      up: '宅象安稳。可动，但先看采光与通风。',
      mid: '可议不可定，多跑两趟。',
      down: '此时不宜仓促落定，尤其别为「便宜」多付定金。'
    },
    people: {
      up: '此人可用，托事可成。',
      mid: '此人有心无力，托一半、留一半。',
      down: '此象不实，涉及钱财承诺，务必落到纸面。'
    },
    timing: {
      up: '应在近期，一旬之内可验。',
      mid: '应在月内，须有人推一把。',
      down: '宜缓，待时而动；此象不宜急。'
    }
  };

  function modernOf(r) {
    if (root.XJModern && typeof root.XJModern.explain === 'function') {
      try {
        var u = null;
        if (root.XJAsk && typeof root.XJAsk.understand === 'function') u = root.XJAsk.understand(r.question || '问一字');
        var e = root.XJModern.explain('cezi', r, u || {});
        if (e && e.paras && e.paras.length) {
          return {
            heading: '以今日之语言解之',
            paras: e.paras.map(function (p) { return '<b>' + U.esc(p.lead) + '</b>　' + U.esc(p.text); }),
            tips: [],
            source: e.caveat || '本站据断语作现代白话转写'
          };
        }
      } catch (err) { /* 回落 */ }
    }
    var band = r.score >= 60 ? 'up' : (r.score >= 40 ? 'mid' : 'down');
    var pack = MODERN[r.domain.id] || MODERN.timing;
    var paras = [];
    paras.push('就你问的「' + U.esc(r.question) + '」而言，此字落在<b>' + r.level + '</b>（' + r.score + ' 分）一档，' +
      '所主者「' + r.domain.name + '」。');
    paras.push(pack[band]);
    if (r.reasons.length) {
      var hard = r.reasons[0];
      paras.push('最吃重的一条古法是「' + U.esc(hard.text.replace(/[，。].*$/, '')) + '」。换成今天的话说：' +
        (hard.d > 0 ? '外部条件在帮你，你缺的是自己点头。' : '外部条件在拖你，你要做的是缩小赌注、把可控的部分先做掉。'));
    }
    if (r.fa && r.fa.length) {
      var applied = r.fa.filter(function (f) { return f.applied; }).map(function (f) { return f.name; });
      if (applied.length) {
        paras.push('古人对此字所施之法为「' + applied.join('、') + '」——即先拆字形、再看增损、后参时令。' +
          '这套程序的意义不在神秘，而在<b>逼你换三个角度看同一件事</b>：拆开看结构，增损看变量，时令看时机。');
      }
    }
    var tips = [];
    tips.push('此字与今日时令的相应属意象之谈，可作思路参考，不可代替事实核验。');
    tips.push('凡涉钱财、医疗、诉讼的决定，请以合同、检查报告与律师意见为准。');
    return { heading: '顺着这一字往下说', paras: paras, tips: tips, source: '本站据断语作现代白话转写，非古籍原文' };
  }

  /* ---------------- 渲染 ---------------- */
  function render(arg) {
    var html = '';
    html += '<div class="page-head"><h1>测字 · 字里藏机</h1>' +
      '<p class="muted">心有所问，随手写一字。依《测字秘牒》十法拆其形、数其画、参其时，再以所问之事合观。' +
      '一字之来，先详五行生克，次观增损离合——<b>凡推演处皆列算式与依据</b>。</p></div>';

    var defCh = arg && arg.length === 1 ? arg : '';
    var defQ = '';
    if (arg && arg.length > 1) {
      defCh = arg.charAt(0);
      defQ = '';
    }

    html += U.card('起字', '<form id="cz-form">' +
      '<div class="form-grid">' +
      U.field('所测之字', '<input type="text" name="char" maxlength="2" placeholder="写一个字，如 明" value="' + U.esc(defCh) + '" required>', '一字为宜；须为本站形数表所收之字（约 9,159 字，含常用繁体）') +
      U.field('所占之时', '<input type="datetime-local" name="when" value="' + nowVal() + '">', '测字以时为机，取当下为准') +
      '</div>' +
      '<div class="btn-row"><button class="btn" type="submit">起　字</button>' +
      '<button class="btn btn-ghost" type="button" id="cz-random">随手取一字</button></div>' +
      '</form>', '形 · 数 · 时');

    html += '<div id="cz-out"></div>';

    html += U.card('十法', '<p class="muted small">《测字秘牒》卷一「测字十法」，本站逐条录入原法大意，并以字形、增损、离合诸端试施于所测之字。' +
      '<b>凡标「未施」者，谓此字无从施此法，非略而不论。</b></p>' +
      '<p class="small muted">十法者：装头、接脚、穿心、包笼、破解、添笔、减笔、对关、摘字、观梅。' +
      '其要在「字有变化，事有转移」——同一字，因所问、因所书之人、因占时不同，而其象亦不同。</p>', '测字秘牒·卷一');

    html += U.card('所据之书', bookHtml(), '版本与限度');

    return html;
  }

  function bookHtml() {
    var T = root.XJCeziText;
    var html = '';
    if (T && T.books) {
      html += '<table><thead><tr><th>书</th><th>作者</th><th>版本</th></tr></thead><tbody>';
      T.books.forEach(function (b) {
        html += '<tr><td><b>' + b.title + '</b></td><td>' + b.author + '（' + b.dynasty + '）</td>' +
          '<td class="small">' + b.note + '</td></tr>';
      });
      html += '</tbody></table>';
    }
    html += '<div class="notice"><b>诚实的限度：</b>' +
      '《测字秘牒》所载十法，多有「随手增损、非概然可套」之语——本即不可机械套用。本站所作，是把它可程式化的部分' +
      '（笔画、部首、字形增损、对关、字义、时令生克）如实算出，其余（所书之人的神情、字迹的工拙、旁物之触机）' +
      '无法代劳，须君自参。' +
      '《神机相字法》原书已佚，今仅存《四库全书总目》提要，本站不作原文引述。' +
      '另：一字多音、繁简异体，形数随版本略有出入，本站取 Unicode Unihan 所载康熙笔画。</div>';
    html += U.disclaimer();
    return html;
  }

  /* ---------------- 起字与输出 ---------------- */
  function run(form) {
    var out = document.getElementById('cz-out');
    if (!out) return;
    var ch = (U.formVal(form, 'char') || '').trim();
    var q = (U.formVal(form, 'q') || '').trim();
    var when = parseWhen(U.formVal(form, 'when'));

    if (!ch) { out.innerHTML = U.card('', U.err('请先写一个字。')); return; }
    if (ch.length > 1) { out.innerHTML = U.card('', U.err('一次只测一字。古人云「一字一机」，多字则象杂。')); return; }

    var r;
    try {
      r = root.XJCezi.analyze({ char: ch, question: q, date: when });
    } catch (e) {
      out.innerHTML = U.card('', U.err('推演出错：' + U.esc(e.message)));
      return;
    }
    if (!r || r.error) {
      out.innerHTML = U.card('此字不在表中', U.err(r && r.error ? r.error : '未知错误') +
        '<p class="small muted">可换一个常用字，或用「随手取一字」。</p>');
      return;
    }

    /* 形数 + 米字格 */
    var kv = '<dl class="kv">' +
      '<dt>笔画</dt><dd>' + r.info.strokes + ' 画</dd>' +
      '<dt>河图数</dt><dd>' + r.shu.n + ' · ' + r.shu.pair + '之数，属' + r.shu.wx + '</dd>' +
      '<dt>阴阳</dt><dd>' + (r.shu.odd ? '奇数属阳' : '偶数属阴') + ' · ' +
      (r.shu.sheng ? '生数（一至五）' : '成数（六至十）') + '</dd>' +
      '<dt>部首</dt><dd>' + r.info.radical + '（第 ' + r.info.radicalNo + ' 部）· 部外 ' + r.info.extra + ' 笔' +
      (r.info.extra === 0 ? ' · 独体' : ' · 合体') + '</dd>' +
      '<dt>所问</dt><dd>' + r.domain.name + '</dd>' +
      '</dl>';
    var head = '<div class="cz-top">' + ziGrid(r.char) +
      '<div class="cz-meta">' + kv +
      '<div class="cz-verdict"><span class="badge ' + (r.score >= 60 ? 'on' : '') + '">' + r.level + '</span>' +
      '<b class="cz-score">' + r.score + '</b><span class="small muted">／100（五十为中和）</span></div>' +
      '</div></div>';
    out.innerHTML = U.card('形数', head, r.shu.pair + '之数 · ' + r.shu.wx);

    /* 断语 */
    var secs = '<div class="cz-q">所问：<b>' + U.esc(r.question) + '</b>　占时：' + U.fmtDate(when) + ' ' +
      (when.getHours() < 10 ? '0' : '') + when.getHours() + ':' + (when.getMinutes() < 10 ? '0' : '') + when.getMinutes() + '</div>';
    secs += U.pillarsTable(r.four);
    secs += U.sections(r.sections);
    out.innerHTML += U.card('断语', secs, '六段 · 各附依据');

    /* 十法 */
    out.innerHTML += U.card('十法所施', faCards(r), '施者 ' + r.fa.filter(function (f) { return f.applied; }).length + ' 法');

    /* 现代解释 */
    var m = modernOf(r);
    var mb = '<div class="modern-box"><div class="modern-head">' + m.heading + '</div>';
    (m.paras || []).forEach(function (p) { mb += '<p>' + p + '</p>'; });
    if (m.tips && m.tips.length) {
      mb += '<ul class="modern-tips">' + m.tips.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>';
    }
    mb += '<div class="basis">' + (m.source || '本站据断语作现代白话转写') + '</div></div>';
    out.innerHTML += U.card('现代解释', mb, '把古法说成人话');

    /* 计分过程 */
    var tb = '<table><thead><tr><th>所据</th><th>加减</th></tr></thead><tbody>' +
      '<tr><td>中和之数（基准）</td><td>50</td></tr>' +
      r.reasons.map(function (x) {
        return '<tr><td>' + x.text + '</td><td>' + (x.d > 0 ? '+' : '') + x.d + '</td></tr>';
      }).join('') +
      '<tr><td><b>合计</b>（夹于 0–100）</td><td><b>' + r.score + '</b></td></tr></tbody></table>';
    out.innerHTML += U.card('计分', tb, '可复核');

    /* 书与限度 */
    out.innerHTML += U.card('所据之书', bookHtml(), '版本与限度');
  }

  function after() {
    var form = document.getElementById('cz-form');
    if (!form) return;
    U.on(form, 'submit', function (e) {
      e.preventDefault();
      run(form);
      var o = document.getElementById('cz-out');
      if (o) o.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    var rd = document.getElementById('cz-random');
    if (rd) U.on(rd, 'click', function () {
      var C = root.XJCezi;
      var pool = C.CAST_POOL;
      var f = document.getElementById('cz-form');
      var ch = pool.charAt(Math.floor(Math.random() * pool.length));
      f.querySelector('[name="char"]').value = ch;
      run(f);
    });
    /* 路由带字则直出 */
    var ch0 = (U.formVal(form, 'char') || '').trim();
    var q0 = (U.formVal(form, 'q') || '').trim();
    if (ch0) run(form);
  }

  App.page('cezi', { render: render, after: after });
}(typeof window !== 'undefined' ? window : this));
