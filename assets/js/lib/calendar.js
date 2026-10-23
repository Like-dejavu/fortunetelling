/* =====================================================================
 * 玄鉴 · 历法内核  calendar.js
 * 儒略日 / 二十四节气（太阳视黄经解算）/ 年月日时四柱 / 纳音 / 建除 /
 * 彭祖百忌 / 冲煞 / 真太阳时
 * 说明：节气采用 Meeus《天文算法》太阳视黄经低精度解算（±0.01°），
 *       并计入 ΔT 改正，节气时刻误差约数分钟，已在界面注明。
 * ===================================================================== */
(function (root) {
  'use strict';

  var GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  var ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  var SHENGXIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  var WUXING_GAN = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
  var WUXING_ZHI = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];
  var YINYANG_GAN = ['阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴'];
  var YINYANG_ZHI = ['阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴'];

  var NAYIN = ['海中金', '炉中火', '大林木', '路旁土', '剑锋金', '山头火', '涧下水', '城头土',
    '白蜡金', '杨柳木', '泉中水', '屋上土', '霹雳火', '松柏木', '长流水', '沙中金',
    '山下火', '平地木', '壁上土', '金箔金', '覆灯火', '天河水', '大驿土', '钗钏金',
    '桑柘木', '大溪水', '沙中土', '天上火', '石榴木', '大海水'];

  var CANG_GAN = {
    '子': ['癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'], '卯': ['乙'],
    '辰': ['戊', '乙', '癸'], '巳': ['丙', '庚', '戊'], '午': ['丁', '己'],
    '未': ['己', '丁', '乙'], '申': ['庚', '壬', '戊'], '酉': ['辛'],
    '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲']
  };

  var SHICHEN_NAME = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时',
    '未时', '申时', '酉时', '戌时', '亥时'];
  var SHICHEN_RANGE = ['23:00–00:59', '01:00–02:59', '03:00–04:59', '05:00–06:59',
    '07:00–08:59', '09:00–10:59', '11:00–12:59', '13:00–14:59',
    '15:00–16:59', '17:00–18:59', '19:00–20:59', '21:00–22:59'];

  /* 二十四节气：从 小寒 起，黄经每 15° */
  var TERMS = [
    { n: '小寒', lon: 285, m: 1, d: 6 }, { n: '大寒', lon: 300, m: 1, d: 20 },
    { n: '立春', lon: 315, m: 2, d: 4 }, { n: '雨水', lon: 330, m: 2, d: 19 },
    { n: '惊蛰', lon: 345, m: 3, d: 6 }, { n: '春分', lon: 0, m: 3, d: 21 },
    { n: '清明', lon: 15, m: 4, d: 5 }, { n: '谷雨', lon: 30, m: 4, d: 20 },
    { n: '立夏', lon: 45, m: 5, d: 6 }, { n: '小满', lon: 60, m: 5, d: 21 },
    { n: '芒种', lon: 75, m: 6, d: 6 }, { n: '夏至', lon: 90, m: 6, d: 21 },
    { n: '小暑', lon: 105, m: 7, d: 7 }, { n: '大暑', lon: 120, m: 7, d: 23 },
    { n: '立秋', lon: 135, m: 8, d: 8 }, { n: '处暑', lon: 150, m: 8, d: 23 },
    { n: '白露', lon: 165, m: 9, d: 8 }, { n: '秋分', lon: 180, m: 9, d: 23 },
    { n: '寒露', lon: 195, m: 10, d: 8 }, { n: '霜降', lon: 210, m: 10, d: 23 },
    { n: '立冬', lon: 225, m: 11, d: 7 }, { n: '小雪', lon: 240, m: 11, d: 22 },
    { n: '大雪', lon: 255, m: 12, d: 7 }, { n: '冬至', lon: 270, m: 12, d: 22 }
  ];

  /* 十二「节」（月建之界） */
  var JIE = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'];
  var JIE_ZHI = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1];

  var RAD = Math.PI / 180;
  function sin(d) { return Math.sin(d * RAD); }
  function cos(d) { return Math.cos(d * RAD); }

  /* -------- 儒略日 -------- */
  function toJD(y, m, d, h, mi, s) {
    h = h || 0; mi = mi || 0; s = s || 0;
    if (m <= 2) { y -= 1; m += 12; }
    var A = Math.floor(y / 100);
    var B = 2 - A + Math.floor(A / 4);
    var day = d + (h + mi / 60 + s / 3600) / 24;
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
  }
  function dateToJD(dt) { return dt.getTime() / 86400000 + 2440587.5; }
  function jdToDate(jd) { return new Date((jd - 2440587.5) * 86400000); }
  function jdnOf(dt) { return Math.floor(dateToJD(dt) + 0.5); }

  /* -------- ΔT（NASA / Espenak-Meeus 多项式） -------- */
  function deltaT(year) {
    var y = year, t, dt;
    if (y >= 1900 && y < 1920) { t = y - 1900; dt = -2.79 + 1.494119 * t - 0.0598939 * t * t + 0.0061966 * Math.pow(t, 3) - 0.000197 * Math.pow(t, 4); }
    else if (y < 1941) { t = y - 1920; dt = 21.20 + 0.84493 * t - 0.076100 * t * t + 0.0020936 * Math.pow(t, 3); }
    else if (y < 1961) { t = y - 1950; dt = 29.07 + 0.407 * t - t * t / 233 + Math.pow(t, 3) / 2547; }
    else if (y < 1986) { t = y - 1975; dt = 45.45 + 1.067 * t - t * t / 260 - Math.pow(t, 3) / 718; }
    else if (y < 2005) { t = y - 2000; dt = 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * Math.pow(t, 3) + 0.000651814 * Math.pow(t, 4) + 0.00002373599 * Math.pow(t, 5); }
    else if (y < 2050) { t = y - 2000; dt = 62.92 + 0.32217 * t + 0.005589 * t * t; }
    else if (y < 2150) { dt = -20 + 32 * Math.pow((y - 1820) / 100, 2) - 0.5628 * (2150 - y); }
    else { t = (y - 1820) / 100; dt = -20 + 32 * t * t; }
    return dt;
  }

  /* -------- 太阳视黄经（Meeus 25.2–25.10） -------- */
  function sunLon(jde) {
    var T = (jde - 2451545.0) / 36525;
    var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    var M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sin(M)
      + (0.019993 - 0.000101 * T) * sin(2 * M) + 0.000289 * sin(3 * M);
    var omega = 125.04 - 1934.136 * T;
    var lambda = L0 + C - 0.00569 - 0.00478 * sin(omega);
    return ((lambda % 360) + 360) % 360;
  }
  function solveTerm(lonTarget, jdeGuess) {
    var jd = jdeGuess;
    for (var i = 0; i < 30; i++) {
      var lam = sunLon(jd);
      var diff = lonTarget - lam;
      while (diff > 180) diff -= 360;
      while (diff < -180) diff += 360;
      jd += diff / 0.9856473;
      if (Math.abs(diff) < 1e-8) break;
    }
    return jd;
  }

  var termCache = {};
  /* 某年 24 节气（返回按时间排序的 Date 与名称） */
  function solarTerms(year) {
    if (termCache[year]) return termCache[year];
    var out = [];
    for (var i = 0; i < TERMS.length; i++) {
      var T = TERMS[i];
      var jde = solveTerm(T.lon, toJD(year, T.m, T.d, 8));
      var jdUT = jde - deltaT(year) / 86400;
      out.push({ name: T.n, lon: T.lon, date: jdToDate(jdUT), jd: jdUT });
    }
    out.sort(function (a, b) { return a.date - b.date; });
    termCache[year] = out;
    return out;
  }

  /* 出生时刻之前最近的一个「节」 */
  function lastJie(dt) {
    var y = dt.getFullYear(), best = null;
    var pool = [y - 1, y, y + 1];
    for (var k = 0; k < pool.length; k++) {
      var list = solarTerms(pool[k]);
      for (var i = 0; i < list.length; i++) {
        if (JIE.indexOf(list[i].name) < 0) continue;
        if (list[i].date <= dt && (!best || list[i].date > best.date)) best = list[i];
      }
    }
    return best;
  }
  function nextJie(dt) {
    var y = dt.getFullYear(), best = null;
    var pool = [y - 1, y, y + 1];
    for (var k = 0; k < pool.length; k++) {
      var list = solarTerms(pool[k]);
      for (var i = 0; i < list.length; i++) {
        if (JIE.indexOf(list[i].name) < 0) continue;
        if (list[i].date > dt && (!best || list[i].date < best.date)) best = list[i];
      }
    }
    return best;
  }
  function lichun(year) {
    var list = solarTerms(year);
    for (var i = 0; i < list.length; i++) if (list[i].name === '立春') return list[i].date;
    return null;
  }

  /* -------- 四柱 -------- */
  function yearPillar(dt) {
    var y = dt.getFullYear();
    var lc = lichun(y);
    var gy = (dt < lc) ? y - 1 : y;
    var idx = ((gy - 4) % 60 + 60) % 60;
    return { idx: idx, gan: GAN[idx % 10], zhi: ZHI[idx % 12], solarYear: gy };
  }
  function monthPillar(dt, yearGanIdx) {
    var jie = lastJie(dt);
    var zhi = JIE_ZHI[JIE.indexOf(jie.name)];
    /* 五虎遁：甲己之年丙作首 */
    var start = (yearGanIdx % 5) * 2 + 2; // 寅月天干
    var offset = (zhi - 2 + 12) % 12;
    var gan = (start + offset) % 10;
    return { gan: GAN[gan], zhi: ZHI[zhi], jie: jie, ganIdx: gan, zhiIdx: zhi };
  }
  function dayPillar(dt, ziRule) {
    var base = new Date(dt.getTime());
    if (ziRule === '23' && dt.getHours() >= 23) base = new Date(dt.getTime() + 86400000);
    var jdn = jdnOf(base);
    var idx = ((jdn + 49) % 60 + 60) % 60;
    return { idx: idx, gan: GAN[idx % 10], zhi: ZHI[idx % 12], jdn: jdn };
  }
  function hourPillar(dt, dayGanIdx) {
    var h = dt.getHours();
    var zhiIdx = Math.floor(((h + 1) % 24) / 2);
    var gan = ((dayGanIdx % 5) * 2 + zhiIdx) % 10;
    return { gan: GAN[gan], zhi: ZHI[zhiIdx], ganIdx: gan, zhiIdx: zhiIdx };
  }

  function gzIndex(gan, zhi) {
    var g = GAN.indexOf(gan), z = ZHI.indexOf(zhi);
    for (var i = 0; i < 60; i++) if (i % 10 === g && i % 12 === z) return i;
    return 0;
  }
  function nayin(gz) {
    var idx = typeof gz === 'number' ? gz : gzIndex(gz[0], gz[1]);
    return NAYIN[Math.floor(idx / 2)];
  }
  function xunKong(dayIdx) {
    var xun = Math.floor(dayIdx / 10); // 0..5
    var start = xun * 10;
    var kong = [(start + 10) % 12, (start + 11) % 12];
    return [ZHI[kong[0]], ZHI[kong[1]]];
  }
  function gzNaYinOf(idx) { return NAYIN[Math.floor(idx / 2)]; }

  /* -------- 真太阳时 -------- */
  function equationOfTime(dt) {
    /* NOAA 近似，返回分钟（真太阳时 - 平太阳时） */
    var start = new Date(dt.getFullYear(), 0, 0);
    var n = Math.floor((dt - start) / 86400000) + 1;
    var B = 360 * (n - 81) / 364 * RAD;
    return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  }
  function trueSolar(dt, longitude) {
    var diff = (longitude - 120) * 4 + equationOfTime(dt); // 分钟
    return { date: new Date(dt.getTime() + diff * 60000), minutes: diff };
  }

  /* -------- 建除十二神 -------- */
  var JIANCHU = ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭'];
  var JIANCHU_YIJI = {
    '建': { yi: '出行、上任、会友、谒贵、祈福', ji: '动土、开仓、掘井、乘船' },
    '除': { yi: '除服、疗病、扫舍、解除、出行', ji: '求财、开市、嫁娶、签约' },
    '满': { yi: '祭祀、祈福、开市、造仓、纳财', ji: '服药、栽种、赴任、问讼' },
    '平': { yi: '修饰垣墙、平治道涂、整手足甲', ji: '开渠、栽种、乘船、移徙' },
    '定': { yi: '祭祀、订盟、纳采、修造、安床', ji: '诉讼、出行、迁徙' },
    '执': { yi: '捕捉、狩猎、纳畜、结网', ji: '开市、移徙、出财、嫁娶' },
    '破': { yi: '破屋坏垣、求医治病、拆卸', ji: '嫁娶、开市、动土、签约' },
    '危': { yi: '安床、祭祀、祈福、安葬', ji: '登高、行船、出行、冒险' },
    '成': { yi: '嫁娶、开市、入学、动土、交易', ji: '诉讼、词讼' },
    '收': { yi: '纳财、捕捉、进人口、栽种', ji: '开市、出行、安葬、放债' },
    '开': { yi: '祭祀、祈福、开市、出行、入学', ji: '安葬、动土、伐木' },
    '闭': { yi: '筑堤、埋穴、修补、塞穴', ji: '开市、出行、求医、开渠' }
  };
  var HUANGDAO = ['除', '危', '定', '执', '成', '开'];

  function jianchu(monthZhiIdx, dayZhiIdx) {
    var i = ((dayZhiIdx - monthZhiIdx) % 12 + 12) % 12;
    var name = JIANCHU[i];
    return { index: i, name: name, isHuangDao: HUANGDAO.indexOf(name) >= 0, yiji: JIANCHU_YIJI[name] };
  }

  /* -------- 彭祖百忌 -------- */
  var PENGZU_GAN = ['甲不开仓财物耗散', '乙不栽植千株不长', '丙不修灶必见灾殃', '丁不剃头头必生疮',
    '戊不受田田主不祥', '己不破券二比并亡', '庚不经络织机虚张', '辛不合酱主人不尝',
    '壬不汲水更难提防', '癸不词讼理弱敌强'];
  var PENGZU_ZHI = ['子不问卜自惹祸殃', '丑不冠带主不还乡', '寅不祭祀神鬼不尝', '卯不穿井水泉不香',
    '辰不哭泣必主重丧', '巳不远行财物伏藏', '午不苫盖屋主更张', '未不服药毒气入肠',
    '申不安床鬼祟入房', '酉不会客醉坐颠狂', '戌不吃犬作怪上床', '亥不嫁娶不利新郎'];

  /* -------- 冲煞 -------- */
  var SHA_FANG = ['南', '东', '北', '西']; // 申子辰煞南 巳酉丑煞东 寅午戌煞北 亥卯未煞西
  function chongSha(dayZhiIdx) {
    var chong = (dayZhiIdx + 6) % 12;
    var group;
    if ([8, 0, 4].indexOf(dayZhiIdx) >= 0) group = 0;
    else if ([5, 9, 1].indexOf(dayZhiIdx) >= 0) group = 1;
    else if ([2, 6, 10].indexOf(dayZhiIdx) >= 0) group = 2;
    else group = 3;
    return { chongZhi: ZHI[chong], chongShengxiao: SHENGXIAO[chong], sha: SHA_FANG[group] };
  }

  function wuxingOfGan(g) { return WUXING_GAN[GAN.indexOf(g)]; }
  function wuxingOfZhi(z) { return WUXING_ZHI[ZHI.indexOf(z)]; }

  /* -------- 完整四柱 -------- */
  function fourPillars(dt, opt) {
    opt = opt || {};
    var yp = yearPillar(dt);
    var mp = monthPillar(dt, GAN.indexOf(yp.gan));
    var dp = dayPillar(dt, opt.ziRule);
    var hp = hourPillar(dt, GAN.indexOf(dp.gan));
    return {
      year: { gan: yp.gan, zhi: yp.zhi, idx: yp.idx, nayin: gzNaYinOf(yp.idx) },
      month: { gan: mp.gan, zhi: mp.zhi, idx: gzIndex(mp.gan, mp.zhi), nayin: nayin(mp.gan + mp.zhi), jie: mp.jie },
      day: { gan: dp.gan, zhi: dp.zhi, idx: dp.idx, nayin: gzNaYinOf(dp.idx), kong: xunKong(dp.idx) },
      hour: { gan: hp.gan, zhi: hp.zhi, idx: gzIndex(hp.gan, hp.zhi), nayin: nayin(hp.gan + hp.zhi) },
      dt: dt
    };
  }

  function fmtDate(dt) {
    function p(n) { return n < 10 ? '0' + n : '' + n; }
    return dt.getFullYear() + '-' + p(dt.getMonth() + 1) + '-' + p(dt.getDate()) +
      ' ' + p(dt.getHours()) + ':' + p(dt.getMinutes());
  }

  var API = {
    GAN: GAN, ZHI: ZHI, SHENGXIAO: SHENGXIAO, WUXING_GAN: WUXING_GAN, WUXING_ZHI: WUXING_ZHI,
    YINYANG_GAN: YINYANG_GAN, YINYANG_ZHI: YINYANG_ZHI, NAYIN: NAYIN, CANG_GAN: CANG_GAN,
    SHICHEN_NAME: SHICHEN_NAME, SHICHEN_RANGE: SHICHEN_RANGE, TERMS: TERMS, JIANCHU_YIJI: JIANCHU_YIJI,
    toJD: toJD, dateToJD: dateToJD, jdToDate: jdToDate, jdnOf: jdnOf,
    deltaT: deltaT, sunLon: sunLon, solarTerms: solarTerms, lastJie: lastJie, nextJie: nextJie, lichun: lichun,
    yearPillar: yearPillar, monthPillar: monthPillar, dayPillar: dayPillar, hourPillar: hourPillar,
    fourPillars: fourPillars, gzIndex: gzIndex, nayin: nayin, gzNaYinOf: gzNaYinOf, xunKong: xunKong,
    equationOfTime: equationOfTime, trueSolar: trueSolar, jianchu: jianchu, chongSha: chongSha,
    PENGZU_GAN: PENGZU_GAN, PENGZU_ZHI: PENGZU_ZHI,
    wuxingOfGan: wuxingOfGan, wuxingOfZhi: wuxingOfZhi, fmtDate: fmtDate
  };

  root.XJCalendar = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
