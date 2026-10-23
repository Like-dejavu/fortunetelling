/*!
 * lunar.js — 农历换算模块 v1.0.0
 * 纯静态：ES5 语法、无 import/export、无任何外部依赖，file:// 直接可用。
 * 挂载：window.XJLunar
 * 范围：公历 1900-01-31 ~ 2100-12-31（农历 1900 年正月初一 ~ 2100 年十二月）
 *
 * 数据来源（仅取其中的 lunarInfo 压缩表，共 201 项，1900~2100）：
 *   https://cdn.jsdelivr.net/gh/jjonline/calendar.js/calendar.js
 *   https://github.com/jjonline/calendar.js
 * 表结构：低 4 位 = 闰月月份（0 表示无闰）；bit4~bit15 = 正月~十二月是否大月
 *        （1 = 30 天，0 = 29 天，正月对应 bit15，十二月对应 bit4）；
 *        bit16 = 闰月是否 30 天（1 = 30 天，0 = 29 天，仅在该年有闰月时有效）。
 *
 * 约定：
 *   - 月份 1~12 一律指农历月序（正月=1 … 十二月=12），不是 JS 的 0 基月份。
 *   - solarToLunar() 超出范围时返回 { outOfRange: true, error: '...' }；
 *     lunarToSolar() 超出范围/参数非法时返回 null；小工具函数越界返回 0 或 ''。
 *   - lunarToSolar() 返回本地时区、当天 00:00 的 Date。
 *   - 节气不在本模块处理（站内另有 calendar.js 负责）。
 */
