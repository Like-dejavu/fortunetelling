/* 玄鉴 · 以今日之语言解之  window.XJModern
   把「所问」「所得」「所据」翻成现代白话：三段，第二人称，不端着。
   第一段译问题，第二段讲证据，第三段给可做的一两步；结论强度随分数走。 */
(function (root) {
  'use strict';

  var MOD_LABEL = {
    liuyao: '六爻', meihua: '梅花', dream: '解梦', cezi: '测字', huangli: '黄历',
    bazi: '四柱', ziwei: '紫微', heluo: '河洛', palm: '手相', face: '面相'
  };

  /* ---------- 取值 ---------- */
  function s(v, d) {
    return (v === null || v === undefined || v === '') ? (d === undefined ? '' : d) : String(v);
  }
  function shortQ(q) {
    q = s(q).replace(/\s+/g, '');
    return q.length > 26 ? q.slice(0, 26) + '…' : q;
  }
  function firstClause(t, n) {
    t = s(t);
    var i = t.indexOf('，');
    if (i > 0 && i <= n) return t.slice(0, i);
    return t.length > n ? t.slice(0, n) : t;
  }
  function topReason(list) {
    if (!list || !list.length) return null;
    var best = list[0], i;
    for (i = 1; i < list.length && i < 6; i++) {
      if (Math.abs(list[i].d || 0) > Math.abs(best.d || 0)) best = list[i];
    }
    return best;
  }
  function levelOf(module, r) {
    r = r || {};
    if (module === 'liuyao' && r.judge && r.judge.level) return r.judge.level;
    if (module === 'cezi' && r.level) {
      var m = { '大吉': 5, '吉': 4, '中平': 3, '不利': 2, '凶': 1 };
      if (m[r.level]) return m[r.level];
    }
    if (module === 'dream') {
      var it = r.items && r.items[0];
      if (it) return it.g === '吉' ? 4 : it.g === '凶' ? 2 : 3;
    }
    if (typeof r.score === 'number') {
      var sc = r.score;
      if (sc >= (module === 'meihua' ? 74 : 72)) return 5;
      if (sc >= 61) return 4;
      if (sc >= 47) return 3;
      if (sc >= 34) return 2;
      return 1;
    }
    return 0;
  }

  /* ---------- 第一段：把问题译成术数语言 ---------- */
  var TYPE_WORD = {
    '能不能': '问的是成与不成', '何时': '问的是迟速与应期',
    '如何': '问的是该怎样措手', '吉凶': '问的是吉凶的趋向',
    '何解': '问的是这一个象该作何解'
  };
  var MOD_VIEW = {
    meihua: '在梅花里，体为己、用为所问之事，看的是两者谁生谁克、谁旺谁衰。',
    dream: '在解梦里，断语只是古人的经验条目，用的时候还得看你自己的处境。',
    cezi: '在测字里，看的是这一个字的笔画、部首与增损之机，不是查字典。',
    huangli: '在黄历里，看的是这一日的建除、宜忌与冲煞，不讲一句空泛的吉凶。',
    bazi: '在四柱里，日干为己，四柱为禀赋与处境的配比，看去的是「借什么力、避什么耗」。',
    ziwei: '在紫微里，看的是命盘十二宫的格局与四化所向，说的是「你在什么位置上做事顺手」。',
    heluo: '在河洛里，以干支化数、天数地数成卦，看的是数与卦的虚实配不配。',
    palm: '在手相里，看的是手形、三才纹与掌丘之气，相的是这一段的气象。',
    face: '在面相里，看的是三停五官与气色，相的是一个人长期的神色与体态。'
  };
  var MOD_TAIL = {
    liuyao: '先取用神，再看月建日辰与动变先后。',
    meihua: '先定体用，再看互卦与变卦。',
    dream: '先认梦象落在哪一类，再看古人留下的断语。',
    cezi: '先看形与数，再看它与你所问之事的照应。',
    huangli: '先看这一日宜什么，再看你的事合不合。',
    bazi: '先看日主强弱，再取用神，再谈运与年。',
    ziwei: '先定命身，再看三方四正与四化。',
    heluo: '先化数，再看天地二数与先天后天之卦。',
    palm: '先定手形，再看三才纹的形与势。',
    face: '先看三停匀不匀，再逐官看气。'
  };
  var GENERAL_LANG = '所问未落入门类，六爻以妻财为泛占之神，看事之通塞与迟速。';

  function modView(module, u) {
    var d = u && u.domain ? u.domain : null;
    if (module === 'liuyao') {
      if (d && d.id === 'omen') return '在六爻里，梦属虚惊，多取官鬼；不过梦象本身，仍以解梦一门为正。';
      if (d && d.id === 'cezi') return '在六爻里，以妻财为泛占；字象本非其所长，此处只作旁参。';
      return (d && d.lang) ? d.lang : GENERAL_LANG;
    }
    if (module === 'dream' && !(d && d.id === 'omen') && !/梦/.test(s(u && u.raw))) {
      return '在解梦里取的是象：象同、象反、谐音三路；此问与梦无涉，只作旁类一参。';
    }
    if (module === 'huangli' && !/哪天|哪一天|几号|哪日|什么日子|吉日|好日子|择日|择吉|挑日子/.test(s(u && u.raw))) {
      return '在黄历里，看的是这一日的建除、宜忌与冲煞；此问不涉择日，只备一体。';
    }
    return MOD_VIEW[module] || '';
  }

  function para1(module, r, u) {
    var q = shortQ(u && u.raw);
    var dn = (u && u.domain && u.domain.name) ? u.domain.name : '此事';
    var tw = TYPE_WORD[u && u.askType] || '问的是吉凶的趋向';
    var t = ('你问的是' + (q ? '「' + q + '」' : '泛泛一占') + '，' + tw + '，' + (q ? dn : '所问') + '之事。');
    t += modView(module, u);
    t += '落到' + (MOD_LABEL[module] || '术数') + '上，' + (MOD_TAIL[module] || '先看象，再看事。');
    return t;
  }

  /* ---------- 第二段：讲证据 ---------- */
  var FALLBACK_P2 = '这一候未能留下可核的细节，只知象未成形，话不宜说死。凡涉钱、契约与身体，仍以你手上的凭据与医嘱为准。';

  function liuyaoP2(r) {
    if (!r || !r.ben || !r.judge) return FALLBACK_P2;
    var ben = r.ben, j = r.judge;
    var t = '此卦「' + s(ben.name, '—') + '」';
    if (ben.palace) t += '，属' + ben.palace + '宫' + s(ben.gongWx);
    t += '。';
    var y = (j.use && j.use.yao) ? j.use.yao : null;
    if (y) {
      t += '用神' + s(r.useType) + '取' + s(y.gz) + (j.use.idx >= 0 ? '（第' + (j.use.idx + 1) + '爻）' : '') +
        '，' + s(y.liuqin) + '临之，';
      if (y.moving) t += '此爻发动' + (y.bianQin ? '化' + y.bianQin : '') + (y.huitou ? '，' + y.huitou : '') + '；';
      else t += '此爻安静，须待月日引动；';
      if (y.yuePo) t += '又逢月破，事体已损；';
      if (y.kong) t += '且落旬空，眼前多是虚声；';
    } else if (r.fuShen) {
      t += '用神' + s(r.useType) + '不上卦，伏于' + s(r.fuShen.fei.gz) + '之下，事体隐而未显，须待引出；';
    } else {
      t += '用神不上卦，卦中无可用之爻；';
    }
    t += '断曰「' + s(j.verdict, '—') + '」，' + j.score + ' 分。';
    var ev = topReason(j.reasons);
    if (ev) t += '要紧的一条是：' + firstClause(ev.text, 40) + '。';
    return t;
  }

  function meihuaP2(r) {
    if (!r || !r.ben || !r.ti) return FALLBACK_P2;
    var t = '本卦「' + s(r.ben.name) + '」，互卦「' + s(r.hu && r.hu.name) + '」主中段，变卦「' +
      s(r.bian && r.bian.name) + '」主终局。';
    t += '体卦' + s(r.ti.tri) + '属' + s(r.ti.wx) + '，用卦' + s(r.yong.tri) + '属' + s(r.yong.wx) +
      '，成「' + s(r.rel) + '」之局；';
    t += s(r.season) + '令里，体卦' + s(r.ti.qi && r.ti.qi.qi, '—') + '、用卦' + s(r.yong.qi && r.yong.qi.qi, '—') + '。';
    t += '断曰「' + s(r.verdict, '—') + '」，' + s(r.score, '—') + ' 分。';
    var ev = topReason(r.reasons);
    if (ev) t += '要紧的一条是：' + firstClause(ev.text, 38) + '。';
    return t;
  }

  function dreamP2(r, u) {
    var it = r && r.items && r.items[0];
    if (!it) {
      return '梦象库里未检得直接对应的条目。梦多因日间所思而起，先看最近哪件事让你悬着，比查一条断语要紧。';
    }
    var kw = s(it.k && it.k[0], '梦象');
    var isDream = (u && u.domain && u.domain.id === 'omen') || /梦/.test(s(u && u.raw));
    var t = isDream ? '你梦见的「' + kw + '」' : '旁参的梦象库里，「' + kw + '」一条';
    t += '，古法断为「' + s(it.g) + '」';
    if (r.cats && r.cats[0]) t += '，属' + r.cats[0] + '一类';
    var tt = s(it.t);
    if (tt.length > 46) tt = tt.slice(0, 44) + '…';
    tt = tt.replace(/[。；;，,\s]+$/, '');
    t += '。其解是：' + tt + '。';
    t += isDream
      ? '这一条出自《周公解梦》' + s(it.src, '通行') + '一路，取的是象义上的照应，不是直断祸福。'
      : '所问既与梦无关，这一条只作旁类看，不足据以断此事之成败。';
    return t;
  }

  function ceziP2(r) {
    if (!r || !r.info) return FALLBACK_P2;
    var t = '所拈之字「' + s(r.char) + '」，' + r.info.strokes + '画，属' + s(r.shu && r.shu.wx) +
      '，' + s(r.info.radical) + '部';
    if (r.info.extra) t += '，部外' + r.info.extra + '画';
    t += '。';
    if (r.shi) {
      t += '月建' + s(r.shi.monthZhi) + '、日辰' + s(r.shi.dayGan) + '，字与月建' + s(r.shi.mRel) +
        '、与日辰' + s(r.shi.dRel) + '；';
    }
    t += '断曰「' + s(r.level, '—') + '」，' + s(r.score, '—') + ' 分。';
    /* 测字的加减分条目是算式口吻，不直引，只取其得失之数 */
    var rs = r.reasons, i, sumNeg = 0, sumPos = 0;
    if (rs && rs.length) {
      for (i = 0; i < rs.length; i++) {
        var d = rs[i].d || 0;
        if (d < 0) sumNeg += d;
        else sumPos += d;
      }
      if (sumNeg || sumPos) {
        t += '计其加减：被克去 ' + (-sumNeg) + ' 分，得生扶 ' + sumPos + ' 分，' +
          (typeof r.score === 'number' && r.score >= 50 ? '尚在中和之数以上。' : '故不及中和之数。');
      }
    }
    return t;
  }

  function huangliP2(r) {
    if (!r || !r.jc) return FALLBACK_P2;
    var jc = r.jc;
    var t = '这一日' + s(r.dayGz, '') + '，值建除「' + s(jc.name) + '」，' +
      (jc.isHuangDao ? '为黄道日' : '为黑道日') + '。';
    t += '宜' + s(jc.yiji && jc.yiji.yi, '—') + '；忌' + s(jc.yiji && jc.yiji.ji, '—') + '。';
    if (r.cs && r.cs.chongZhi) t += '冲' + r.cs.chongZhi + '、煞' + s(r.cs.sha) + '，此方此肖宜避。';
    t += '这些是常例，不是对你这件事的判决。';
    return t;
  }

  function baziP2(r) {
    if (!r || !r.yongshen) return FALLBACK_P2;
    var y = r.yongshen, g = r.geju || {}, d = r.dayun || {};
    var t = '日主' + s(y.me) + '，' + s(g.name, '格局未定') + '，同党（比劫印星）约' +
      (r.power && typeof r.power.same === 'number' ? r.power.same.toFixed(1) : (r.power && r.power.pct && typeof r.power.pct[y.me] === 'number' ? r.power.pct[y.me].toFixed(1) : '—')) + '%，' + s(y.level) + '。';
    if (y.primary && y.primary.wx) {
      t += '取' + s(y.primary.wx) + '为用神（' + firstClause(y.primary.why, 26) + '）';
      if (y.secondary && y.secondary.wx) t += '，' + s(y.secondary.wx) + '为喜神';
      t += '；';
      if (y.avoid && y.avoid.length) t += '忌' + y.avoid.join('、') + '。';
    }
    if (d.list && d.list.length) {
      var cur = d.list[0], i;
      for (i = 1; i < d.list.length; i++) if (d.list[i].startAge <= 38) cur = d.list[i];
      t += '眼下行' + s(cur.gan) + s(cur.zhi) + '运（' + cur.startAge + '–' + cur.endAge + ' 岁，' + s(cur.shishen) + '）。';
    }
    return t;
  }

  function ziweiP2(r) {
    if (!r || !r.mingGong) return FALLBACK_P2;
    var mg = r.mingGong;
    var stars = (mg.stars || []).map(function (x) { return x.name; });
    var t = '命宫在' + s(mg.gan) + s(mg.zhi) + '，' + s(r.juName) + '，' +
      (stars.length ? '坐' + stars.join('、') : '无主星，须借对宫');
    t += '；身宫在' + s(r.shenGong && r.shenGong.gong) + '。';
    if (r.sihua && r.sihua.list) {
      t += '四化：' + s(r.sihua.list[0]) + '化禄、' + s(r.sihua.list[1]) + '化权、' +
        s(r.sihua.list[2]) + '化科、' + s(r.sihua.list[3]) + '化忌。';
    }
    if (r.dayun && r.dayun.length) {
      var d0 = r.dayun[0];
      t += '第一步大限 ' + d0.from + '–' + d0.to + ' 岁在' + s(d0.zhi) + '宫。';
    }
    return t;
  }

  function heluoP2(r) {
    if (!r || r.heavenly === undefined) return FALLBACK_P2;
    var t = '干支化数得天数' + s(r.heavenly) + '、地数' + s(r.earthly) + '（二十五、三十为中和）。';
    if (r.hRem !== undefined) t += '天数除二十五余' + s(r.hRem) + '，地数除三十余' + s(r.eRem) + '，遇十不用取' + s(r.hDigit) + '与' + s(r.eDigit) + '。';
    t += '成先天卦' + s(r.tianGua && r.tianGua.name) + '上' + s(r.diGua && r.diGua.name) + '下，' +
      '为「' + s(r.xiantian && r.xiantian.full, '—') + '」。';
    t += '判曰' + s(r.verdict, '—') + '。';
    return t;
  }

  function xiangP2(r, module) {
    if (!r || !r.sections || !r.sections.length) return FALLBACK_P2;
    var t = (module === 'palm' ? '手相' : '面相') + '所取诸象，合为' + s(r.score) + ' 分。';
    t += '最吃重的一条是「' + firstClause(String(r.sections[0].title || '').replace(/<[^>]+>/g, ''), 18) + '」：' +
      firstClause(String(r.sections[0].body || '').replace(/<[^>]+>/g, ''), 60);
    return t;
  }

  function para2(module, r, u) {
    if (module === 'liuyao') return liuyaoP2(r);
    if (module === 'meihua') return meihuaP2(r);
    if (module === 'dream') return dreamP2(r, u);
    if (module === 'cezi') return ceziP2(r);
    if (module === 'huangli') return huangliP2(r);
    if (module === 'bazi') return baziP2(r);
    if (module === 'ziwei') return ziweiP2(r);
    if (module === 'heluo') return heluoP2(r);
    if (module === 'palm' || module === 'face') return xiangP2(r, module);
    return FALLBACK_P2;
  }

  /* ---------- 第三段：可做的一两步 ---------- */
  var ACT = {
    career: { go: '把职责与业绩理成能说清的条目，找个机会与上级对齐', hold: '在同事之间议论人事' },
    wealth: { go: '先算清账目与回款的日子', hold: '在没看清条款前投钱' },
    love: { go: '把话说到明处，说清你的底线与打算', hold: '用试探代替表态' },
    exam: { go: '按部就班补最短的那块板', hold: '押题、赌重点' },
    health: { go: '按医嘱复查，把作息先调回来', hold: '自行加减药、硬扛' },
    travel: { go: '把证件、票期与备用路线核一遍', hold: '赶夜路、临时改线' },
    lawsuit: { go: '把证据与时间线整理成册', hold: '在情绪上与人争长短' },
    lost: { go: '按最后见到它的时与地回头细找，并留个记录', hold: '急着下结论说没了' },
    child: { go: '把身体与作息顾好，按医嘱来', hold: '听偏方、乱进补' },
    home: { go: '先量尺寸、比价，把合同逐条看细', hold: '没验房就付大额定金' },
    coop: { go: '把分工、分钱与退出条款写下来', hold: '只凭交情作口头约定' },
    date: { go: '先定事、再挑日，避开冲煞与破日', hold: '为一个日子反复改期' },
    omen: { go: '把这梦当个提醒，看看最近哪件事让你悬着', hold: '照着梦象做具体决定' },
    cezi: { go: '把要决定的事写下来，逐条看利弊', hold: '拿一个字替自己做决定' },
    general: { go: '先做能立刻做的那一小步', hold: '在信息不足时做大决定' }
  };
  var PRE = {
    career: '手上的活与要交的报告', wealth: '现金流与合同条款', love: '彼此的实际安排与底线',
    exam: '复习计划与作息', health: '检查结果与作息', travel: '行程与证件', lawsuit: '书面材料与期限',
    lost: '最后一次见它的时间地点', child: '检查结果与作息', home: '预算与合同', coop: '权责与账目',
    date: '待办清单与参与人', omen: '最近的压力来源', cezi: '你真正担心的那一件事', general: '手上的事实'
  };

  function para3(module, lv, u) {
    var id = (u && u.domain && u.domain.id) ? u.domain.id : 'general';
    var A = ACT[id] || ACT.general;
    var pre = PRE[id] || PRE.general;
    var t;
    if (lv >= 5) {
      t = '此事眼下有可乘之势。宜' + A.go + '；不宜' + A.hold + '。势虽顺，也留一分余地，别把话说满。';
    } else if (lv === 4) {
      t = '大体可为。宜' + A.go + '，等有了回音再进一步；不宜' + A.hold + '，也不宜一次把牌摊尽。';
    } else if (lv === 3) {
      t = '可否之间，成而带波折。宜' + A.go + '而不宜急；先把' + pre + '理清，过些时候再定，胜于此刻硬决。';
    } else if (lv === 2) {
      t = '象不助事。宜缓、宜守，先把' + pre + '补齐；不宜在此刻强推，推则费力而少功，退一步反而看得清。';
    } else if (lv === 1) {
      t = '象不助事，阻力又在明处。宜止、宜改，或换个方向另图；不宜硬撑，也不宜把成败押在别人回心转意上。';
    } else {
      t = '这一候没有可核的分数，只能就大体说：宜先求实、后求快；凡涉钱与契约，多留一步，别把话说成保证。';
    }
    return t;
  }

  /* ---------- 字数收束：每段 60–140 字 ---------- */
  var PAD = {
    p1: ['所问若不止一事，宜拆开一件一件看。', '问题问得越具体，象与事的对位就越清楚。'],
    p2: ['象只是势，势不等于定局。', '同一个卦，落在不同的处境里，轻重也不同。'],
    p3: ['你若只取一句话，就取「先做能做的，再等该等的」。', '决定仍在你手里，这里只给一个看事的次序。']
  };

  function fit(text, pads) {
    text = String(text || '').replace(/\s+/g, '');
    var i;
    if (text.length > 140) {
      var cut = text.slice(0, 140);
      var p = Math.max(cut.lastIndexOf('。'), cut.lastIndexOf('；'));
      if (p > 70) text = cut.slice(0, p + 1);
      else text = text.slice(0, 139) + '。';
    }
    for (i = 0; i < pads.length && text.length < 60; i++) text += pads[i];
    if (text.length < 60) text += '以上所据，前面已逐条列出，可自行复核，不必尽信一家之言。';
    if (text.length > 140) {
      var c2 = text.slice(0, 140);
      var p2 = Math.max(c2.lastIndexOf('。'), c2.lastIndexOf('；'));
      text = p2 > 70 ? c2.slice(0, p2 + 1) : text.slice(0, 139) + '。';
    }
    return text;
  }

  var CAVEAT = {
    liuyao: '六爻所断，取的是起卦这一瞬的象，象随时而变；此处只供决疑，不作契约、医疗与投资的凭据。',
    meihua: '梅花以体用断事，重在一时之机，不是命定的结论；象只是提醒你哪一头轻、哪一头重。',
    dream: '梦本心神浮游，梦象与人事只有象义上的关联，没有因果；古法条例可作自省，不可据以断祸福。',
    cezi: '字象无定解，测字本是文人游戏一路，取的是联想之趣；真要做决定，仍看事实与条款。',
    huangli: '黄历宜忌是古人按建除、神煞排出的常例，讲的是这一日宜于做什么，不是对你这件事的判决。',
    bazi: '四柱所推，是禀赋与运程的配比，不是命运的判决；同一副八字，落在不同的人身上，成色也不同。',
    ziwei: '紫微十四主星的亮度古表歧异，本站未用亮度断吉凶，只以五行生克判得地，属推演一路。',
    heluo: '河洛理数所本之书多有异文，取数之法各家不一；此处依原文规则列出全部过程，可自行复核。',
    palm: '手相变化甚缓，纹理亦随年岁与劳作而改；相书之说不作医学判断，更不能定人一生成败。',
    face: '面相所相为神色与体态，气色随时而变；本篇不作医学判断，也不以相貌论人贵贱。',
    general: '术数所出，皆依经据典之推演，取其象以自助省；凡涉生死、疾病与钱财，请以医嘱、法律与自己的判断为准。'
  };

  /* 若正文已含小标题（如「你问的是」），去掉重复，避免「你问的是　你问的是…」 */
  function dedupe(lead, text) {
    var s = String(text || '');
    if (lead && s.indexOf(lead) === 0) s = s.slice(lead.length).replace(/^[，、：；　\s]+/, '');
    return s;
  }

  function explain(module, result, understood) {
    var u = understood || {};
    var r = result || {};
    var lv = levelOf(module, r);
    return {
      paras: [
        { lead: '你问的是', text: dedupe('你问的是', fit(para1(module, r, u), PAD.p1)) },
        { lead: '术数上看', text: dedupe('术数上看', fit(para2(module, r, u), PAD.p2)) },
        { lead: '放到今日说', text: dedupe('放到今日说', fit(para3(module, lv, u), PAD.p3)) }
      ],
      caveat: CAVEAT[module] || CAVEAT.general
    };
  }

  /* ---------- 直接生成一段 HTML，供各页嵌入 ---------- */
  function esc(x) {
    return String(x === null || x === undefined ? '' : x)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function box(module, result, understood) {
    var e = explain(module, result, understood);
    var h = '<div class="modern-box">' +
      '<div class="modern-head">以今日之语言解之' +
      '<span class="modern-tips">先把你问的译成术数的问法，再讲象，最后给可做的一两步</span></div>';
    for (var i = 0; i < e.paras.length; i++) {
      h += '<p><b>' + esc(e.paras[i].lead) + '</b>　' + esc(e.paras[i].text) + '</p>';
    }
    h += '<p class="small muted">' + esc(e.caveat) + '</p></div>';
    return h;
  }

  var API = {
    explain: explain,
    levelOf: levelOf,
    box: box,
    ACT: ACT
  };
  root.XJModern = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
}(typeof window !== 'undefined' ? window : this));
