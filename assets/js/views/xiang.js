/* 手相 · 面相 */
(function (root) {
  'use strict';
  var App = root.XJApp, U = root.XJUI;

  function opts(obj) {
    return Object.keys(obj).map(function (k) { return { v: k, t: k }; });
  }

  /* ---------------- 手相 ---------------- */
  var PALM_SVG = '<svg viewBox="0 0 300 380" role="img" aria-label="手相掌图">' +
    '<defs><linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#f6e8d4"/><stop offset="1" stop-color="#eedcc2"/></linearGradient></defs>' +
    /* 指 */
    '<g fill="url(#skin)" stroke="#d8c1a2" stroke-width="1.6">' +
    '<rect x="228" y="52" width="32" height="88" rx="16"/>' +
    '<rect x="190" y="34" width="36" height="106" rx="18"/>' +
    '<rect x="150" y="26" width="36" height="114" rx="18"/>' +
    '<rect x="112" y="44" width="36" height="98" rx="18"/>' +
    /* 掌 */
    '<rect x="104" y="126" width="166" height="196" rx="46"/>' +
    /* 拇指 */
    '<ellipse cx="92" cy="236" rx="26" ry="58" transform="rotate(30 92 236)"/>' +
    /* 腕 */
    '<rect x="140" y="312" width="96" height="52" rx="20"/>' +
    '</g>' +
    /* 三才纹 */
    '<g class="palm-hot" data-k="天纹"><path class="hit" d="M262,176 C232,163 190,170 158,188 C142,197 132,204 125,213"/>' +
    '<path class="ln" d="M262,176 C232,163 190,170 158,188 C142,197 132,204 125,213"/></g>' +
    '<g class="palm-hot" data-k="人纹"><path class="hit" d="M127,214 C164,240 210,244 250,224"/>' +
    '<path class="ln" d="M127,214 C164,240 210,244 250,224"/></g>' +
    '<g class="palm-hot" data-k="地纹"><path class="hit" d="M123,219 C106,255 115,295 140,315 C150,323 160,327 168,329"/>' +
    '<path class="ln" d="M123,219 C106,255 115,295 140,315 C150,323 160,327 168,329"/></g>' +
    /* 掌丘点 */
    '<g fill="none" stroke="#c9ae8c" stroke-width="1" stroke-dasharray="3 3">' +
    '<circle cx="130" cy="150" r="9"/><circle cx="168" cy="140" r="9"/><circle cx="204" cy="146" r="9"/>' +
    '<circle cx="244" cy="158" r="8"/><circle cx="128" cy="262" r="13"/><circle cx="232" cy="272" r="13"/>' +
    '</g>' +
    '</svg>' +
    '<div class="palm-legend"><span class="badge" data-line="天纹">天纹 · 主情</span>' +
    '<span class="badge" data-line="人纹">人纹 · 主智</span><span class="badge" data-line="地纹">地纹 · 主命</span></div>';

  App.page('palm', {
    render: function () {
      var X = root.XJXiang;
      var html = '<div class="page-head"><h1>看手相</h1>' +
        '<p class="lede">相书论掌，先看「形」——金木水火土五形，取其骨肉气血之偏；次看「纹」——天纹主情、人纹主智、地纹主命，是为三才纹；' +
        '再看「色」与「丘」，以验气血之盛衰。<b>点按掌图上的三才纹</b>可对照下文，选择纹象即出断语。</p></div>';

      html += '<div class="grid-2"><div><div class="palm-stage">' + PALM_SVG + '</div></div><div>' +
        '<form id="palm-form" class="card">' +
        '<div class="form-grid one">' +
        U.field('手形（五行）', U.select('shape', opts(X.SHOU_XING), '土')) +
        U.field('天纹（感情线）', U.select('天纹', opts(X.LINE_TRAITS), '长而秀')) +
        U.field('人纹（智慧线）', U.select('人纹', opts(X.LINE_TRAITS), '深而明')) +
        U.field('地纹（生命线）', U.select('地纹', opts(X.LINE_TRAITS), '长而秀')) +
        U.field('掌丘（择最显者）', U.select('qiu', [{ v: '均平', t: '均平（无可择）' }].concat(opts(X.PALM_QIU)), '均平')) +
        U.field('掌色', U.select('se', opts(X.ZHANG_SE), '红润')) +
        '</div><div class="btn-row"><button class="btn" type="submit">出断语</button></div></form>' +
        '</div></div><div id="palm-out"></div>';

      html += U.card('三才纹解', '<table><thead><tr><th>纹</th><th>今名</th><th>所主</th><th>古说</th></tr></thead><tbody>' +
        ['天纹', '人纹', '地纹'].map(function (k) {
          var s = X.SANCAI[k];
          return '<tr><td><b>' + k + '</b></td><td>' + s.alias + '</td><td>' + s.zhu + '</td><td class="small">' + s.desc + '</td></tr>';
        }).join('') + '</tbody></table>' +
        '<p class="small muted" style="margin-top:10px">三才纹之名出《麻衣相法·掌法》：天纹象天、人纹象人、地纹象地。' +
        '今人以感情线、智慧线、生命线名之，所指略同而取义有别——古法重「气」不重「形」，故纹之深浅断续，皆以气血言之。</p>', '《麻衣相法》');

      return html;
    },
    after: function () {
      var X = root.XJXiang, f = document.getElementById('palm-form'), out = document.getElementById('palm-out');
      function run() {
        var r = X.analyzePalm({
          shape: U.formVal(f, 'shape'), 天纹: U.formVal(f, '天纹'), 人纹: U.formVal(f, '人纹'),
          地纹: U.formVal(f, '地纹'), qiu: U.formVal(f, 'qiu'), se: U.formVal(f, 'se')
        });
        out.innerHTML = U.card('断语', U.sections(r.sections), r.shape.name) +
          U.card('怎样读', '<ul class="feature-list"><li>形为体，纹为用：形定禀赋之偏，纹验气脉之通塞，色察当下之盛衰。</li>' +
            '<li>相书云「相由心生，纹随心转」：掌纹非终身不易，劳逸、情志、病痛皆能改之。</li>' +
            '<li>左右手有别：古法以左手为先天、右手为后天（女则反之），本站不别左右，取通义。</li>' +
            '<li>此页所断，为相书通说之推演，不作医疗诊断；身体不适请就医。</li></ul>', '读法') +
          '<div class="card">' + U.notice('<b>所据：</b>五行手形、三才纹之说，出《麻衣相法·掌法》；掌丘、掌色诸条，为历代相书通行之论，页中已分别注明。' +
            '未加引号者不冒充原文。') + U.disclaimer() + '</div>';
      }
      U.on(f, 'submit', function (e) { e.preventDefault(); run(); });
      U.on(f, 'change', run);
      run();

      /* 掌图交互 */
      var stage = document.querySelector('.palm-stage');
      if (stage) {
        Array.prototype.forEach.call(stage.querySelectorAll('.palm-hot'), function (g) {
          U.on(g, 'click', function () {
            var k = g.getAttribute('data-k');
            Array.prototype.forEach.call(stage.querySelectorAll('.palm-hot'), function (o) { o.classList.toggle('on', o === g); });
            var sel = f.querySelector('[name="' + k + '"]');
            if (sel) {
              var n = sel.options ? sel.options.length : 0;
              if (n) sel.selectedIndex = (sel.selectedIndex + 1) % n;
              run();
            }
          });
        });
        Array.prototype.forEach.call(document.querySelectorAll('.palm-legend .badge'), function (b) {
          U.on(b, 'click', function () {
            var k = b.getAttribute('data-line');
            var g = stage.querySelector('.palm-hot[data-k="' + k + '"]');
            if (g) g.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          });
        });
      }
    }
  });

  /* ---------------- 面相 ---------------- */
  var FACE_SVG = '<svg viewBox="0 0 260 350" role="img" aria-label="面相三停五官图">' +
    '<defs><linearGradient id="fskin" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#f7ead8"/><stop offset="1" stop-color="#eeddc4"/></linearGradient></defs>' +
    '<path d="M130,26 C86,26 58,62 58,112 C58,150 66,192 78,228 C92,272 108,306 130,306 C152,306 168,272 182,228 C194,192 202,150 202,112 C202,62 174,26 130,26 Z" fill="url(#fskin)" stroke="#d8c1a2" stroke-width="1.8"/>' +
    /* 三停分割 */
    '<g stroke="#b99d7c" stroke-width="1" stroke-dasharray="4 4" fill="none">' +
    '<line x1="62" y1="104" x2="198" y2="104"/><line x1="66" y1="186" x2="194" y2="186"/></g>' +
    '<g fill="#a68f74" font-size="10" font-family="serif">' +
    '<text x="8" y="96">上停</text><text x="8" y="178">中停</text><text x="8" y="268">下停</text></g>' +
    /* 耳 */
    '<g class="palm-hot" data-k="耳"><path class="hit" d="M58,116 C46,120 44,150 52,176 C56,188 62,192 64,190 L64,116 Z"/>' +
    '<path class="hit" d="M202,116 C214,120 216,150 208,176 C204,188 198,192 196,190 L196,116 Z"/>' +
    '<path class="ln" d="M60,124 C52,134 52,164 60,182" fill="none"/>' +
    '<path class="ln" d="M200,124 C208,134 208,164 200,182" fill="none"/></g>' +
    /* 眉 */
    '<g class="palm-hot" data-k="眉"><path class="hit" d="M94,124 C102,112 118,110 128,118 L128,124 C118,118 104,120 96,130 Z"/>' +
    '<path class="hit" d="M166,124 C158,112 142,110 132,118 L132,124 C142,118 156,120 164,130 Z"/>' +
    '<path class="ln" d="M96,126 C104,116 118,114 127,120" fill="none" stroke-width="3.4"/>' +
    '<path class="ln" d="M164,126 C156,116 142,114 133,120" fill="none" stroke-width="3.4"/></g>' +
    /* 眼 */
    '<g class="palm-hot" data-k="眼"><ellipse class="hit" cx="111" cy="140" rx="15" ry="10"/>' +
    '<ellipse class="hit" cx="149" cy="140" rx="15" ry="10"/>' +
    '<ellipse class="ln" cx="111" cy="140" rx="12" ry="6.4" fill="none"/>' +
    '<ellipse class="ln" cx="149" cy="140" rx="12" ry="6.4" fill="none"/>' +
    '<circle cx="111" cy="140" r="2.6" fill="#6b5844"/><circle cx="149" cy="140" r="2.6" fill="#6b5844"/></g>' +
    /* 鼻 */
    '<g class="palm-hot" data-k="鼻"><path class="hit" d="M122,152 L138,152 L142,186 L118,186 Z"/>' +
    '<path class="ln" d="M130,142 L130,182 M124,186 C118,188 116,192 117,194 M136,186 C142,188 144,192 143,194" fill="none"/>' +
    '<path class="ln" d="M124,184 C128,190 132,190 136,184" fill="none"/></g>' +
    /* 口 */
    '<g class="palm-hot" data-k="口"><ellipse class="hit" cx="130" cy="216" rx="24" ry="12"/>' +
    '<path class="ln" d="M108,216 C116,208 144,208 152,216 C144,224 116,224 108,216 Z" fill="none"/></g>' +
    /* 地阁 */
    '<text x="130" y="288" text-anchor="middle" fill="#a68f74" font-size="10" font-family="serif">地阁</text>' +
    '</svg>';

  App.page('face', {
    render: function () {
      var X = root.XJXiang;
      var html = '<div class="page-head"><h1>看面相</h1>' +
        '<p class="lede">《冰鉴》云：「一身精神，具乎两目；一身骨相，具乎面部。」故相面先神骨、次气色，而后五官三停。' +
        '三停者，上停主早年、中停主中年、下停主晚年；五官者，眉为保寿、眼为监察、鼻为审辨、口为出纳、耳为采听。</p></div>';

      html += '<div class="grid-2"><div><div class="palm-stage face-stage">' + FACE_SVG + '</div>' +
        '<p class="small muted" style="text-align:center">点按眉、眼、鼻、口、耳可切换选项</p></div>' +
        '<form id="face-form" class="card"><div class="form-grid one">' +
        U.field('三停', U.select('santing', opts(X.SANTING), '上停匀')) +
        U.field('眉（保寿官）', U.select('眉', opts(X.WU_GUAN['眉'].opts), '清秀而长')) +
        U.field('眼（监察官）', U.select('眼', opts(X.WU_GUAN['眼'].opts), '黑白分明')) +
        U.field('鼻（审辨官）', U.select('鼻', opts(X.WU_GUAN['鼻'].opts), '准头丰隆')) +
        U.field('口（出纳官）', U.select('口', opts(X.WU_GUAN['口'].opts), '唇厚而方')) +
        U.field('耳（采听官）', U.select('耳', opts(X.WU_GUAN['耳'].opts), '厚大贴脑')) +
        U.field('气色', U.select('qise', opts(X.QI_SE), '明润')) +
        '</div><div class="btn-row"><button class="btn" type="submit">出断语</button></div></form></div>' +
        '<div id="face-out"></div>';

      html += U.card('十二宫', '<table><thead><tr><th>宫</th><th>部位</th><th>所主</th><th>宜</th><th>忌</th></tr></thead><tbody>' +
        Object.keys(X.SHIERGONG).map(function (k) {
          var g = X.SHIERGONG[k];
          return '<tr><td><b>' + k + '</b></td><td class="small">' + g.pos + '</td><td class="small">' + g.zhu + '</td>' +
            '<td class="small">' + g.good + '</td><td class="small">' + g.bad + '</td></tr>';
        }).join('') + '</tbody></table>' +
        '<p class="small muted" style="margin-top:10px">十二宫之说，出《麻衣相法》《神相全编》，以面之部位分主人生诸事。本站不设「吉凶分」以断命，只列部位与宜忌，供自省。</p>', '相书通说');

      return html;
    },
    after: function () {
      var X = root.XJXiang, f = document.getElementById('face-form'), out = document.getElementById('face-out');
      function run() {
        var r = X.analyzeFace({
          santing: U.formVal(f, 'santing'), 眉: U.formVal(f, '眉'), 眼: U.formVal(f, '眼'),
          鼻: U.formVal(f, '鼻'), 口: U.formVal(f, '口'), 耳: U.formVal(f, '耳'), qise: U.formVal(f, 'qise')
        });
        out.innerHTML = U.card('断语', U.sections(r.sections), '三停五官') +
          '<div class="card">' + U.notice('<b>诚实说明：</b>面相之书，条文浩繁而互有出入。本站所引，惟《冰鉴》二句为可查之原文（已加引号），' +
            '余皆标「相书通说」，不冒充某书原句。面相关乎容貌，最易生分别心；古人亦云「相不独论」，须合神、气、声、行而观，' +
            '更不可因一相之「忌」而自弃。') + U.disclaimer() + '</div>' +
          U.card('《冰鉴》论神', U.quote('「一身精神，具乎两目；一身骨相，具乎面部。」', '曾国藩《冰鉴·神骨》') +
            U.quote('「目者面之渊，不深则不清；鼻者面之山，不高则不灵。」', '《冰鉴·神骨》') +
            '<p class="small muted">《冰鉴》七篇——神骨、刚柔、容貌、情态、须眉、声音、气色——以神气为先，形貌为后。' +
            '世传相书多重部位吉凶，而《冰鉴》独重「神」与「气」，此其所以异也。</p>', '原文');
      }
      U.on(f, 'submit', function (e) { e.preventDefault(); run(); });
      U.on(f, 'change', run);
      run();

      var stage = document.querySelector('.face-stage');
      if (stage) {
        Array.prototype.forEach.call(stage.querySelectorAll('.palm-hot'), function (g) {
          U.on(g, 'click', function () {
            var k = g.getAttribute('data-k');
            Array.prototype.forEach.call(stage.querySelectorAll('.palm-hot'), function (o) { o.classList.toggle('on', o === g); });
            var sel = f.querySelector('[name="' + k + '"]');
            if (sel) {
              sel.selectedIndex = (sel.selectedIndex + 1) % sel.options.length;
              run();
            }
          });
        });
      }
    }
  });
}(typeof window !== 'undefined' ? window : this));