(function (root) {
  'use strict';

  /* ------------------------------------------------------------------ *
   * 基础常量
   * ------------------------------------------------------------------ */

  var VERSION = '1.0.0';
  var MIN_YEAR = 1900;
  var MAX_YEAR = 2100;

  var MS_PER_DAY = 86400000;

  var GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  var ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  var SHENGXIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

  // 正月 … 十二月（腊月 = 十二月，见 MONTH_ALIAS）
  var MONTH_NAMES = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
  var MONTH_ALIAS = { 11: '冬月', 12: '腊月' };

  var DAY_NAMES = [
    '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
  ];

  // 农历年压缩表（1900~2100，共 201 项）
  var LUNAR_INFO = [
    0x4bd8, 0x4ae0, 0xa570, 0x54d5, 0xd260, 0xd950, 0x16554, 0x56a0, 0x9ad0, 0x55d2, // 1900-1909
    0x4ae0, 0xa5b6, 0xa4d0, 0xd250, 0x1d255, 0xb540, 0xd6a0, 0xada2, 0x95b0, 0x14977, // 1910-1919
    0x4970, 0xa4b0, 0xb4b5, 0x6a50, 0x6d40, 0x1ab54, 0x2b60, 0x9570, 0x52f2, 0x4970, // 1920-1929
    0x6566, 0xd4a0, 0xea50, 0x16a95, 0x5ad0, 0x2b60, 0x186e3, 0x92e0, 0x1c8d7, 0xc950, // 1930-1939
    0xd4a0, 0x1d8a6, 0xb550, 0x56a0, 0x1a5b4, 0x25d0, 0x92d0, 0xd2b2, 0xa950, 0xb557, // 1940-1949
    0x6ca0, 0xb550, 0x15355, 0x4da0, 0xa5b0, 0x14573, 0x52b0, 0xa9a8, 0xe950, 0x6aa0, // 1950-1959
    0xaea6, 0xab50, 0x4b60, 0xaae4, 0xa570, 0x5260, 0xf263, 0xd950, 0x5b57, 0x56a0, // 1960-1969
    0x96d0, 0x4dd5, 0x4ad0, 0xa4d0, 0xd4d4, 0xd250, 0xd558, 0xb540, 0xb6a0, 0x195a6, // 1970-1979
    0x95b0, 0x49b0, 0xa974, 0xa4b0, 0xb27a, 0x6a50, 0x6d40, 0xaf46, 0xab60, 0x9570, // 1980-1989
    0x4af5, 0x4970, 0x64b0, 0x74a3, 0xea50, 0x6b58, 0x5ac0, 0xab60, 0x96d5, 0x92e0, // 1990-1999
    0xc960, 0xd954, 0xd4a0, 0xda50, 0x7552, 0x56a0, 0xabb7, 0x25d0, 0x92d0, 0xcab5, // 2000-2009
    0xa950, 0xb4a0, 0xbaa4, 0xad50, 0x55d9, 0x4ba0, 0xa5b0, 0x15176, 0x52b0, 0xa930, // 2010-2019
    0x7954, 0x6aa0, 0xad50, 0x5b52, 0x4b60, 0xa6e6, 0xa4e0, 0xd260, 0xea65, 0xd530, // 2020-2029
    0x5aa0, 0x76a3, 0x96d0, 0x4afb, 0x4ad0, 0xa4d0, 0x1d0b6, 0xd250, 0xd520, 0xdd45, // 2030-2039
    0xb5a0, 0x56d0, 0x55b2, 0x49b0, 0xa577, 0xa4b0, 0xaa50, 0x1b255, 0x6d20, 0xada0, // 2040-2049
    0x14b63, 0x9370, 0x49f8, 0x4970, 0x64b0, 0x168a6, 0xea50, 0x6b20, 0x1a6c4, 0xaae0, // 2050-2059
    0x92e0, 0xd2e3, 0xc960, 0xd557, 0xd4a0, 0xda50, 0x5d55, 0x56a0, 0xa6d0, 0x55d4, // 2060-2069
    0x52d0, 0xa9b8, 0xa950, 0xb4a0, 0xb6a6, 0xad50, 0x55a0, 0xaba4, 0xa5b0, 0x52b0, // 2070-2079
    0xb273, 0x6930, 0x7337, 0x6aa0, 0xad50, 0x14b55, 0x4b60, 0xa570, 0x54e4, 0xd160, // 2080-2089
    0xe968, 0xd520, 0xdaa0, 0x16aa6, 0x56d0, 0x4ae0, 0xa9d4, 0xa2d0, 0xd150, 0xf252, // 2090-2099
    0xd520 // 2100
  ];

  /* ------------------------------------------------------------------ *
   * 内部工具
   * ------------------------------------------------------------------ */

  function isInt(n) {
    return typeof n === 'number' && isFinite(n) && Math.floor(n) === n;
  }

  // 取某农历年的压缩值；越界返回 null
  function infoOf(ly) {
    if (!isInt(ly) || ly < MIN_YEAR || ly > MAX_YEAR) return null;
    return LUNAR_INFO[ly - MIN_YEAR];
  }

  // 用「本地 12:00」构造 Date，再按日历字段取整数日序，彻底避开夏令时/时区偏移
  function dayNo(y, m, d) {
    var dt = new Date(y, m - 1, d, 12, 0, 0, 0);
    return Math.floor(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()) / MS_PER_DAY);
  }

  var BASE_DAY_NO = dayNo(1900, 1, 31);   // 农历 1900 年正月初一
  var MAX_DAY_NO = dayNo(2100, 12, 31);   // 支持的公历最后一天

  function outOfRange(msg) {
    return {
      outOfRange: true,
      error: msg,
      ly: null, lm: null, ld: null, isLeap: false,
      yearGan: '', yearZhi: '', yearShengxiao: '',
      monthName: '', dayName: '', text: '', textLong: ''
    };
  }

  // 该年闰月天数：有闰月返回 29/30，无闰月返回 0
  function leapDays(ly) {
    var info = infoOf(ly);
    if (info === null) return 0;
    if ((info & 0xf) === 0) return 0;
    return (info & 0x10000) ? 30 : 29;
  }

  // 该年按顺序排列的月表：{ m, leap, days }
  function monthList(ly) {
    var info = infoOf(ly);
    var list = [];
    var leap = info & 0xf;
    var i, days;
    for (i = 1; i <= 12; i++) {
      days = (info & (0x10000 >> i)) ? 30 : 29;
      list.push({ m: i, leap: false, days: days });
      if (leap === i) {
        list.push({ m: i, leap: true, days: (info & 0x10000) ? 30 : 29 });
      }
    }
    return list;
  }

  /* ------------------------------------------------------------------ *
   * 公开 API
   * ------------------------------------------------------------------ */

  // 农历年干支（以正月初一为界，故只用农历年号即可）
  // 1900 → 庚子，1984 → 甲子，2024 → 甲辰
  function ganzhiYear(ly) {
    var n = isInt(ly) ? ly : MIN_YEAR;
    var gi = ((n - 4) % 10 + 10) % 10;
    var zi = ((n - 4) % 12 + 12) % 12;
    return { gan: GAN[gi], zhi: ZHI[zi], text: GAN[gi] + ZHI[zi] };
  }

  function dayName(ld) {
    if (!isInt(ld) || ld < 1 || ld > 30) return '';
    return DAY_NAMES[ld - 1];
  }

  function monthName(lm, isLeap) {
    if (!isInt(lm) || lm < 1 || lm > 12) return '';
    return (isLeap ? '闰' : '') + MONTH_NAMES[lm - 1] + '月';
  }

  function leapMonth(ly) {
    var info = infoOf(ly);
    if (info === null) return 0;
    return info & 0xf;                     // 0 表示该年无闰月
  }

  function monthDays(ly, lm, isLeap) {
    var info = infoOf(ly);
    if (info === null) return 0;
    if (!isInt(lm) || lm < 1 || lm > 12) return 0;
    if (isLeap) {
      if ((info & 0xf) !== lm) return 0;   // 该年没有这个闰月
      return (info & 0x10000) ? 30 : 29;
    }
    return (info & (0x10000 >> lm)) ? 30 : 29;
  }

  function yearDays(ly) {
    var info = infoOf(ly);
    if (info === null) return 0;
    var total = 0;
    var i;
    for (i = 1; i <= 12; i++) {
      total += (info & (0x10000 >> i)) ? 30 : 29;
    }
    if (info & 0xf) total += leapDays(ly);
    return total;
  }

  function info() {
    return { minYear: MIN_YEAR, maxYear: MAX_YEAR, version: VERSION };
  }

  // 公历 → 农历
  function solarToLunar(y, m, d) {
    // 允许直接传 Date
    if (Object.prototype.toString.call(y) === '[object Date]') {
      if (isNaN(y.getTime())) return outOfRange('无效的 Date 对象');
      m = y.getMonth() + 1;
      d = y.getDate();
      y = y.getFullYear();
    }

    if (!isInt(y) || !isInt(m) || !isInt(d)) {
      return outOfRange('公历年月日必须是整数');
    }
    if (m < 1 || m > 12) return outOfRange('公历月份必须在 1~12 之间');

    // 校验该公历日期真实存在（挡掉 2 月 30 日之类）
    var probe = new Date(y, m - 1, d, 12, 0, 0, 0);
    if (probe.getFullYear() !== y || probe.getMonth() !== m - 1 || probe.getDate() !== d) {
      return outOfRange('公历日期不存在：' + y + '-' + m + '-' + d);
    }

    var target = dayNo(y, m, d);
    if (target < BASE_DAY_NO || target > MAX_DAY_NO) {
      return outOfRange('公历日期超出支持范围：1900-01-31 ~ 2100-12-31');
    }

    var offset = target - BASE_DAY_NO;   // 距 1900 年正月初一的天数（0 起）

    // 1) 定位农历年
    var ly = MIN_YEAR;
    var remain = offset;
    while (true) {
      var yd = yearDays(ly);
      if (remain < yd) break;
      remain -= yd;
      ly++;
      if (ly > MAX_YEAR) return outOfRange('农历年超出支持范围：1900 ~ 2100');
    }

    // 2) 定位农历月（含闰月）
    var months = monthList(ly);
    var lm = 1;
    var ld = 1;
    var isLeap = false;
    var i;
    for (i = 0; i < months.length; i++) {
      if (remain < months[i].days) {
        lm = months[i].m;
        isLeap = months[i].leap;
        ld = remain + 1;
        break;
      }
      remain -= months[i].days;
    }

    var gz = ganzhiYear(ly);
    var zi = ((ly - 4) % 12 + 12) % 12;
    var mn = monthName(lm, isLeap);
    var dn = dayName(ld);

    return {
      ly: ly,
      lm: lm,
      ld: ld,
      isLeap: isLeap,
      yearGan: gz.gan,
      yearZhi: gz.zhi,
      yearShengxiao: SHENGXIAO[zi],
      monthName: mn,
      dayName: dn,
      text: gz.text + '年' + mn + dn,
      textLong: '农历' + gz.text + '年' + mn + dn,
      outOfRange: false
    };
  }

  // 农历 → 公历（本地时区、当天 00:00 的 Date）
  function lunarToSolar(ly, lm, ld, isLeap) {
    if (!isInt(ly) || !isInt(lm) || !isInt(ld)) return null;
    if (ly < MIN_YEAR || ly > MAX_YEAR) return null;
    if (lm < 1 || lm > 12) return null;

    var info = infoOf(ly);
    var leap = info & 0xf;
    var lp = !!isLeap;

    if (lp && leap !== lm) return null;                       // 该年没有这个闰月
    var days = lp
      ? ((info & 0x10000) ? 30 : 29)
      : ((info & (0x10000 >> lm)) ? 30 : 29);
    if (ld < 1 || ld > days) return null;                     // 该月没有这一天

    var offset = ld - 1;
    var y;
    for (y = MIN_YEAR; y < ly; y++) offset += yearDays(y);

    var months = monthList(ly);
    var i;
    for (i = 0; i < months.length; i++) {
      if (months[i].m === lm && months[i].leap === lp) break;
      offset += months[i].days;
    }
    if (i >= months.length) return null;

    var base = new Date(1900, 0, 31, 12, 0, 0, 0);            // 本地 12:00 起算
    base.setDate(base.getDate() + offset);
    return new Date(base.getFullYear(), base.getMonth(), base.getDate());
  }

  /* ------------------------------------------------------------------ *
   * 导出
   * ------------------------------------------------------------------ */

  var API = {
    version: VERSION,
    minYear: MIN_YEAR,
    maxYear: MAX_YEAR,
    lunarInfo: LUNAR_INFO.slice(0),   // 只读副本，便于自查/调试
    monthAlias: MONTH_ALIAS,

    solarToLunar: solarToLunar,
    lunarToSolar: lunarToSolar,
    leapMonth: leapMonth,
    monthDays: monthDays,
    yearDays: yearDays,
    ganzhiYear: ganzhiYear,
    dayName: dayName,
    monthName: monthName,
    info: info
  };

  if (root) root.XJLunar = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : this);
