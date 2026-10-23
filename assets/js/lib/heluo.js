/* ============================================================
   河洛理数  window.XJHeluo
   依据：陈抟《河洛真数》（一名《河洛理数》）起例卷上
     ·「求数法」：人生年月日时，以天干配河图之数，以地支配洛书之数；
        单数为奇属阳为天，双数为偶属阴为地。
     · 河图数（天干，按五行）：木 3／8、火 7／2、土 5／10、金 9／4、水 1／6；
        阳干取奇、阴干取偶。
     · 洛书数（地支）：一六水（子1 亥6）、二七火（巳7 午2）、三八木（寅3 卯8）、
        四九金（申9 酉4）、五十土（辰戌5、丑未10）。
     ·「成卦法」：天数除二十五、地数除三十，还其正数，取余数成卦。
     ·「定数合卦例」：一坎、二坤、三震、四巽、五（寄宫）、六乾、七兑、八艮、九离。
     ·「阳命男、阴命女，天数卦在外居上，地数卦在内居下；
        阴命男、阳命女，天数卦在内居下，地数卦在外居上。」合成先天卦。
     ·「遇十不用法」：十去九即用一，二十用二，三十用三。
     ·「遇五寄宫法」：上元男寄艮女寄坤；中元阴男阳女寄坤、阳男阴女寄艮；
        下元男寄离女寄兑。（三元甲子：1864 上元、1924 中元、1984 下元）
     · 后天卦：先天卦六爻俱变、内外互移。
   说明：元堂（身宫爻位）原法有重数、寄位、乾坤特例，此处取简法，
        依生时阴阳择爻，页面已注明。
   ============================================================ */
