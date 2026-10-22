/* ============================================================
   梅花易数  window.XJMeihua
   依据：邵雍《梅花易数》——年月日时起卦、数字起卦、体用互变
   ============================================================ */
(function (root) {
  'use strict';
  var C = root.XJCalendar;
  var GAN = C.GAN, ZHI = C.ZHI, SHENGXIAO = C.SHENGXIAO;
  var SHENG = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  var KE = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };

  /* 先天八卦数：乾一 兑二 离三 震四 巽五 坎六 艮七 坤八 */
  var NUM2GUA = { 1: '乾', 2: '兑', 3: '离', 4: '震', 5: '巽', 6: '坎', 7: '艮', 8: '坤' };
  var GUA2NUM = { '乾': 1, '兑': 2, '离': 3, '震': 4, '巽': 5, '坎': 6, '艮': 7, '坤': 8 };
  var TRI_BIN = { '乾': '111', '兑': '110', '离': '101', '震': '100', '巽': '011', '坎': '010', '艮': '001', '坤': '000' };
  var TRI_SYM = { '乾': '☰', '兑': '☱', '离': '☲', '震': '☳', '巽': '☴', '坎': '☵', '艮': '☶', '坤': '☷' };
  var TRI_WX = { '乾': '金', '兑': '金', '离': '火', '震': '木', '巽': '木', '坎': '水', '艮': '土', '坤': '土' };
  var TRI_XIANG = {
    '乾': '乾为天，其德健，主刚健、君父、进取、决断',
    '兑': '兑为泽，其德悦，主喜悦、口舌、少女、毁折',
    '离': '离为火，其德丽，主文明、文书、光明、分离',
    '震': '震为雷，其德动，主奋起、震动、长子、惊惧',
    '巽': '巽为风，其德入，主顺从、进退、长女、消息',
    '坎': '坎为水，其德陷，主险难、智谋、中男、隐伏',
    '艮': '艮为山，其德止，主静止、阻隔、少男、田土',
    '坤': '坤为地，其德顺，主柔顺、母亲、承载、众多'
  };
  var TRI_ROLE = { '乾': '父', '坤': '母', '震': '长男', '巽': '长女', '坎': '中男', '离': '中女', '艮': '少男', '兑': '少女' };

  function binOf(lower, upper) { return TRI_BIN[lower] + TRI_BIN[upper]; }

  function hexInfo(bin) {
    var H = root.XJHexagrams;
    if (!H) return null;
    for (var k in H) if (H[k].binary === bin) return H[k];
    return null;
  }
  var PURE_NAMES = { '乾': '乾为天', '兑': '兑为泽', '离': '离为火', '震': '震为雷', '巽': '巽为风', '坎': '坎为水', '艮': '艮为山', '坤': '坤为地' };
  function nameOf(lower, upper) {
    var h = hexInfo(binOf(lower, upper));
    if (h) return h.full || h.name;
    if (lower === upper) return PURE_NAMES[lower];
    return upper + '上' + lower + '下';
  }

  /* ---- 起卦：年月日时 ---- */
  function timeGua(dt, opt) {
    opt = opt || {};
    var f = C.fourPillars(dt, { ziRule: opt.ziRule });
    var yearZhi = f.year.zhi, hourZhi = f.hour.zhi;
    var lunar = null;
    try { if (root.XJLunar) lunar = root.XJLunar.solarToLunar(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()); } catch (e) { lunar = null; }
    var yNum = ZHI.indexOf(yearZhi) + 1;                 // 子1 … 亥12
    var mNum = lunar ? (lunar.leap || lunar.lm) : (ZHI.indexOf(f.month.zhi) + 1);
    var dNum = lunar ? lunar.ld : dt.getDate();
    var hNum = ZHI.indexOf(hourZhi) + 1;
    var s1 = yNum + mNum + dNum;
    var upNum = s1 % 8 || 8;
    var loNum = (s1 + hNum) % 8 || 8;
    var mv = (s1 + hNum) % 6 || 6;
    return {
      method: '年月日时起卦',
      yearZhi: yearZhi, month: mNum, day: dNum, hourZhi: hourZhi, hNum: hNum,
      lunar: lunar, upper: NUM2GUA[upNum], lower: NUM2GUA[loNum], moving: mv,
      calc: '上卦＝(年支' + yNum + '＋月' + mNum + '＋日' + dNum + ') mod 8 ＝ ' + upNum + '（' + NUM2GUA[upNum] + '）；' +
        '下卦＝上数＋时支' + hNum + ' mod 8 ＝ ' + loNum + '（' + NUM2GUA[loNum] + '）；' +
        '动爻＝总数 mod 6 ＝ ' + mv + ' 爻'
    };
  }

  /* ---- 起卦：数字 ---- */
  function numGua(n1, n2, label) {
    n1 = Math.abs(Math.floor(n1)); n2 = Math.abs(Math.floor(n2));
    var upNum = n1 % 8 || 8, loNum = n2 % 8 || 8;
    var mv = (n1 + n2) % 6 || 6;
    return {
      method: label || '数字起卦',
      n1: n1, n2: n2, upper: NUM2GUA[upNum], lower: NUM2GUA[loNum], moving: mv,
      calc: '第一数 ' + n1 + ' mod 8 ＝ ' + upNum + '（上卦' + NUM2GUA[upNum] + '）；' +
        '第二数 ' + n2 + ' mod 8 ＝ ' + loNum + '（下卦' + NUM2GUA[loNum] + '）；' +
        '两数之和 mod 6 ＝ ' + mv + '（动爻）'
    };
  }

  /* ---- 分析 ---- */
  function analyze(cast, opt) {
    opt = opt || {};
    var lower = cast.lower, upper = cast.upper, mv = cast.moving;
    var benBin = binOf(lower, upper);
    var bits = benBin.split('');

    /* 互卦：下互取 2、3、4 爻，上互取 3、4、5 爻 */
    var huLower = bits[1] + bits[2] + bits[3];
    var huUpper = bits[2] + bits[3] + bits[4];
    var huLowerName = bin2tri(huLower), huUpperName = bin2tri(huUpper);

    /* 变卦：动爻取反 */
    var bianBits = bits.slice();
    bianBits[mv - 1] = bianBits[mv - 1] === '1' ? '0' : '1';
    var bianBin = bianBits.join('');
    var bianLower = bin2tri(bianBin.slice(0, 3)), bianUpper = bin2tri(bianBin.slice(3));

    /* 体用：动爻所在之卦为用，另一卦为体 */
    var movingInLower = mv <= 3;
    var tiTri = movingInLower ? upper : lower;
    var yongTri = movingInLower ? lower : upper;

    var tiWx = TRI_WX[tiTri], yongWx = TRI_WX[yongTri];
    var rel = relation(tiWx, yongWx);

    /* 卦气：按月令旺衰 */
    var season = seasonOf(cast, opt);
    var tiQi = qiOf(tiWx, season), yongQi = qiOf(yongWx, season);

    var reasons = [];
    var score = 50;
    function add(t, d, ref) { score += d; reasons.push({ text: t, d: d, ref: ref || '' }); }

    var benInfo = hexInfo(benBin), bianInfo = hexInfo(bianBin), huInfo = hexInfo(huLower + huUpper);

    /* 体用生克 */
    if (rel === '用生体') add('用卦' + yongTri + '（' + yongWx + '）生体卦' + tiTri + '（' + tiWx + '），为「用生体」，得外力之助，事多顺遂，求谋可成。', 16, '《梅花易数·体用总诀》');
    else if (rel === '体克用') add('体卦' + tiTri + '（' + tiWx + '）克用卦' + yongTri + '（' + yongWx + '），为「体克用」，我强彼弱，事可成而须费力，求财反可得。', 10, '《梅花易数·体用总诀》');
    else if (rel === '体生用') add('体卦' + tiTri + '（' + tiWx + '）生用卦' + yongTri + '（' + yongWx + '），为「体生用」，泄我之气，主耗损、劳而无功，宜守不宜进。', -10, '《梅花易数·体用总诀》');
    else if (rel === '用克体') add('用卦' + yongTri + '（' + yongWx + '）克体卦' + tiTri + '（' + tiWx + '），为「用克体」，受制于人，事多阻逆，宜避其锋。', -16, '《梅花易数·体用总诀》');
    else add('体用比和（同为' + tiWx + '），气类相求，事顺而可成，谋为如意。', 12, '《梅花易数·体用总诀》');

    /* 体卦旺衰 */
    add('体卦' + tiTri + '属' + tiWx + '，' + season + '月令，' + tiQi.text + '。', tiQi.d, '《梅花易数·旺衰》');

    /* 互卦 */
    var huUpperWx = TRI_WX[huUpperName], huLowerWx = TRI_WX[huLowerName];
    var huRel = relation(tiWx, huUpperWx);
    add('互卦为' + nameOf(huLowerName, huUpperName) + '（上' + huUpperName + huUpperWx + '、下' + huLowerName + huLowerWx + '），主事之中段情状。' +
      (SHENG[huUpperWx] === tiWx ? '上互生体，中途得助。' : KE[huUpperWx] === tiWx ? '上互克体，中途有阻。' : '上互与体' + (huUpperWx === tiWx ? '比和，气息相通。' : '无直接生克。')),
      SHENG[huUpperWx] === tiWx ? 6 : KE[huUpperWx] === tiWx ? -6 : 0, '《梅花易数·互卦》');

    /* 变卦 */
    var bianTiTri = movingInLower ? bianUpper : bianLower;
    var bianYongTri = movingInLower ? bianLower : bianUpper;
    var bianTiWx = TRI_WX[bianTiTri];
    var bianRel = relation(tiWx, bianTiWx);
    add('变卦为' + nameOf(bianLower, bianUpper) + '，主事之终局。体卦化' + bianTiTri + '（' + bianTiWx + '），' +
      (bianRel === '用生体' ? '变来生体，终有归宿，先难后易。' : bianRel === '用克体' ? '变来克体，终局不利，防先成后败。' : bianRel === '体克用' ? '体克变卦，终能自守。' : bianRel === '体生用' ? '体生变卦，终有耗散。' : '与体比和，终局平顺。'),
      bianRel === '用生体' ? 10 : bianRel === '用克体' ? -10 : bianRel === '体克用' ? 4 : bianRel === '体生用' ? -4 : 6, '《梅花易数·变卦》');

    /* 卦名卦辞 */
    if (benInfo && benInfo.gua) {
      add('本卦《' + benInfo.name + '》：' + benInfo.gua + '　—　' + (benInfo.xiang || ''), 0, '《周易》');
    }

    /* 应期 */
    var yongNum = GUA2NUM[yongTri];
    var qiText = '应期可参用卦' + yongTri + '之数 ' + yongNum + '，或' + yongWx + '旺之月日（' +
      ({ '木': '寅卯', '火': '巳午', '土': '辰戌丑未', '金': '申酉', '水': '亥子' })[yongWx] + '月），亦可取成卦总数之期。';

    score = Math.max(1, Math.min(99, Math.round(score)));
    var verdict = score >= 74 ? '大吉 · 事可成' : score >= 61 ? '吉 · 顺遂可为' : score >= 47 ? '中平 · 可成而有波折' : score >= 34 ? '不利 · 宜缓图' : '凶 · 事难谐';

    return {
      cast: cast,
      ben: { lower: lower, upper: upper, bin: benBin, name: nameOf(lower, upper), info: benInfo },
      hu: { lower: huLowerName, upper: huUpperName, bin: huLower + huUpper, name: nameOf(huLowerName, huUpperName), info: huInfo },
      bian: { lower: bianLower, upper: bianUpper, bin: bianBin, name: nameOf(bianLower, bianUpper), info: bianInfo },
      ti: { tri: tiTri, wx: tiWx, role: TRI_ROLE[tiTri], xiang: TRI_XIANG[tiTri], qi: tiQi },
      yong: { tri: yongTri, wx: yongWx, role: TRI_ROLE[yongTri], xiang: TRI_XIANG[yongTri], qi: yongQi },
      rel: rel, moving: mv, season: season,
      score: score, verdict: verdict, reasons: reasons, qiText: qiText
    };
  }

  function bin2tri(b) {
    for (var k in TRI_BIN) if (TRI_BIN[k] === b) return k;
    return '乾';
  }
  function relation(tiWx, otherWx) {
    if (SHENG[otherWx] === tiWx) return '用生体';
    if (KE[otherWx] === tiWx) return '用克体';
    if (KE[tiWx] === otherWx) return '体克用';
    if (SHENG[tiWx] === otherWx) return '体生用';
    return '比和';
  }

  var SEASON_WX = {
    '春': { '木': '旺', '火': '相', '水': '休', '金': '囚', '土': '死' },
    '夏': { '火': '旺', '土': '相', '木': '休', '水': '囚', '金': '死' },
    '秋': { '金': '旺', '水': '相', '土': '休', '火': '囚', '木': '死' },
    '冬': { '水': '旺', '木': '相', '金': '休', '土': '囚', '火': '死' },
    '四季': { '土': '旺', '金': '相', '火': '休', '木': '囚', '水': '死' }
  };
  var QI_D = { '旺': 12, '相': 6, '休': -3, '囚': -8, '死': -12 };
  function seasonOf(cast, opt) {
    var dt = opt.date || new Date();
    var mz = C.fourPillars(dt, {}).month.zhi;
    var i = ZHI.indexOf(mz);
    if (i === 2 || i === 3) return '春';      // 寅卯
    if (i === 5 || i === 6) return '夏';      // 巳午
    if (i === 8 || i === 9) return '秋';      // 申酉
    if (i === 11 || i === 0) return '冬';     // 亥子
    return '四季';                             // 辰未戌丑
  }
  function qiOf(wx, season) {
    var q = SEASON_WX[season][wx];
    return { qi: q, d: QI_D[q], text: '于' + season + '令为「' + q + '」' + (q === '旺' ? '，得时最盛' : q === '相' ? '，次旺有气' : q === '休' ? '，气已退' : q === '囚' ? '，受制无力' : '，最弱无气') };
  }

  var API = {
    NUM2GUA: NUM2GUA, GUA2NUM: GUA2NUM, TRI_BIN: TRI_BIN, TRI_SYM: TRI_SYM, TRI_WX: TRI_WX,
    TRI_XIANG: TRI_XIANG, TRI_ROLE: TRI_ROLE, timeGua: timeGua, numGua: numGua, analyze: analyze,
    nameOf: nameOf, relation: relation
  };
  root.XJMeihua = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
}(typeof window !== 'undefined' ? window : this));
