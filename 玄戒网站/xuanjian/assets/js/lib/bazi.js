/* =====================================================================
 * 玄鉴 · 八字引擎  bazi.js
 * 四柱 / 十神 / 藏干 / 五行力量 / 旺衰 / 用神 / 格局 / 神煞 / 大运 / 断语
 * 依《渊海子平》《三命通会》《子平真诠》《滴天髓》立论
 * ===================================================================== */
(function (root) {
  'use strict';
  var C = root.XJCalendar || (typeof require !== 'undefined' ? require('./calendar.js') : null);
  var GAN = C.GAN, ZHI = C.ZHI, CANG = C.CANG_GAN;
  var WX_GAN = C.WUXING_GAN, WX_ZHI = C.WUXING_ZHI;

  var SHENG = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };   // 我生
  var KE = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };      // 我克
  var WX_COLOR = { '木': '#3c7a5a', '火': '#a8342b', '土': '#8a6a34', '金': '#8c8479', '水': '#2f5a78' };
  var WX_ZHANG = { '木': '肝胆、筋、目', '火': '心、小肠、血脉、舌', '土': '脾胃、肌肉、口', '金': '肺、大肠、皮毛、鼻', '水': '肾、膀胱、骨、耳' };
  var WX_DIR = { '木': '东方', '火': '南方', '土': '中宫', '金': '西方', '水': '北方' };
  var WX_TRADE = {
    '木': '文教、出版、林木、医药、纺织、创意',
    '火': '能源、电力、传媒、餐饮、演艺、光电',
    '土': '地产、建筑、农业、仓储、陶瓷、中介',
    '金': '金融、机械、法律、军警、五金、精密制造',
    '水': '贸易、物流、旅游、水产、信息、咨询'
  };
  var SHISHEN_ALL = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'];

  function wxOf(g) { return WX_GAN[GAN.indexOf(g)]; }
  function samePolarity(a, b) {
    return (GAN.indexOf(a) % 2) === (GAN.indexOf(b) % 2);
  }
  /* 以日干为我，论他干之十神 */
  function shishen(dayGan, otherGan) {
    var me = wxOf(dayGan), it = wxOf(otherGan), same = samePolarity(dayGan, otherGan);
    if (me === it) return same ? '比肩' : '劫财';
    if (SHENG[me] === it) return same ? '食神' : '伤官';
    if (KE[me] === it) return same ? '偏财' : '正财';
    if (KE[it] === me) return same ? '七杀' : '正官';
    if (SHENG[it] === me) return same ? '偏印' : '正印';
    return '';
  }
  var SHISHEN_CLASS = {
    '比肩': '比劫', '劫财': '比劫', '食神': '食伤', '伤官': '食伤',
    '偏财': '财星', '正财': '财星', '七杀': '官杀', '正官': '官杀',
    '偏印': '印星', '正印': '印星'
  };

  /* -------- 十二长生 -------- */
  var CHANGSHENG_START = { '甲': 11, '乙': 6, '丙': 2, '丁': 9, '戊': 2, '己': 9, '庚': 5, '辛': 0, '壬': 8, '癸': 3 };
  var CHANGSHENG_NAME = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];
  function changsheng(gan, zhi) {
    var start = CHANGSHENG_START[gan];
    var dir = GAN.indexOf(gan) % 2 === 0 ? 1 : -1;
    var step = ((ZHI.indexOf(zhi) - start) * dir % 12 + 12) % 12;
    return CHANGSHENG_NAME[step];
  }

  /* -------- 神煞 -------- */
  var TIANYI = { '甲': '丑未', '戊': '丑未', '庚': '丑未', '乙': '子申', '己': '子申', '丙': '亥酉', '丁': '亥酉', '壬': '卯巳', '癸': '卯巳', '辛': '午寅' };
  var WENCHANG = { '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申', '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯' };
  var YANGREN = { '甲': '卯', '乙': '辰', '丙': '午', '丁': '未', '戊': '午', '己': '未', '庚': '酉', '辛': '戌', '壬': '子', '癸': '丑' };
  var SANHE_GROUP = { '申': 0, '子': 0, '辰': 0, '寅': 1, '午': 1, '戌': 1, '巳': 2, '酉': 2, '丑': 2, '亥': 3, '卯': 3, '未': 3 };
  var TAOHUA = ['酉', '卯', '午', '子'];
  var YIMA = ['寅', '申', '亥', '巳'];
  var HUAGAI = ['辰', '戌', '丑', '未'];
  var JIANGXING = ['子', '午', '酉', '卯'];

  function shensha(p, gender) {
    var out = [];
    var dayGan = p.day.gan, yearZhi = p.year.zhi, dayZhi = p.day.zhi, monthZhi = p.month.zhi;
    var zhis = [p.year.zhi, p.month.zhi, p.day.zhi, p.hour.zhi];
    var g = SANHE_GROUP[yearZhi];
    var add = function (name, hit, meaning, src) {
      if (hit) out.push({ name: name, meaning: meaning, src: src, pos: hit });
    };
    var hitZhi = function (list) {
      var r = [];
      for (var i = 0; i < zhis.length; i++) if (list.indexOf(zhis[i]) >= 0) r.push(['年', '月', '日', '时'][i] + '支');
      return r.join('、');
    };
    add('天乙贵人', hitZhi(TIANYI[dayGan].split('')), '贵人相助，遇难有救，主一生多得提携。', '《三命通会·论天乙贵人》');
    add('文昌贵人', hitZhi([WENCHANG[dayGan]]), '主聪明好学，利文途考试，文思敏捷。', '《三命通会》');
    add('羊刃', hitZhi([YANGREN[dayGan]]), '性刚果决，行事有魄力；过旺则易冲动伤身，宜以官杀制之。', '《渊海子平·论羊刃》');
    add('驿马', hitZhi([YIMA[g]]), '主动荡奔驰，宜外出发展、从事流动之业，主变迁。', '《三命通会·论驿马》');
    add('桃花', hitZhi([TAOHUA[g]]), '主人缘异性缘佳，风度可人；过则易生情困，宜自持。', '《三命通会·论咸池》');
    add('华盖', hitZhi([HUAGAI[g]]), '主孤高聪慧，好玄学艺文，宜僧道艺术之途。', '《三命通会·论华盖》');
    add('将星', hitZhi([JIANGXING[g]]), '主统御之才，可掌权柄，宜武职管理。', '《三命通会》');
    /* 月德 / 天德 */
    var yueDe = { 2: '丙', 6: '壬', 10: '丙', 8: '壬', 0: '壬', 4: '壬', 11: '甲', 3: '甲', 7: '甲', 5: '庚', 9: '庚', 1: '庚' };
    var tianDe = { 2: '丁', 3: '申', 4: '壬', 5: '辛', 6: '亥', 7: '甲', 8: '癸', 9: '寅', 10: '丙', 11: '乙', 0: '巳', 1: '庚' };
    var allGan = [p.year.gan, p.month.gan, p.hour.gan];
    if (allGan.indexOf(yueDe[ZHI.indexOf(monthZhi)]) >= 0) out.push({ name: '月德贵人', pos: '天干', meaning: '主慈祥恺悌，逢凶化吉，一生少险。', src: '《三命通会·论月德》' });
    var td = tianDe[ZHI.indexOf(monthZhi)];
    if (allGan.indexOf(td) >= 0 || zhis.indexOf(td) >= 0) out.push({ name: '天德贵人', pos: '命局', meaning: '主福厚德全，官刑不犯，遇难呈祥。', src: '《三命通会·论天德》' });
    /* 空亡 */
    var kong = p.day.kong;
    var kongHit = [];
    for (var i = 0; i < 4; i++) if (kong.indexOf(zhis[i]) >= 0) kongHit.push(['年', '月', '日', '时'][i] + '支');
    if (kongHit.length) out.push({ name: '空亡', pos: kongHit.join('、'), meaning: '所落之宫主虚，吉神落空减力，凶煞落空亦减凶；六亲缘分宜淡看。', src: '《渊海子平·论空亡》' });
    return out;
  }

  /* -------- 地支关系 -------- */
  var LIUHE = { '子': '丑', '丑': '子', '寅': '亥', '卯': '戌', '辰': '酉', '巳': '申', '午': '未', '未': '午', '申': '巳', '酉': '辰', '戌': '卯', '亥': '寅' };
  var LIUHAI = { '子': '未', '未': '子', '丑': '午', '午': '丑', '寅': '巳', '巳': '寅', '卯': '辰', '辰': '卯', '申': '亥', '亥': '申', '酉': '戌', '戌': '酉' };
  var SANHE = [{ z: ['申', '子', '辰'], wx: '水' }, { z: ['亥', '卯', '未'], wx: '木' }, { z: ['寅', '午', '戌'], wx: '火' }, { z: ['巳', '酉', '丑'], wx: '金' }];
  var SANHUI = [{ z: ['寅', '卯', '辰'], wx: '木' }, { z: ['巳', '午', '未'], wx: '火' }, { z: ['申', '酉', '戌'], wx: '金' }, { z: ['亥', '子', '丑'], wx: '水' }];

  function relations(zhis) {
    var names = ['年', '月', '日', '时'], out = [];
    for (var i = 0; i < 4; i++) {
      for (var j = i + 1; j < 4; j++) {
        var a = zhis[i], b = zhis[j];
        if (LIUHE[a] === b) out.push({ type: '六合', text: names[i] + a + ' 合 ' + names[j] + b, note: '主合化、亲和、牵绊', wuxing: '', a: i, b: j });
        if (LIUHAI[a] === b) out.push({ type: '相害', text: names[i] + a + ' 害 ' + names[j] + b, note: '主暗中损耗、膈应', wuxing: '', a: i, b: j });
        if ((ZHI.indexOf(a) - ZHI.indexOf(b) + 12) % 12 === 6) out.push({ type: '六冲', text: names[i] + a + ' 冲 ' + names[j] + b, note: '主动荡、变动、冲突', wuxing: '', a: i, b: j });
        if ((a === '子' && b === '卯') || (a === '卯' && b === '子')) out.push({ type: '相刑', text: '子卯相刑（无礼之刑）', note: '主口舌、人情失和', wuxing: '', a: i, b: j });
      }
    }
    /* 三合 / 三会 / 三刑 */
    SANHE.forEach(function (g) {
      if (g.z.every(function (z) { return zhis.indexOf(z) >= 0; })) out.push({ type: '三合局', text: g.z.join('') + ' 三合 ' + g.wx + '局', note: '合而成局，' + g.wx + '气大增', wuxing: g.wx });
    });
    SANHUI.forEach(function (g) {
      if (g.z.every(function (z) { return zhis.indexOf(z) >= 0; })) out.push({ type: '三会局', text: g.z.join('') + ' 三会 ' + g.wx + '方', note: '方局最旺，' + g.wx + '气极盛', wuxing: g.wx });
    });
    [['寅', '巳', '申'], ['丑', '戌', '未']].forEach(function (g) {
      var hit = g.filter(function (z) { return zhis.indexOf(z) >= 0; });
      if (hit.length >= 2) out.push({ type: '相刑', text: hit.join('') + '（' + (g[0] === '寅' ? '恃势之刑' : '无恩之刑') + '）', note: '主刑伤、官非、病痛，宜制化', wuxing: '' });
    });
    return out;
  }

  /* -------- 五行力量 -------- */
  var GAN_W = { '年': 1.0, '月': 1.2, '时': 1.0 };
  var ZHI_W = { '年': 1.0, '月': 2.5, '日': 1.2, '时': 1.0 };
  var PORTION = { 1: [1], 2: [0.7, 0.3], 3: [0.6, 0.25, 0.15] };

  function wuxingPower(p) {
    var power = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    power[wxOf(p.day.gan)] += 1.0;
    ['year', 'month', 'hour'].forEach(function (k) {
      power[wxOf(p[k].gan)] += GAN_W[{ year: '年', month: '月', hour: '时' }[k]];
    });
    ['year', 'month', 'day', 'hour'].forEach(function (k) {
      var z = p[k].zhi, cg = CANG[z], port = PORTION[cg.length], w = ZHI_W[{ year: '年', month: '月', day: '日', hour: '时' }[k]];
      cg.forEach(function (g, i) { power[wxOf(g)] += w * port[i]; });
    });
    var total = 0;
    for (var k in power) total += power[k];
    var pct = {};
    for (var k2 in power) pct[k2] = power[k2] / total * 100;
    return { raw: power, pct: pct, total: total };
  }

  /* -------- 大运 -------- */
  function dayun(p, dt, gender) {
    var yangYear = GAN.indexOf(p.year.gan) % 2 === 0;
    var forward = (yangYear && gender === '男') || (!yangYear && gender === '女');
    var jie = forward ? C.nextJie(dt) : C.lastJie(dt);
    var diffDays = Math.abs(jie.date - dt) / 86400000;
    var totalMonths = diffDays * 4;                 // 3 日折 1 年 → 1 日折 4 月
    var startAge = Math.floor(totalMonths / 12);
    var startMonth = Math.round(totalMonths % 12);
    if (startMonth === 12) { startAge += 1; startMonth = 0; }
    var startDate = new Date(dt.getFullYear() + startAge, dt.getMonth() + startMonth, dt.getDate());
    var list = [], cur = p.month.idx;
    for (var i = 1; i <= 10; i++) {
      cur = forward ? (cur + 1) % 60 : (cur + 59) % 60;
      var age = startAge + (i - 1) * 10;
      var dyGan = GAN[cur % 10];
      list.push({
        idx: cur, gan: dyGan, zhi: ZHI[cur % 12], nayin: C.gzNaYinOf(cur),
        shishen: shishen(p.day.gan, dyGan),
        startAge: age, endAge: age + 9, startYear: startDate.getFullYear() + (i - 1) * 10
      });
    }
    return { forward: forward, startAge: startAge, startMonth: startMonth, startDate: startDate, list: list, jie: jie };
  }

  /* -------- 格局 -------- */
  function geju(p, power) {
    var dayGan = p.day.gan, monthZhi = p.month.zhi, cg = CANG[monthZhi][0];
    var isLu = (CHANGSHENG_START[dayGan] === ZHI.indexOf(monthZhi) && GAN.indexOf(dayGan) % 2 === 0);
    /* 建禄：月支为日干临官之地 */
    var luPos = (CHANGSHENG_START[dayGan] + 3) % 12;
    var yangRenPos = (CHANGSHENG_START[dayGan] + 4) % 12;
    var isYangRen = (ZHI.indexOf(monthZhi) === yangRenPos);
    if (ZHI.indexOf(monthZhi) === luPos) return { name: '建禄格', desc: '月令为日主临官之地，日主得禄而旺，最喜财官透出，以财滋弱，以官制身。', src: '《子平真诠·论建禄月劫》' };
    if (isYangRen) return { name: '月劫格（阳刃格）', desc: '月令为日主帝旺之地，气势极旺，须官杀制刃，或食伤泄秀，最忌印比助旺。', src: '《子平真诠·论阳刃》' };
    if (cg === dayGan) return { name: '月劫格', desc: '月令本气为比劫，日主党众，宜官杀制之、食伤泄之。', src: '《子平真诠》' };
    var ss = shishen(dayGan, cg);
    var map = {
      '正官': ['正官格', '月令正官，主贵气，宜财印相随：财生官、印护官，忌伤官见官。'],
      '七杀': ['七杀格', '月令七杀，主威权，最喜食神制杀或印绶化杀，忌财党杀攻身。'],
      '正财': ['正财格', '月令正财，主实富，喜身强任财、官星护财，忌比劫分夺。'],
      '偏财': ['偏财格', '月令偏财，主流动之财，喜身旺、食伤生财，忌劫财争夺。'],
      '食神': ['食神格', '月令食神，主福厚，喜身强食旺、财星承接，忌枭神夺食。'],
      '伤官': ['伤官格', '月令伤官，主才华，喜佩印、生财，最忌伤官见官。'],
      '正印': ['正印格', '月令正印，主学问庇荫，喜官星生印、身弱得助，忌财星坏印。'],
      '偏印': ['偏印格', '月令偏印，主机敏偏才，喜偏财制枭，忌枭神夺食。'],
      '比肩': ['建禄格', '月令比肩，日主得助，喜财官透出为用。'],
      '劫财': ['月劫格', '月令劫财，日主党旺，喜官杀制之、食伤泄之。']
    };
    var m = map[ss] || ['普通格', '月令五行平常，以全局气势取用。'];
    return { name: m[0], desc: m[1], src: '《子平真诠·论用神》' };
  }

  /* -------- 用神 -------- */
  function yongshen(p, power, gender) {
    var me = wxOf(p.day.gan);
    var yin = null, bi = me, shi = SHENG[me], cai = KE[me], guan = null;
    for (var k in SHENG) if (SHENG[k] === me) yin = k;
    for (var k2 in KE) if (KE[k2] === me) guan = k2;
    var pct = power.pct;
    var same = pct[me] + pct[yin];
    var level = same >= 62 ? '极强' : same >= 54 ? '偏强' : same >= 45 ? '中和' : same >= 36 ? '偏弱' : '极弱';
    var group = { '极强': 4, '偏强': 3, '中和': 2, '偏弱': 1, '极弱': 0 }[level];

    function has(wx) {
      var tou = [p.year.gan, p.month.gan, p.hour.gan].some(function (g) { return wxOf(g) === wx; });
      var gen = [p.year.zhi, p.month.zhi, p.day.zhi, p.hour.zhi].some(function (z) {
        return CANG[z].some(function (g) { return wxOf(g) === wx; });
      });
      return { tou: tou, gen: gen };
    }
    function sc(wx) { var h = has(wx); return pct[wx] + (h.tou ? 4 : 0) + (h.gen ? 3 : 0); }

    var picks = [], avoidWx = [];
    if (group >= 3) {
      picks = [[guan, '官杀克身，制其过旺，使气归于中和'], [shi, '食伤泄秀，化其旺气为才华'], [cai, '财星耗身，损其有余']];
      avoidWx = [me, yin];
    } else if (group <= 1) {
      picks = [[yin, '印星生身，扶其元气'], [me, '比劫帮身，壮其气势']];
      avoidWx = [guan, cai];
    } else {
      /* 中和：依《子平真诠》以月令为用，取相神辅之 */
      var cls = SHISHEN_CLASS[shishen(p.day.gan, CANG[p.month.zhi][0])];
      if (cls === '财星') { picks = [[cai, '月令财星，取财为用，以食伤生财为相神'], [shi, '食伤生财，为财之源']]; avoidWx = [me]; }
      else if (cls === '官杀') { picks = [[guan, '月令官杀，取官杀为用，以财生官为相神'], [cai, '财星生官，为官之根']]; avoidWx = [shi]; }
      else if (cls === '印星') { picks = [[yin, '月令印星，取印为用，以官杀生印为相神'], [guan, '官杀生印，为印之源']]; avoidWx = [cai]; }
      else if (cls === '食伤') { picks = [[shi, '月令食伤，取食伤为用，以财承其气'], [cai, '财星承食伤之气，使秀气有归']]; avoidWx = [yin]; }
      else { picks = [[guan, '月令比劫，取官杀制之为用'], [cai, '财星耗比劫，为佐']]; avoidWx = [me, yin]; }
    }
    /* 有力者优先，气弱者不取 */
    var usable = picks.filter(function (c) { return sc(c[0]) >= 6; });
    if (!usable.length) {
      usable = [picks.slice().sort(function (a, b) { return sc(b[0]) - sc(a[0]); })[0]];
    }
    var cand = usable.map(function (c) { return { wx: c[0], why: c[1] }; });

    /* 调候：《滴天髓》寒暖燥湿 */
    var mz = ZHI.indexOf(p.month.zhi);
    var winter = [11, 0, 1].indexOf(mz) >= 0, summer = [5, 6, 7].indexOf(mz) >= 0;
    var tiaohou = null, tiaohouPriority = false;
    if (winter && pct['火'] < 12 && cand[0].wx !== '火') {
      tiaohou = { wx: '火', why: '生于' + p.month.zhi + '月，天寒地冻，非火不暖，调候先取火' };
    }
    if (summer && pct['水'] < 12 && cand[0].wx !== '水') {
      tiaohou = { wx: '水', why: '生于' + p.month.zhi + '月，火炎土燥，非水不润，调候先取水' };
    }
    if (tiaohou) {
      var ai = avoidWx.indexOf(tiaohou.wx);
      if (ai >= 0) { avoidWx.splice(ai, 1); tiaohouPriority = true; }
    }

    /* 从格 / 专旺格之辨 */
    var rootCount = [p.year.zhi, p.month.zhi, p.day.zhi, p.hour.zhi].filter(function (z) {
      return CANG[z].some(function (g) { return wxOf(g) === me; });
    }).length;
    var congNote = null;
    if (same <= 18 && rootCount <= 1) {
      congNote = '日主' + me + '气类近绝，四支中仅 ' + rootCount + ' 处微根，法当参「从格」之论（从财、从杀或从儿），不宜再以印比强扶；强扶反成「不从不扶」之病。';
    } else if (same >= 82) {
      congNote = '同党占 ' + same.toFixed(1) + '%，一派' + me + '气，近于「专旺格」（曲直、炎上、稼穑、从革、润下），宜顺其气势，以' + shi + '泄之为妙，忌官杀逆其锋。';
    }

    return {
      me: me, yin: yin, shi: shi, cai: cai, guan: guan,
      same: same, level: level, group: group,
      primary: cand[0], secondary: cand[1] || null, tiaohou: tiaohou, tiaohouPriority: tiaohouPriority,
      avoid: avoidWx, congNote: congNote,
      reason: (group >= 3 ? '日主' + p.day.gan + me + '得令得势，同党占 ' + same.toFixed(1) + '%，身旺宜克泄耗。'
        : group <= 1 ? '日主' + p.day.gan + me + '失令少助，同党仅占 ' + same.toFixed(1) + '%，身弱宜生扶。'
          : '日主' + p.day.gan + me + '同党占 ' + same.toFixed(1) + '%，气势中和，依月令取用、以相神辅之。')
    };
  }

  /* -------- 断语 -------- */
  var RIZHU_XING = {
    '甲': '甲木参天，脱胎要火。为人仁厚正直，有担当，志在向上；然性略执，不喜屈就。',
    '乙': '乙木虽柔，刲羊解牛。为人柔韧善变，随和而多才，善借势成事；然思虑较多，易随波。',
    '丙': '丙火猛烈，欺霜侮雪。为人热忱磊落，光明外向；然性急，喜怒形于色。',
    '丁': '丁火柔中，内性昭融。为人温婉细腻，内秀而敏；然心思细密，易感多虑。',
    '戊': '戊土固重，既中且正。为人厚重稳健，信实可靠；然略显固滞，不善转圜。',
    '己': '己土卑湿，中正蓄藏。为人谦和包容，务实细致；然易自我设限，思虑过重。',
    '庚': '庚金带煞，刚健为最。为人刚毅果决，重义气；然性刚易折，言语过直。',
    '辛': '辛金软弱，温润而清。为人清雅精致，重品味；然自尊心强，易敏感多疑。',
    '壬': '壬水通河，能泄金气。为人聪慧豁达，善谋略；然心思多变，易流于散。',
    '癸': '癸水至弱，达于天津。为人内敛细腻，直觉敏锐；然易多愁，喜怒不常示人。'
  };
  var SHISHEN_XING = {
    '比劫': '比劫旺者，独立好胜，重朋友义气，行事有主见；然易固执，财来财去，宜合伙审慎。',
    '食伤': '食伤旺者，才思敏捷，善表达与技艺，不喜拘束，宜文教、创意、技术之途；然易恃才傲物。',
    '财星': '财星旺者，务实重利，善经营理财，重视现实成果；然易为财劳形，需防因利失义。',
    '官杀': '官杀旺者，自律重规，责任感强，宜体制、管理、法度之途；然压力偏重，需防过劳。',
    '印星': '印星旺者，好学深思，重精神修养，得长辈庇荫；然易依赖迟疑，行动稍缓。'
  };

  function findShishenStrength(p) {
    var tally = { '比劫': 0, '食伤': 0, '财星': 0, '官杀': 0, '印星': 0 };
    ['year', 'month', 'hour'].forEach(function (k) {
      var s = shishen(p.day.gan, p[k].gan);
      if (s) tally[SHISHEN_CLASS[s]] += 1.2;
    });
    ['year', 'month', 'day', 'hour'].forEach(function (k) {
      CANG[p[k].zhi].forEach(function (g, i) {
        var s = shishen(p.day.gan, g);
        if (s) tally[SHISHEN_CLASS[s]] += [0.8, 0.3, 0.2][i] || 0.2;
      });
    });
    var best = '比劫', bv = -1;
    for (var k in tally) if (tally[k] > bv) { bv = tally[k]; best = k; }
    return { tally: tally, top: best };
  }

  function narrate(res) {
    var p = res.pillars, y = res.yongshen, g = res.geju, power = res.power;
    var secs = [];
    var push = function (t, body, basis) { secs.push({ title: t, body: body, basis: basis }); };

    push('格局总论',
      '日主<b>' + p.day.gan + '</b>（' + wxOf(p.day.gan) + '），生于<b>' + p.month.zhi + '月</b>，月令本气为<b>' + CANG[p.month.zhi][0] + '</b>，' +
      '取<b>' + g.name + '</b>。' + g.desc +
      ' 全局同党（比劫+印星）占 <b>' + y.same.toFixed(1) + '%</b>，判为<b>' + y.level + '</b>。' + (y.congNote ? ' ' + y.congNote : ''),
      g.src);

    push('用神取舍',
      y.reason + '故取<b>' + y.primary.wx + '</b>为用（' + y.primary.why + '）' +
      (y.secondary ? '，以<b>' + y.secondary.wx + '</b>为辅（' + y.secondary.why + '）' : '') + '。' +
      (y.tiaohou ? '又' + y.tiaohou.why + '，故<b>' + y.tiaohou.wx + '</b>为调候之需' +
        (y.tiaohouPriority ? '；调候为急，虽有碍扶抑，亦当先顾寒暖' : '') + '。' : '') +
      ' 忌<b>' + y.avoid.join('、') + '</b>过重。',
      '《滴天髓·衰旺》「能知衰旺之真机，其于三命之奥，思过半矣」');

    push('性情禀赋',
      RIZHU_XING[p.day.gan] + ' 十神之中，<b>' + res.topShishen + '</b>最旺：' + SHISHEN_XING[res.topShishen],
      '《滴天髓·十干体性》');

    var caiWx = y.cai, guanWx = y.guan;
    var caiPct = power.pct[caiWx], guanPct = power.pct[guanWx];
    push('财官事业',
      '财星（' + caiWx + '）占 <b>' + caiPct.toFixed(1) + '%</b>，官星（' + guanWx + '）占 <b>' + guanPct.toFixed(1) + '%</b>。' +
      (caiPct >= 18 ? '财气通门户，主有经营之才，宜以专业立身、以理财积富。' : caiPct >= 10 ? '财星得中，衣食可期，宜稳中求进，不宜投机。' : '财星偏弱，求财宜借专业与人脉，忌孤军冒进。') +
      (guanPct >= 15 ? '官星有力，宜体制、管理、法度之途，可掌名义。' : guanPct >= 8 ? '官星不显，宜以技艺、专业取胜，不必拘于科层。' : '官星微弱，行事宜自立门户，少受拘束。') +
      ' 就五行而论，' + y.primary.wx + '为用，宜从事' + WX_TRADE[y.primary.wx] + '之业，方位以' + WX_DIR[y.primary.wx] + '为得地。',
      '《滴天髓·何知章》「何知其人富，财气通门户；何知其人贵，官星有理会」');

    var spouseStar = res.gender === '男' ? '财星' : '官杀';
    var dayZhi = p.day.zhi;
    var spouseRel = res.relations.filter(function (r) { return r.a === 2 || r.b === 2; });
    push('婚姻六亲',
      '日支<b>' + dayZhi + '</b>为夫妻宫，' + (spouseRel.length ? '见' + spouseRel.map(function (r) { return r.text + '（' + r.note + '）'; }).join('、') + '，主婚姻宫有动，宜晚婚或择性情互补者，重在沟通包容。' : '安静无刑冲，夫妻宫安稳，主配偶宫平和，宜早定。') +
      ' 以' + spouseStar + '论配偶：' + (res.gender === '男'
        ? (y.cai === '金' || y.cai === '水' ? '财星清透，主配偶明理能干，助夫有力。' : '财星藏而不露，主配偶内敛持家。')
        : (guanPct >= 12 ? '官星有气，主配偶端正有担当。' : '官星偏弱，主配偶性情温和，宜多体谅。')) +
      ' 年柱' + p.year.gan + p.year.zhi + '代表祖上父母，' + (power.pct[wxOf(p.year.gan)] > 25 ? '年上之气偏旺，主早年得家中荫庇。' : '年上之气平顺，主早年自立。'),
      '《三命通会·论妻妾》《渊海子平·论六亲》');

    var weakWx = null, minv = 99;
    for (var k in power.pct) if (power.pct[k] < minv) { minv = power.pct[k]; weakWx = k; }
    push('体质康健',
      '五行以<b>' + weakWx + '</b>最弱（' + minv.toFixed(1) + '%），对应' + WX_ZHANG[weakWx] + '，平日宜加护养；' +
      '用神为' + y.primary.wx + '，' + WX_ZHANG[y.primary.wx] + '为得力之处。' +
      ' 神煞方面：' + (res.shensha.length ? res.shensha.map(function (s) { return '<b>' + s.name + '</b>（' + s.pos + '）'; }).join('、') + '，详见神煞表。' : '四柱神煞平淡，无大凶煞。'),
      '《黄帝内经·素问》五行藏象；《三命通会·论疾病》');

    var dy = res.dayun;
    var nowYear = new Date().getFullYear();
    var cur = dy.list.filter(function (d) { return nowYear >= d.startYear && nowYear < d.startYear + 10; })[0] || dy.list[0];
    push('大运流年',
      '命造' + (dy.forward ? '阳男阴女，大运顺行' : '阴男阳女，大运逆行') + '，' + dy.startAge + ' 岁 ' + dy.startMonth + ' 个月起运（' +
      C.fmtDate(dy.startDate).slice(0, 10) + ' 交运）。当前行<b>' + cur.gan + cur.zhi + '</b>运（' + cur.startYear + '–' + (cur.startYear + 9) + '），' +
      (y.primary.wx === wxOf(cur.gan) || y.primary.wx === WX_ZHI[ZHI.indexOf(cur.zhi)]
        ? '运干或运支正值用神，主此十年气机顺畅，宜进取、宜立业。'
        : y.avoid.indexOf(wxOf(cur.gan)) >= 0 ? '运干为忌神，宜守成、宜韬晦，重在固本培元。'
          : '运与用神无大背，平顺之运，宜稳扎稳打。') +
      ' ' + nowYear + ' 年流年<b>' + res.liunian[0].gan + res.liunian[0].zhi + '</b>，' +
      (res.liunian[0].shishen === '正官' || res.liunian[0].shishen === '七杀' ? '官杀临岁，主责任加身、变动升迁，宜谨言慎行。'
        : res.liunian[0].shishen === '正财' || res.liunian[0].shishen === '偏财' ? '财星临岁，主财事往来，宜理财有度。'
          : res.liunian[0].shishen === '食神' || res.liunian[0].shishen === '伤官' ? '食伤临岁，主表达创作、子女事务，宜守口。'
            : res.liunian[0].shishen === '正印' || res.liunian[0].shishen === '偏印' ? '印星临岁，主学业文书、长辈之事。'
              : '比劫临岁，主朋友合伙、竞争分财，宜守财。'),
      '《渊海子平·论大运》《三命通会·论流年》');
    return secs;
  }

  /* -------- 主入口 -------- */
  function analyze(opt) {
    var dt = opt.date;
    if (opt.trueSolar && typeof opt.longitude === 'number') dt = C.trueSolar(dt, opt.longitude).date;
    var p = C.fourPillars(dt, { ziRule: opt.ziRule });
    var gender = opt.gender === '女' ? '女' : '男';

    var cols = ['year', 'month', 'day', 'hour'];
    var detail = {};
    cols.forEach(function (k) {
      var gan = p[k].gan, zhi = p[k].zhi;
      detail[k] = {
        gan: gan, zhi: zhi,
        ganWx: wxOf(gan), zhiWx: WX_ZHI[ZHI.indexOf(zhi)],
        ganSS: k === 'day' ? '日主' : shishen(p.day.gan, gan),
        cang: CANG[zhi].map(function (g, i) {
          return { gan: g, wx: wxOf(g), ss: shishen(p.day.gan, g), role: ['本气', '中气', '余气'][i], cs: changsheng(p.day.gan, zhi) };
        }),
        nayin: p[k].nayin,
        changsheng: changsheng(p.day.gan, zhi),
        kong: p.day.kong.indexOf(zhi) >= 0
      };
    });
    /* 天干五合 */
    var hePairs = [['甲', '己'], ['乙', '庚'], ['丙', '辛'], ['丁', '壬'], ['戊', '癸']];
    var ganHe = [];
    for (var i = 0; i < 4; i++) for (var j = i + 1; j < 4; j++) {
      var a = p[cols[i]].gan, b = p[cols[j]].gan;
      hePairs.forEach(function (hp) {
        if ((hp[0] === a && hp[1] === b) || (hp[0] === b && hp[1] === a)) {
          ganHe.push({ text: ['年', '月', '日', '时'][i] + a + ' 合 ' + ['年', '月', '日', '时'][j] + b, note: '天干相合，主牵绊、合作；合而能化则吉，合而不化则羁' });
        }
      });
    }

    var power = wuxingPower(p);
    var ys = yongshen(p, power, gender);
    var gj = geju(p, power);
    var ssStr = findShishenStrength(p);
    var rel = relations([p.year.zhi, p.month.zhi, p.day.zhi, p.hour.zhi]).concat(ganHe);
    var dy = dayun(p, dt, gender);
    var sh = shensha(p, gender);

    var nowYear = new Date().getFullYear();
    var liunian = [];
    for (var k = 0; k < 8; k++) {
      var yy = nowYear + k;
      var idx = ((yy - 4) % 60 + 60) % 60;
      liunian.push({
        year: yy, gan: GAN[idx % 10], zhi: ZHI[idx % 12],
        shishen: shishen(p.day.gan, GAN[idx % 10]),
        nayin: C.gzNaYinOf(idx),
        age: yy - dt.getFullYear() + 1
      });
    }

    var res = {
      input: { date: dt, original: opt.date, gender: gender, ziRule: opt.ziRule, trueSolar: opt.trueSolar },
      pillars: p, detail: detail, power: power, yongshen: ys, geju: gj,
      topShishen: ssStr.top, tally: ssStr.tally, relations: rel,
      dayun: dy, shensha: sh, liunian: liunian, gender: gender,
      lunarJie: p.month.jie,
      wuxingColor: WX_COLOR
    };
    res.sections = narrate(res);
    return res;
  }

  var API = {
    analyze: analyze, shishen: shishen, changsheng: changsheng, wuxingPower: wuxingPower,
    relations: relations, shensha: shensha, narrate: narrate, WX_COLOR: WX_COLOR, WX_TRADE: WX_TRADE,
    WX_DIR: WX_DIR, WX_ZHANG: WX_ZHANG, SHISHEN_ALL: SHISHEN_ALL
  };
  root.XJBazi = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