(function (root) {
  'use strict';
  var C = root.XJCalendar;
  var GAN = C.GAN, ZHI = C.ZHI;

  /* 天干河图数 */
  var GAN_NUM = { '甲': 3, '乙': 8, '丙': 7, '丁': 2, '戊': 5, '己': 10, '庚': 9, '辛': 4, '壬': 1, '癸': 6 };
  /* 地支洛书数 */
  var ZHI_NUM = { '子': 1, '丑': 10, '寅': 3, '卯': 8, '辰': 5, '巳': 7, '午': 2, '未': 10, '申': 9, '酉': 4, '戌': 5, '亥': 6 };

  var NUM2GUA = { 1: '坎', 2: '坤', 3: '震', 4: '巽', 5: '乾', 6: '乾', 7: '兑', 8: '艮', 9: '离' };
  var TRI_BIN = { '乾': '111', '兑': '110', '离': '101', '震': '100', '巽': '011', '坎': '010', '艮': '001', '坤': '000' };
  var TRI_WX = { '乾': '金', '兑': '金', '离': '火', '震': '木', '巽': '木', '坎': '水', '艮': '土', '坤': '土' };
  var PURE_NAMES = { '乾': '乾为天', '兑': '兑为泽', '离': '离为火', '震': '震为雷', '巽': '巽为风', '坎': '坎为水', '艮': '艮为山', '坤': '坤为地' };

  function binOf(lower, upper) { return TRI_BIN[lower] + TRI_BIN[upper]; }
  function hexInfo(bin) {
    var H = root.XJHexagrams;
    if (!H) return null;
    for (var k in H) if (H[k].binary === bin) return H[k];
    return null;
  }
  function nameOf(lower, upper) {
    var h = hexInfo(binOf(lower, upper));
    if (h) return (h.no ? '第' + h.no + '卦 · ' : '') + (h.full || h.name);
    if (lower === upper) return PURE_NAMES[lower];
    return upper + '上' + lower + '下';
  }

  /* 十不用：取个位；个位为零则用十位（十→一、二十→二、三十→三） */
  function reduceNum(n) { var d = n % 10; return d === 0 ? Math.floor(n / 10) : d; }

  /* 三元：1864 上元、1924 中元、1984 下元，周而复始 */
  function sanyuan(year) {
    var c = ((year - 1864) % 180 + 180) % 180;
    return c < 60 ? '上元' : c < 120 ? '中元' : '下元';
  }

  function analyze(opt) {
    var f = opt.four || C.fourPillars(opt.date, { ziRule: opt.ziRule });
    var gender = opt.gender === '女' ? '女' : '男';
    var cols = [f.year, f.month, f.day, f.hour];
    var heavenly = 0, earthly = 0, detail = [];
    cols.forEach(function (p, i) {
      var gn = GAN_NUM[p.gan], zn = ZHI_NUM[p.zhi];
      var gOdd = gn % 2 === 1, zOdd = zn % 2 === 1;
      if (gOdd) heavenly += gn; else earthly += gn;
      if (zOdd) heavenly += zn; else earthly += zn;
      detail.push({ col: ['年', '月', '日', '时'][i], gz: p.gan + p.zhi, gan: p.gan, ganNum: gn, ganOdd: gOdd, zhi: p.zhi, zhiNum: zn, zhiOdd: zOdd });
    });

    var hRem = heavenly % 25 || 25;
    var eRem = earthly % 30 || 30;
    var hDigit = reduceNum(hRem), eDigit = reduceNum(eRem);

    var yangYear = GAN.indexOf(f.year.gan) % 2 === 0;
    var yangMing = yangYear;
    var yangNan = yangMing && gender === '男';
    var yuan = sanyuan(opt.year || (opt.date ? opt.date.getFullYear() : new Date().getFullYear()));

    /* 遇五寄宫 */
    var jiGongNote = '';
    function guaOf(digit) {
      if (digit !== 5) return NUM2GUA[digit] || '乾';
      var g;
      if (yuan === '上元') g = gender === '男' ? '艮' : '坤';
      else if (yuan === '下元') g = gender === '男' ? '离' : '兑';
      else g = yangNan ? '艮' : '坤';
      jiGongNote = '数得五，为寄宫数；' + yuan + (yuan === '中元' ? (yangNan ? '阳男' : '阴男/阳女') : '') + '生人，寄' + g + '卦。';
      return g;
    }
    var tianGua = guaOf(hDigit);
    var diGua = guaOf(eDigit);

    var tianOut = (yangMing && gender === '男') || (!yangMing && gender === '女');
    var lower = tianOut ? diGua : tianGua;
    var upper = tianOut ? tianGua : diGua;
    var xiantian = { lower: lower, upper: upper, bin: binOf(lower, upper), name: nameOf(lower, upper) };

    /* 后天卦：六爻俱变，内外互移 */
    var flipped = xiantian.bin.split('').map(function (b) { return b === '1' ? '0' : '1'; }).join('');
    var fLower = bin2tri(flipped.slice(0, 3)), fUpper = bin2tri(flipped.slice(3));
    var houtian = { lower: fUpper, upper: fLower, bin: binOf(fUpper, fLower), name: nameOf(fUpper, fLower) };

    /* 元堂（简法） */
    var hourIdx = ZHI.indexOf(f.hour.zhi);
    var isYangHour = hourIdx < 6;
    var bits = xiantian.bin.split('');
    var pool = [];
    bits.forEach(function (b, i) { if ((b === '1') === isYangHour) pool.push(i); });
    var pick = pool.length ? pool[hourIdx % pool.length] : 0;
    var yuantang = { pos: pick + 1, yang: bits[pick] === '1', name: yaoName(pick, bits[pick] === '1'), simplified: true };

    var hState = heavenly === 25 ? '中和' : heavenly < 25 ? '不及' : '太过';
    var eState = earthly === 30 ? '中和' : earthly < 30 ? '不及' : '太过';
    var verdict, level, classic;
    if (hState === '中和' && eState === '中和') {
      verdict = '天地二数俱合中数，为富贵上命，一生逢凶化吉'; level = 5;
      classic = '「天数二十五、地数三十，名中和，主富贵上命，虽无化工元气，卦名爻辞不美，亦主逢凶化吉。」';
    } else if (hState === '不及' && eState === '不及') {
      verdict = '天地俱虚，主孤贫寿促，纵有才名亦多蹇滞'; level = 1;
      classic = '「天数不及二十五、地数不及三十，名天地俱虚，下命。纵有化工元气、卦名爻辞佳美，取功名必早，孤寿促，职位亦不能尊显。」';
    } else if (hState === '太过' && eState === '太过') {
      verdict = '二气混杂，纵有富贵亦多凶险'; level = 2;
      classic = '「天地二数俱太过，名二气混杂，纵有富贵亦必险恶之徒。」';
    } else if (hState === '中和' || eState === '中和') {
      verdict = '一数合中，一数' + (hState === '中和' ? eState : hState) + '，中人之命，吉凶相参，宜守分而进'; level = 3;
      classic = '「中和自宁，富贵上命；偏胜偏负，未免有疵。」';
    } else {
      verdict = '一盈一虚，阴阳偏胜，宜知进退、守分安命'; level = 2;
      classic = '「天数太过而地数不足，名以强凌弱、以尊凌卑；地数太过而天数不足，名以下犯上。」';
    }

    var reasons = [];
    reasons.push('天数（阳数）计 <b>' + heavenly + '</b>' + (heavenly > 25 ? '，去二十五正数余 ' + hRem : '，不足二十五，即用其数') + '，十不用取 <b>' + hDigit + '</b>，得<b>' + tianGua + '卦</b>（' + TRI_WX[tianGua] + '）。');
    reasons.push('地数（阴数）计 <b>' + earthly + '</b>' + (earthly > 30 ? '，去三十正数余 ' + eRem : '，不足三十，即用其数') + '，十不用取 <b>' + eDigit + '</b>，得<b>' + diGua + '卦</b>（' + TRI_WX[diGua] + '）。');
    reasons.push('年干<b>' + f.year.gan + '</b>为' + (yangMing ? '阳' : '阴') + '命，' + gender + '命，' +
      (tianOut ? '天数卦在外居上、地数卦在内居下' : '天数卦在内居下、地数卦在外居上') + '，合成先天卦<b>' + xiantian.name + '</b>。');
    reasons.push('先天六爻俱变、内外互移，得后天卦<b>' + houtian.name + '</b>，主中晚年之变。（' + yuan + '生人' + (jiGongNote ? '；' + jiGongNote : '') + '）');
    reasons.push('生时<b>' + f.hour.zhi + '时</b>属' + (isYangHour ? '阳' : '阴') + '，元堂（身宫）取' + (isYangHour ? '阳爻' : '阴爻') + '，落<b>' + yuantang.name + '</b>（简法）。');
    reasons.push('天数' + hState + '二十五、地数' + eState + '三十，' + verdict + '。');

    return {
      four: f, gender: gender, heavenly: heavenly, earthly: earthly, hRem: hRem, eRem: eRem,
      hDigit: hDigit, eDigit: eDigit, tianGua: tianGua, diGua: diGua, tianOut: tianOut,
      xiantian: xiantian, houtian: houtian, yuantang: yuantang,
      hState: hState, eState: eState, verdict: verdict, level: level, classic: classic,
      detail: detail, reasons: reasons, yuan: yuan, jiGongNote: jiGongNote,
      xianInfo: hexInfo(xiantian.bin), houInfo: hexInfo(houtian.bin)
    };
  }

  function bin2tri(b) { for (var k in TRI_BIN) if (TRI_BIN[k] === b) return k; return '乾'; }
  function yaoName(idx, yang) {
    var num = ['初', '二', '三', '四', '五', '上'][idx];
    var yy = yang ? '九' : '六';
    if (idx === 0) return '初' + yy;
    if (idx === 5) return '上' + yy;
    return yy + num;
  }

  var API = {
    GAN_NUM: GAN_NUM, ZHI_NUM: ZHI_NUM, NUM2GUA: NUM2GUA, TRI_WX: TRI_WX,
    analyze: analyze, reduceNum: reduceNum, nameOf: nameOf, sanyuan: sanyuan
  };
  root.XJHeluo = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
}(typeof window !== 'undefined' ? window : this));
