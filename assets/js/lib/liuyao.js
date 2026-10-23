/* ============================================================
   六爻 · 纳甲筮法引擎  window.XJLiuyao
   依据：京房纳甲、八宫世应、《增删卜易》《卜筮正宗》断卦法
   ============================================================ */
(function (root) {
  'use strict';
  var C = root.XJCalendar;
  var GAN = C.GAN, ZHI = C.ZHI;
  var wxOfGan = C.wuxingOfGan, wxOfZhi = C.wuxingOfZhi;
  var SHENG = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };   // 我生
  var KE = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };      // 我克

  /* 八卦：自下而上三位，1 阳 0 阴 */
  var TRI = {
    '111': { name: '乾', sym: '☰', wx: '金' },
    '110': { name: '兑', sym: '☱', wx: '金' },
    '101': { name: '离', sym: '☲', wx: '火' },
    '100': { name: '震', sym: '☳', wx: '木' },
    '011': { name: '巽', sym: '☴', wx: '木' },
    '010': { name: '坎', sym: '☵', wx: '水' },
    '001': { name: '艮', sym: '☶', wx: '土' },
    '000': { name: '坤', sym: '☷', wx: '土' }
  };
  var TRI_BY_NAME = {};
  for (var k in TRI) TRI_BY_NAME[TRI[k].name] = TRI[k];

  /* 纳甲：内卦三爻、外卦三爻之干支 */
  var NAJIA = {
    '乾': { inn: ['甲子', '甲寅', '甲辰'], out: ['壬午', '壬申', '壬戌'] },
    '坤': { inn: ['乙未', '乙巳', '乙卯'], out: ['癸丑', '癸亥', '癸酉'] },
    '震': { inn: ['庚子', '庚寅', '庚辰'], out: ['庚午', '庚申', '庚戌'] },
    '巽': { inn: ['辛丑', '辛亥', '辛酉'], out: ['辛未', '辛巳', '辛卯'] },
    '坎': { inn: ['戊寅', '戊辰', '戊午'], out: ['戊申', '戊戌', '戊子'] },
    '离': { inn: ['己卯', '己丑', '己亥'], out: ['己酉', '己未', '己巳'] },
    '艮': { inn: ['丙辰', '丙午', '丙申'], out: ['丙戌', '丙子', '丙寅'] },
    '兑': { inn: ['丁巳', '丁卯', '丁丑'], out: ['丁亥', '丁酉', '丁未'] }
  };

  /* 八宫：宫卦（八纯卦）五行 */
  var PALACE = {
    '乾': '金', '兑': '金', '离': '火', '震': '木',
    '巽': '木', '坎': '水', '艮': '土', '坤': '土'
  };
  var PALACE_ORDER = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];

  /* 六亲 */
  function liuqin(gongWx, wx) {
    if (wx === gongWx) return '兄弟';
    if (SHENG[wx] === gongWx) return '父母';
    if (SHENG[gongWx] === wx) return '子孙';
    if (KE[wx] === gongWx) return '官鬼';
    if (KE[gongWx] === wx) return '妻财';
    return '?';
  }
  var LIUQIN_ALL = ['父母', '兄弟', '子孙', '妻财', '官鬼'];

  /* 六神（按日干起） */
  var LIUSHEN = ['青龙', '朱雀', '勾陈', '腾蛇', '白虎', '玄武'];
  var LIUSHEN_START = { '甲': 0, '乙': 0, '丙': 1, '丁': 1, '戊': 2, '己': 3, '庚': 4, '辛': 4, '壬': 5, '癸': 5 };
  var LIUSHEN_DESC = {
    '青龙': '主喜庆、酒食、婚姻、财帛',
    '朱雀': '主口舌、文书、信息、官讼',
    '勾陈': '主田土、房产、迟滞、牵连',
    '腾蛇': '主虚惊、怪异、纠缠、梦寐',
    '白虎': '主凶伤、病疾、丧服、刚猛',
    '玄武': '主暗昧、盗贼、私情、欺瞒'
  };

  /* 八宫六十四卦生成：返回 { binary: {palace, shi, ying, seqName} } */
  var GUA_MAP = (function () {
    var map = {};
    PALACE_ORDER.forEach(function (pn) {
      var tr = TRI_BY_NAME[pn];
      var bits = null;
      for (var b in TRI) if (TRI[b] === tr) bits = b;
      var pure = bits + bits;
      var seqs = [
        { bin: pure, shi: 6, name: '本宫' },
        { bin: flip(pure, [0]), shi: 1, name: '一世' },
        { bin: flip(pure, [0, 1]), shi: 2, name: '二世' },
        { bin: flip(pure, [0, 1, 2]), shi: 3, name: '三世' },
        { bin: flip(pure, [0, 1, 2, 3]), shi: 4, name: '四世' },
        { bin: flip(pure, [0, 1, 2, 3, 4]), shi: 5, name: '五世' },
        { bin: flip(flip(pure, [0, 1, 2, 3, 4]), [3]), shi: 4, name: '游魂' },
        { bin: flip(flip(flip(pure, [0, 1, 2, 3, 4]), [3]), [0, 1, 2]), shi: 3, name: '归魂' }
      ];
      seqs.forEach(function (s) {
        map[s.bin] = { palace: pn, gongWx: PALACE[pn], shi: s.shi, ying: ((s.shi + 2) % 6) + 1, seq: s.name };
      });
    });
    return map;
  })();

  function flip(bin, idxs) {
    var a = bin.split('');
    idxs.forEach(function (i) { a[i] = a[i] === '1' ? '0' : '1'; });
    return a.join('');
  }

  function trigramOf(bin, up) {
    var s = up ? bin.slice(3) : bin.slice(0, 3);
    return TRI[s];
  }

  /* 卦辞/彖/象 取自 XJHexagrams（若已加载） */
  function hexInfo(bin) {
    var H = root.XJHexagrams;
    if (!H) return null;
    for (var k in H) if (H[k].binary === bin) return H[k];
    return null;
  }

  var PURE_NAMES = { '乾': '乾为天', '兑': '兑为泽', '离': '离为火', '震': '震为雷', '巽': '巽为风', '坎': '坎为水', '艮': '艮为山', '坤': '坤为地' };
  function hexName(bin) {
    var h = hexInfo(bin);
    if (h) return h.full || h.name;
    var lo = trigramOf(bin, false), up = trigramOf(bin, true);
    if (up.name === lo.name) return PURE_NAMES[up.name];
    return up.name + lo.name;
  }
  function hexFull(bin) {
    var h = hexInfo(bin);
    if (h) return h.full || h.name;
    var lo = trigramOf(bin, false), up = trigramOf(bin, true);
    if (up.name === lo.name) return PURE_NAMES[up.name];
    return up.name + '上' + lo.name + '下';
  }

  /* ---- 起卦 ---- */
  function coinOnce() {
    // 三枚铜钱：背为阳。得到 6/7/8/9
    var s = 0;
    for (var i = 0; i < 3; i++) s += (Math.random() < 0.5 ? 2 : 3);
    return s; // 6 老阴 7 少阳 8 少阴 9 老阳
  }
  function cast() {
    var arr = [];
    for (var i = 0; i < 6; i++) arr.push(coinOnce());
    return arr;
  }
  /* 由卦爻值得到 本卦/变卦 二进制。值为 6/8 为阴，7/9 为阳；6/9 为动 */
  function binsOf(vals) {
    var ben = '', bian = '';
    vals.forEach(function (v) {
      var yang = (v === 7 || v === 9);
      ben += yang ? '1' : '0';
      bian += (v === 6 || v === 9) ? (yang ? '0' : '1') : (yang ? '1' : '0');
    });
    return { ben: ben, bian: bian };
  }

  /* ---- 排盘 ---- */
  function analyze(opt) {
    var vals = opt.vals;
    if (!vals || vals.length !== 6) throw new Error('需要六爻');
    var dt = opt.date || new Date();
    var f = C.fourPillars(dt, { ziRule: opt.ziRule });
    var dayGan = f.day.gan, dayZhi = f.day.zhi;
    var monthZhi = f.month.zhi;
    var b = binsOf(vals);
    var ben = buildPan(b.ben, dayGan, monthZhi, dayZhi);
    var bian = buildPan(b.bian, dayGan, monthZhi, dayZhi);
    var kong = f.day.kong; // 旬空二支
    var lsStart = LIUSHEN_START[dayGan] !== undefined ? LIUSHEN_START[dayGan] : 0;
    ben.yao.forEach(function (y, i) {
      y.pos = i + 1;
      y.liushen = LIUSHEN[(lsStart + i) % 6];
      y.liushenDesc = LIUSHEN_DESC[y.liushen];
      y.kong = kong.indexOf(y.zhi) >= 0;
      y.yuePo = ((ZHI.indexOf(y.zhi) - ZHI.indexOf(monthZhi) + 12) % 12) === 6;
      y.riPo = ((ZHI.indexOf(y.zhi) - ZHI.indexOf(dayZhi) + 12) % 12) === 6;
      y.moving = (vals[i] === 6 || vals[i] === 9);
      y.oldYin = vals[i] === 6; y.oldYang = vals[i] === 9;
      y.yang = vals[i] === 7 || vals[i] === 9;
      y.bianTarget = bian.yao[i];
      y.kongText = y.kong ? '空亡' : '';
    });
    /* 变爻对位关系 */
    ben.yao.forEach(function (y, i) {
      if (!y.moving) return;
      var t = bian.yao[i];
      y.bianQin = t.liuqin; y.bianWx = t.wx; y.bianGZ = t.gz;
      y.huitou = (SHENG[t.wx] === y.wx) ? '回头生' : (KE[t.wx] === y.wx) ? '回头克' : (t.wx === y.wx) ? '比和' : '化泄';
    });

    /* 用神选取 */
    var q = detectQuestion(opt.question || '');
    var useType = q.type;
    var useIdx = pickUse(ben, useType, ben.shi);
    var fu = null;
    if (useIdx < 0) {
      /* 用神不上卦 → 取本宫卦同位为伏神 */
      var pureBin = pureBinaryOf(ben.palace);
      var pure = buildPan(pureBin, dayGan, monthZhi, dayZhi);
      for (var i = 0; i < 6; i++) {
        if (pure.yao[i].liuqin === useType) {
          fu = { pos: i + 1, yao: pure.yao[i], fei: ben.yao[i] };
          break;
        }
      }
    }

    var judge = judgePan(ben, bian, useIdx, useType, monthZhi, dayZhi, kong, fu, q);
    return {
      ben: ben, bian: bian, vals: vals, dayun: null,
      four: f, kong: kong, question: opt.question || '', q: q,
      useType: useType, useIdx: useIdx, fuShen: fu, judge: judge,
      hexBen: hexInfo(b.ben), hexBian: hexInfo(b.bian)
    };
  }

  function pureBinaryOf(palace) {
    var bits = null;
    for (var b in TRI) if (TRI[b].name === palace) bits = b;
    return bits + bits;
  }

  function buildPan(bin, dayGan, monthZhi, dayZhi) {
    var lo = trigramOf(bin, false), up = trigramOf(bin, true);
    var g = GUA_MAP[bin] || { palace: '乾', gongWx: '金', shi: 6, ying: 3, seq: '' };
    var njLo = NAJIA[lo.name], njUp = NAJIA[up.name];
    var parts = njLo.inn.concat(njUp.out);
    var yao = parts.map(function (gz, i) {
      var gan = gz.charAt(0), zhi = gz.charAt(1);
      var wx = wxOfZhi(zhi);
      return { gz: gz, gan: gan, zhi: zhi, wx: wx, liuqin: liuqin(g.gongWx, wx) };
    });
    return {
      binary: bin, lower: lo, upper: up, palace: g.palace, gongWx: g.gongWx,
      shi: g.shi, ying: g.ying, seq: g.seq, name: hexName(bin), full: hexFull(bin),
      yao: yao,
      shiGua: (up.name === lo.name)
    };
  }

  /* ---- 问事取用神 ---- */
  var QMAP = [
    { re: /财|钱|生意|买卖|投资|收入|利润|讨债|欠款|分红|股|贷|工资|奖金/, type: '妻财', label: '求财' },
    { re: /官|职|升迁|工作|事业|考试|功名|求职|面试|调动|诉讼|官司|官非|名誉/, type: '官鬼', label: '功名官讼' },
    { re: /病|疾|健康|手术|医药|身体|痊愈|医院/, type: '官鬼', label: '疾病' },
    { re: /婚|嫁|娶|感情|恋|配偶|男友|女友|夫|妻|复合|分手|外遇/, type: '妻财', label: '婚姻感情' },
    { re: /房|宅|家|搬家|装修|租|开店|盖房/, type: '父母', label: '家宅' },
    { re: /出|行|旅|走|远行|搬迁|出国/, type: '父母', label: '出行' },
    { re: /失|丢|遗失|找|寻/, type: '妻财', label: '失物' },
    { re: /文书|合同|签|证|消息|信|考试|学业|子|女|孩/, type: '父母', label: '文书子孙' }
  ];
  function detectQuestion(text) {
    for (var i = 0; i < QMAP.length; i++) {
      if (QMAP[i].re.test(text)) return { type: QMAP[i].type, label: QMAP[i].label, matched: true };
    }
    return { type: '妻财', label: '泛占（以妻财为用）', matched: false };
  }

  function pickUse(pan, type, shi) {
    var cands = [];
    pan.yao.forEach(function (y, i) {
      if (y.liuqin === type) cands.push(i);
    });
    if (!cands.length) return -1;
    if (cands.indexOf(shi - 1) >= 0) return shi - 1;
    return cands[0];
  }

  /* ---- 断卦 ---- */
  var YUE_DESC = { '生': '月建生扶', '克': '月建克制', '同': '月建临之', '平': '月建不助' };

  function judgePan(ben, bian, useIdx, useType, monthZhi, dayZhi, kong, fu, q) {
    var reasons = [];
    var score = 50;
    function add(d, s, ref) { score += s; if (d) reasons.push({ text: d, d: s, ref: ref || '' }); }

    if (useIdx < 0) {
      if (fu) {
        var fy = fu.yao, fei = fu.fei;
        var msg = '用神「' + useType + '」不上卦，伏于' + fu.pos + '爻' + fei.liuqin + '（' + fei.gz + ' ' + fei.wx + '）之下，伏神为' + fy.gz + ' ' + fy.wx + '。';
        var d = -10;
        if (SHENG[fei.wx] === fy.wx) { msg += '飞神生伏神，伏而可出，待引拔之期。'; d += 6; }
        else if (KE[fei.wx] === fy.wx) { msg += '飞神克伏神，伏受压伏，难以透出，主所求之事被人所制。'; d -= 8; }
        else if (fei.wx === fy.wx) { msg += '飞伏比和，伏神尚可自安。'; d += 2; }
        if (wxOfZhi(monthZhi) === fy.wx) { msg += '伏神临月建，旺而有气，出伏可期。'; d += 8; }
        else if (SHENG[wxOfZhi(monthZhi)] === fy.wx) { msg += '伏神得月建之生，有出头之望。'; d += 5; }
        if (KE[wxOfZhi(monthZhi)] === fy.wx) { msg += '伏神被月建所克，虽伏亦弱。'; d -= 6; }
        if (kong.indexOf(fy.zhi) >= 0) { msg += '伏神值旬空，出空之日方见端倪。'; d -= 4; }
        add(msg, d, '《增删卜易·用神伏藏》');
        var s = Math.max(1, Math.min(99, 50 + d));
        return { score: s, verdict: s >= 60 ? '吉 · 伏而后出' : s >= 47 ? '中平 · 伏藏待时' : '不利 · 伏而难出', level: s >= 60 ? 4 : s >= 47 ? 3 : 2, reasons: reasons, use: null, fu: fu };
      }
      add('卦中不见用神，事无所主，宜另择时再占。', -12, '《卜筮正宗》');
      return { score: 38, verdict: '中', level: 2, reasons: reasons, use: null, fu: null };
    }

    var y = ben.yao[useIdx];
    var role = roleOf(y.wx, ben.gongWx);
    var meWx = y.wx;

    /* 月建 */
    if (y.yuePo) {
      add('用神' + y.gz + '（' + useType + '）与月建' + monthZhi + '相冲，为「月破」，事体已破，急切难成。', -18, '《增删卜易·月破》');
    } else if (SHENG[monthZhi && wxOfZhi(monthZhi)] === meWx) {
      add('月建' + monthZhi + '（' + wxOfZhi(monthZhi) + '）生用神，得时令之助。', 12, '《增删卜易·月建》');
    } else if (wxOfZhi(monthZhi) === meWx) {
      add('用神临月建' + monthZhi + '，旺相之极。', 14, '《增删卜易·月建》');
    } else if (KE[wxOfZhi(monthZhi)] === meWx) {
      add('月建' + monthZhi + '（' + wxOfZhi(monthZhi) + '）克用神，失令受制。', -12, '《增删卜易·月建》');
    } else if (SHENG[meWx] === wxOfZhi(monthZhi)) {
      add('月建为用神所生，旺气有泄，然不至于伤。', -3, '');
    }

    /* 日辰 */
    if (y.riPo) {
      add('日辰' + dayZhi + '冲用神，为「日破」，主事散、有变动。', -14, '《增删卜易·日辰》');
    } else if (wxOfZhi(dayZhi) === meWx) {
      add('日辰' + dayZhi + '临用神，得日辰之力。', 10, '《增删卜易·日辰》');
    } else if (SHENG[wxOfZhi(dayZhi)] === meWx) {
      add('日辰生用神，有扶助之功。', 9, '《增删卜易·日辰》');
    } else if (KE[wxOfZhi(dayZhi)] === meWx) {
      add('日辰克用神，受制于当日之气。', -9, '《增删卜易·日辰》');
    }
    if (y.kong) {
      add('用神' + y.zhi + '值旬空，主目前虚而不实、事多落空，须待出空填实之期。', y.moving ? -4 : -9, '《增删卜易·旬空》');
    }

    /* 动爻 */
    if (y.moving) {
      add('用神发动，主动而有为，事在己方可推动。', 6, '《增删卜易·动爻》');
      if (y.huitou === '回头生') add('变爻' + y.bianGZ + '生本爻，为「回头生」，愈动愈旺。', 10, '《增删卜易·变爻》');
      if (y.huitou === '回头克') add('变爻' + y.bianGZ + '克本爻，为「回头克」，动而受伤，事多反复。', -14, '《增删卜易·变爻》');
      if (y.huitou === '化泄') add('变爻化泄本爻之气，力量分散。', -4, '');
      if (y.bianQin && LIUQIN_ALL.indexOf(y.bianQin) >= 0 && y.bianQin !== y.liuqin) {
        add('用神化出' + y.bianQin + '，事有转折之象。', 0, '');
      }
    }

    /* 忌神、原神 */
    var jiWx = null, yuanWx = null;
    for (var w1 in KE) if (KE[w1] === meWx) jiWx = w1;        // 克用神者
    for (var w2 in SHENG) if (SHENG[w2] === meWx) yuanWx = w2; // 生用神者
    var jiYi = [], yuanYi = [];
    ben.yao.forEach(function (o, i) {
      if (i === useIdx) return;
      if (o.wx === jiWx) jiYi.push(o);
      if (o.wx === yuanWx) yuanYi.push(o);
    });
    jiYi.forEach(function (o) {
      if (o.moving) add('忌神' + o.gz + '（' + o.liuqin + '）发动，克用神，为阻力之象。', -8, '《增删卜易·忌神》');
      else if (o.pos === ben.shi) add('忌神持世，己身即为阻力，宜先自省。', -4, '');
    });
    yuanYi.forEach(function (o) {
      if (o.moving) add('原神' + o.gz + '（' + o.liuqin + '）发动，生用神，有助力。', 7, '《增删卜易·原神》');
    });

    /* 世应 */
    if (useIdx === ben.shi - 1) add('用神持世，所求在己，主动权在我。', 8, '《卜筮正宗·世应》');
    else if (useIdx === ben.ying - 1) add('用神临应爻，事在他人，须待人应。', 2, '《卜筮正宗·世应》');
    var shiYao = ben.yao[ben.shi - 1], yingYao = ben.yao[ben.ying - 1];
    if (SHENG[yingYao.wx] === shiYao.wx) add('应爻生世，彼来就我，事易谐。', 5, '《卜筮正宗·世应》');
    if (KE[yingYao.wx] === shiYao.wx) add('应爻克世，彼强我弱，须防受制于人。', -5, '《卜筮正宗·世应》');
    if (KE[shiYao.wx] === yingYao.wx) add('世克应爻，我可制彼，事在掌控。', 4, '《卜筮正宗·世应》');

    /* 卦体：六冲六合 */
    if (isChong(ben)) add('本卦六冲，主散、主速、主变动，久事难成，急事反可成。', -6, '《卜筮正宗·六冲六合》');
    if (isHe(ben)) add('本卦六合，主成、主和、主迟，事缓而可就。', 6, '《卜筮正宗·六冲六合》');
    if (y.moving && isChong(bian)) add('变卦六冲，成而复散，防先合后离。', -6, '');
    if (y.moving && isHe(bian)) add('变卦六合，散而复聚，事终可成。', 5, '');

    /* 用神多现 */
    var sameQin = ben.yao.filter(function (o) { return o.liuqin === useType; });
    if (sameQin.length > 1) add('卦中' + useType + '两现（' + sameQin.map(function (o) { return o.gz; }).join('、') + '），取动者、临世者、旺者为主，余为参考。', 0, '《增删卜易·用神多现》');

    score = Math.max(1, Math.min(99, Math.round(score)));
    var verdict, level;
    if (score >= 72) { verdict = '大吉 · 事可成'; level = 5; }
    else if (score >= 60) { verdict = '吉 · 顺而有成'; level = 4; }
    else if (score >= 47) { verdict = '中平 · 可成而需待时'; level = 3; }
    else if (score >= 34) { verdict = '不利 · 多阻宜缓'; level = 2; }
    else { verdict = '凶 · 事难成'; level = 1; }

    return { score: score, verdict: verdict, level: level, reasons: reasons, use: { idx: useIdx, yao: y }, role: role, q: q };
  }

  function roleOf(wx, gongWx) { return liuqin(gongWx, wx); }

  /* 六冲/六合：按纳甲地支判定（初四、二五、三上三对爻） */
  var PAIRS = [[0, 3], [1, 4], [2, 5]];
  function isChong(pan) {
    var yao = pan.yao || pan;
    for (var i = 0; i < 3; i++) {
      var a = yao[PAIRS[i][0]], b = yao[PAIRS[i][1]];
      if (((ZHI.indexOf(a.zhi) - ZHI.indexOf(b.zhi) + 12) % 12) !== 6) return false;
    }
    return true;
  }
  function isHe(pan) {
    var yao = pan.yao || pan;
    var LIUHE = { '子': '丑', '丑': '子', '寅': '亥', '亥': '寅', '卯': '戌', '戌': '卯', '辰': '酉', '酉': '辰', '巳': '申', '申': '巳', '午': '未', '未': '午' };
    for (var i = 0; i < 3; i++) {
      var a = yao[PAIRS[i][0]], b = yao[PAIRS[i][1]];
      if (LIUHE[a.zhi] !== b.zhi) return false;
    }
    return true;
  }

  var API = {
    TRI: TRI, NAJIA: NAJIA, PALACE: PALACE, LIUSHEN: LIUSHEN, LIUSHEN_DESC: LIUSHEN_DESC,
    LIUQIN_ALL: LIUQIN_ALL, GUA_MAP: GUA_MAP,
    cast: cast, binsOf: binsOf, analyze: analyze, liuqin: liuqin,
    hexInfo: hexInfo, detectQuestion: detectQuestion, isChong: isChong, isHe: isHe
  };
  root.XJLiuyao = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
}(typeof window !== 'undefined' ? window : this));
