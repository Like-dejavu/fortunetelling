/* ============================================================
   紫微斗数  window.XJZiwei
   依据：《紫微斗数全书》安星诀（命身宫、五行局、紫微星系、天府星系、四化、大限）
   说明：主星亮度（庙旺利陷）古表版本歧异，此处置而不论，
        改以「星曜五行 × 宫位五行」生克断得地与否，属推演而非原表。
   ============================================================ */
(function (root) {
  'use strict';
  var C = root.XJCalendar;
  var GAN = C.GAN, ZHI = C.ZHI;
  var SHENG = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  var KE = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };

  var GONG_NAMES = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '交友', '官禄', '田宅', '福德', '父母'];

  /* 十四主星五行 */
  var STAR_WX = {
    '紫微': '土', '天机': '木', '太阳': '火', '武曲': '金', '天同': '水', '廉贞': '火',
    '天府': '土', '太阴': '水', '贪狼': '木', '巨门': '水', '天相': '水', '天梁': '土', '七杀': '金', '破军': '水'
  };
  var STAR_DESC = {
    '紫微': '帝星，主尊贵、统御、孤高',
    '天机': '智慧之星，主机变、谋略、多思',
    '太阳': '中天主星，主光明、博爱、显扬',
    '武曲': '财星，主刚毅、执行、金属',
    '天同': '福星，主安逸、温和、享受',
    '廉贞': '囚星，主才艺、次桃花、刚烈',
    '天府': '库星，主保守、积蓄、稳健',
    '太阴': '月星，主柔顺、内敛、田宅',
    '贪狼': '桃花之星，主欲望、才艺、交际',
    '巨门': '暗星，主口舌、探究、是非',
    '天相': '印星，主辅佐、公正、服饰',
    '天梁': '荫星，主庇护、老成、清高',
    '七杀': '将星，主肃杀、开创、独断',
    '破军': '耗星，主破旧、变动、冲锋'
  };
  var FU_WX = { '左辅': '土', '右弼': '水', '文昌': '金', '文曲': '水', '禄存': '土', '擎羊': '金', '陀罗': '金', '天魁': '火', '天钺': '火', '天马': '火', '火星': '火', '铃星': '火', '地空': '火', '地劫': '火' };

  /* 四化表：年干 → [禄, 权, 科, 忌] */
  var SIHUA = {
    '甲': ['廉贞', '破军', '武曲', '太阳'],
    '乙': ['天机', '天梁', '紫微', '太阴'],
    '丙': ['天同', '天机', '文昌', '廉贞'],
    '丁': ['太阴', '天同', '天机', '巨门'],
    '戊': ['贪狼', '太阴', '右弼', '天机'],
    '己': ['武曲', '贪狼', '天梁', '文曲'],
    '庚': ['太阳', '武曲', '太阴', '天同'],
    '辛': ['巨门', '太阳', '文曲', '文昌'],
    '壬': ['天梁', '紫微', '左辅', '武曲'],
    '癸': ['破军', '巨门', '太阴', '贪狼']
  };

  /* 命主 / 身主（按年支） */
  var MING_ZHU = { '子': '贪狼', '丑': '巨门', '寅': '禄存', '卯': '文曲', '辰': '廉贞', '巳': '武曲', '午': '破军', '未': '武曲', '申': '廉贞', '酉': '文曲', '戌': '禄存', '亥': '巨门' };
  var SHEN_ZHU = { '子': '火星', '丑': '天相', '寅': '天梁', '卯': '天同', '辰': '文昌', '巳': '天机', '午': '火星', '未': '天相', '申': '天梁', '酉': '天同', '戌': '文昌', '亥': '天机' };

  var JU = { '水': 2, '木': 3, '金': 4, '土': 5, '火': 6 };
  var JU_NAME = { 2: '水二局', 3: '木三局', 4: '金四局', 5: '土五局', 6: '火六局' };
  var JU_DESC = {
    2: '水二局，智巧灵动，宜流动、贸易、文教之途',
    3: '木三局，仁厚进取，宜生发、教育、医药之途',
    4: '金四局，刚毅果决，宜法度、军政、技术之途',
    5: '土五局，厚重稳健，宜田产、建设、实务之途',
    6: '火六局，明敏急进，宜文教、声名、能源之途'
  };

  /* 五虎遁：年干 → 寅宫天干 */
  var YIN_GAN = { '甲': '丙', '己': '丙', '乙': '戊', '庚': '戊', '丙': '庚', '辛': '庚', '丁': '壬', '壬': '壬', '戊': '甲', '癸': '甲' };

  function gongGan(yearGan, zhiIdx) {
    var yin = GAN.indexOf(YIN_GAN[yearGan]);
    var d = (zhiIdx - 2 + 12) % 12;
    return GAN[(yin + d) % 10];
  }

  /* 元数据：农历输入 */
  function resolveInput(opt) {
    var ly, lm, ld, isLeap = !!opt.isLeap, hourZhiIdx;
    if (opt.ly) {
      ly = +opt.ly; lm = +opt.lm; ld = +opt.ld;
    } else {
      if (!root.XJLunar) throw new Error('需要农历换算模块');
      var L = root.XJLunar.solarToLunar(opt.date.getFullYear(), opt.date.getMonth() + 1, opt.date.getDate());
      ly = L.ly; lm = L.lm; ld = L.ld; isLeap = L.isLeap;
    }
    hourZhiIdx = opt.hourZhiIdx;
    if (hourZhiIdx === undefined) {
      var h = opt.date ? opt.date.getHours() : 0;
      hourZhiIdx = Math.floor(((h + 1) % 24) / 2);
    }
    return { ly: ly, lm: lm, ld: ld, isLeap: isLeap, hourZhiIdx: hourZhiIdx };
  }

  function ganzhiYearByLunar(ly) {
    var idx = ((ly - 4) % 60 + 60) % 60;
    return { gan: GAN[idx % 10], zhi: ZHI[idx % 12], text: GAN[idx % 10] + ZHI[idx % 12] };
  }

  /* 安紫微星：日数 ÷ 局数，商起寅宫顺数，余数偶顺奇逆 */
  function ziweiPos(day, ju) {
    var q = Math.ceil(day / ju);
    var r = q * ju - day;          // 0 .. ju-1
    var pos = 2 + (q - 1);          // 寅宫起一
    pos = ((pos % 12) + 12) % 12;
    if (r !== 0) {
      if (r % 2 === 0) pos = (pos + r) % 12;
      else pos = ((pos - r) % 12 + 12) % 12;
    }
    return pos;
  }

  function analyze(opt) {
    var inp = resolveInput(opt);
    var gender = opt.gender === '女' ? '女' : '男';
    var yearGZ = ganzhiYearByLunar(inp.ly);
    var yearGan = yearGZ.gan, yearZhi = yearGZ.zhi;
    var m = inp.lm, d = inp.ld, h = inp.hourZhiIdx;

    /* 命宫、身宫 */
    var ming = ((2 + (m - 1) - h) % 12 + 12) % 12;
    var shen = ((2 + (m - 1) + h) % 12 + 12) % 12;

    /* 五行局：命宫纳音 */
    var mzhi = ZHI[ming], mgan = gongGan(yearGan, ming);
    var nayin = C.nayin(mgan + mzhi);
    var juWx = nayin.charAt(nayin.length - 1) === '火' ? '火' : (nayin.indexOf('水') >= 0 ? '水' : nayin.indexOf('木') >= 0 ? '木' : nayin.indexOf('金') >= 0 ? '金' : nayin.indexOf('土') >= 0 ? '土' : '土');
    var ju = JU[juWx];

    /* 紫微、天府 */
    var zw = ziweiPos(d, ju);
    var tf = ((4 - zw) % 12 + 12) % 12;

    /* 十四主星位置 */
    var pos14 = {};
    pos14['紫微'] = zw;
    pos14['天机'] = ((zw - 1) % 12 + 12) % 12;
    pos14['太阳'] = ((zw - 3) % 12 + 12) % 12;
    pos14['武曲'] = ((zw - 4) % 12 + 12) % 12;
    pos14['天同'] = ((zw - 5) % 12 + 12) % 12;
    pos14['廉贞'] = ((zw - 8) % 12 + 12) % 12;
    pos14['天府'] = tf;
    pos14['太阴'] = (tf + 1) % 12;
    pos14['贪狼'] = (tf + 2) % 12;
    pos14['巨门'] = (tf + 3) % 12;
    pos14['天相'] = (tf + 4) % 12;
    pos14['天梁'] = (tf + 5) % 12;
    pos14['七杀'] = (tf + 6) % 12;
    pos14['破军'] = (tf + 10) % 12;

    /* 辅星 */
    var fu = {};
    function put(name, idx) { if (!fu[idx]) fu[idx] = []; fu[idx].push(name); }
    put('左辅', (4 + (m - 1)) % 12);              // 辰起正月顺行
    put('右弼', ((10 - (m - 1)) % 12 + 12) % 12);  // 戌起正月逆行
    put('文昌', ((10 - h) % 12 + 12) % 12);        // 戌起子时逆行
    put('文曲', (4 + h) % 12);                     // 辰起子时顺行
    var lu = { '甲': 2, '乙': 3, '丙': 5, '丁': 6, '戊': 5, '己': 6, '庚': 8, '辛': 9, '壬': 11, '癸': 0 }[yearGan];
    put('禄存', lu);
    put('擎羊', (lu + 1) % 12);
    put('陀罗', ((lu - 1) % 12 + 12) % 12);
    var kui = { '甲': 1, '乙': 0, '丙': 11, '丁': 11, '戊': 1, '己': 0, '庚': 1, '辛': 6, '壬': 3, '癸': 3 }[yearGan];
    var yue = { '甲': 7, '乙': 8, '丙': 9, '丁': 9, '戊': 7, '己': 8, '庚': 7, '辛': 2, '壬': 5, '癸': 5 }[yearGan];
    put('天魁', kui); put('天钺', yue);
    var maMap = { '寅': 8, '午': 8, '戌': 8, '申': 2, '子': 2, '辰': 2, '巳': 11, '酉': 11, '丑': 11, '亥': 5, '卯': 5, '未': 5 };
    put('天马', maMap[yearZhi]);

    /* 四化 */
    var sh = SIHUA[yearGan];
    var sihuaOf = {};   // 星名 → 禄/权/科/忌
    ['禄', '权', '科', '忌'].forEach(function (t, i) { sihuaOf[sh[i]] = t; });

    /* 十二宫 */
    var gongs = [];
    for (var i = 0; i < 12; i++) {
      var zhi = ZHI[i];
      gongs.push({
        idx: i, zhi: zhi, gan: gongGan(yearGan, i),
        wx: C.wuxingOfZhi(zhi),
        name: null, stars: [], fu: fu[i] ? fu[i].slice() : [], sihua: {}
      });
    }
    /* 命宫起，逆行排十二宫 */
    for (var k = 0; k < 12; k++) {
      gongs[((ming - k) % 12 + 12) % 12].name = GONG_NAMES[k];
    }
    /* 安主星 */
    for (var st in pos14) {
      var gi = pos14[st];
      gongs[gi].stars.push({ name: st, wx: STAR_WX[st], desc: STAR_DESC[st] });
    }
    /* 四化落在星上 */
    Object.keys(pos14).forEach(function (st) {
      if (sihuaOf[st]) gongs[pos14[st]].sihua[st] = sihuaOf[st];
    });
    Object.keys(fu).forEach(function (gi) {
      (fu[gi] || []).forEach(function (st) {
        if (sihuaOf[st]) gongs[+gi].sihua[st] = sihuaOf[st];
      });
    });
    /* 星曜得地：星曜五行 与 宫地支五行 生克 */
    gongs.forEach(function (g) {
      g.stars.forEach(function (s) {
        if (s.wx === g.wx) s.de = '比和（得地，气类相投）';
        else if (SHENG[g.wx] === s.wx) s.de = '宫生星（得地，有滋养）';
        else if (SHENG[s.wx] === g.wx) s.de = '星生宫（泄气，劳而少功）';
        else if (KE[g.wx] === s.wx) s.de = '宫克星（受制，力有未逮）';
        else s.de = '星克宫（得势，然易躁进）';
      });
    });

    /* 三方四正 */
    var mingGong = gongs[ming];
    var sanfang = [ming, (ming + 4) % 12, (ming + 8) % 12, (ming + 6) % 12];

    /* 大限：阳男阴女顺行，阴男阳女逆行 */
    var yangYear = GAN.indexOf(yearGan) % 2 === 0;
    var forward = (yangYear && gender === '男') || (!yangYear && gender === '女');
    var dayun = [];
    var startAge = ju;
    for (var s2 = 0; s2 < 12; s2++) {
      var gi2 = forward ? (ming + s2) % 12 : ((ming - s2) % 12 + 12) % 12;
      dayun.push({
        gong: gongs[gi2].name, zhi: ZHI[gi2], gan: gongs[gi2].gan,
        from: startAge + s2 * 10, to: startAge + s2 * 10 + 9,
        stars: gongs[gi2].stars.map(function (x) { return x.name; })
      });
    }

    return {
      input: inp, gender: gender, yearGZ: yearGZ, ju: ju, juName: JU_NAME[ju],
      nayin: nayin, ming: ming, shen: shen, mingGong: mingGong, shenGong: gongs[shen],
      ziweiPos: zw, tianfuPos: tf, gongs: gongs, sanfang: sanfang,
      mingZhu: MING_ZHU[mzhi], shenZhu: SHEN_ZHU[yearZhi],
      sihua: { gan: yearGan, list: sh, map: sihuaOf },
      dayun: dayun, forward: forward, juzhu: JU_DESC[ju],
      hourZhi: ZHI[h],
      lunar: { ly: inp.ly, lm: inp.lm, ld: inp.ld, isLeap: inp.isLeap }
    };
  }

  var API = {
    GONG_NAMES: GONG_NAMES, STAR_WX: STAR_WX, STAR_DESC: STAR_DESC, SIHUA: SIHUA, FU_WX: FU_WX,
    JU_NAME: JU_NAME, analyze: analyze, ziweiPos: ziweiPos, gongGan: gongGan
  };
  root.XJZiwei = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
}(typeof window !== 'undefined' ? window : this));
