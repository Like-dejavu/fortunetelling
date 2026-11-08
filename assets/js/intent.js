/* ============================================================
   玄鉴 · 问句解析内核  window.XJIntent
   把一句自然语言，判成「去哪个功能页 + 带什么参数」。
   无 DOM 依赖，可在 Node 下直接 require 测试。
   ============================================================ */
(function (root) {
  'use strict';
  var I = {};

  /* ---------------- 十二功能 ---------------- */
  var FN = [
    {
      id: 'huangli', name: '黄历吉凶', gl: '吉', group: '历日',
      ds: '建除十二神 · 宜忌 · 冲煞', kws: '黄历 宜忌 吉日 择日 建除 冲煞',
      keys: ['黄历', '老黄历', '皇历', '万年历', '宜忌', '黄道', '黑道', '建除', '冲煞', '彭祖', '吉日', '择日', '看日子', '好日子', '今日干支', '今天日子', '日子的宜忌'],
      phrases: [/(今天|今日|明天|后天|这|那).{0,6}(宜|忌|吉|凶|日子|黄历)/, /(宜|忌).{0,3}(嫁娶|出行|开市|动土|安葬|祭祀)/, /(择|选|挑).{0,4}(吉日|好日子|日子)/],
      sample: '明天宜嫁娶吗', desc: '查某日干支宜忌，或择一事求吉日'
    },
    {
      id: 'bazi', name: '四柱八字', gl: '命', group: '命数',
      ds: '子平八字 · 五行旺衰 · 用神', kws: '八字 四柱 生辰 排盘 用神',
      keys: ['八字', '四柱', '子平', '排八字', '排盘', '生辰八字', '命盘', '用神', '十神', '大运', '流年', '五行', '日主', '格局', '纳音', '出生', '生于', '生日'],
      phrases: [/(\d{4}).{0,12}(出生|生人|生的|生日)/, /(算|看|排|批).{0,3}(八字|命|四柱)/, /(男|女).{0,6}(八字|命盘)/],
      sample: '1990年6月17日 10:30 男，排八字', desc: '输入生辰，排四柱、论旺衰用神'
    },
    {
      id: 'ziwei', name: '紫微斗数', gl: '斗', group: '命数',
      ds: '紫微安星 · 十二宫 · 四化', kws: '紫微 命宫 十二宫 四化',
      keys: ['紫微', '紫薇', '斗数', '命宫', '身宫', '十二宫', '四化', '安星', '主星', '大限', '天府'],
      phrases: [/(紫微|紫薇).{0,4}(盘|命|斗数)/, /(排|看|算).{0,3}紫微/],
      sample: '1990年6月17日辰时女，排紫微盘', desc: '按生辰安命身十二宫与十四主星'
    },
    {
      id: 'heluo', name: '河洛理数', gl: '洛', group: '命数',
      ds: '河洛真数 · 天地二数成卦', kws: '河洛 天地二数 元堂',
      keys: ['河洛', '河图', '洛书', '理数', '天地二数', '元堂', '先天卦', '后天卦', '真数'],
      phrases: [/(河洛|河图洛书).{0,4}(数|卦|理)/],
      sample: '河洛理数 1990年6月17日 10:30 男', desc: '以干支化数，起先后天二卦'
    },
    {
      id: 'liuyao', name: '六爻纳甲', gl: '卦', group: '卜筮',
      ds: '京房纳甲 · 世应六亲 · 动变', kws: '六爻 摇卦 铜钱 纳甲',
      keys: ['六爻', '纳甲', '京房', '摇卦', '铜钱', '世应', '六亲', '六神', '动爻', '变爻', '旬空', '伏神', '起卦', '卜卦', '占一卦'],
      phrases: [/(摇|起|占|卜).{0,3}(一卦|六爻|卦)/, /(帮我|替我).{0,4}摇/, /(铜钱|三枚钱)/],
      sample: '帮我摇一卦，问求财', desc: '三钱成卦，装纳甲世应而断'
    },
    {
      id: 'meihua', name: '梅花易数', gl: '梅', group: '卜筮',
      ds: '体用互变 · 先天起卦', kws: '梅花 体用 数字起卦 互卦',
      keys: ['梅花易数', '梅花', '邵雍', '邵康节', '观梅', '体用', '互卦', '变卦', '先天数', '数字起卦', '报数起卦', '时间起卦'],
      phrases: [/(梅花|邵雍|邵康节).{0,4}(易|卦|数)/, /(\d+).{0,3}(和|与|、|,|，).{0,3}(\d+).{0,4}(起卦|成卦|梅花)/, /(以|用).{0,3}(数字|数).{0,3}起卦/],
      sample: '用 3 和 8 起一卦，问谋事', desc: '时间或数字起卦，论体用生克'
    },
    {
      id: 'dream', name: '周公解梦', gl: '梦', group: '象纬',
      ds: '382 条梦象 · 吉凶歌诀', kws: '解梦 梦见 梦象 周公',
      keys: ['周公解梦', '解梦', '梦象', '梦见', '梦到', '做梦', '夜里梦', '梦兆', '梦吉凶', '梦'],
      phrases: [/(梦见|梦到|做梦|夜里梦|昨夜梦|昨晚梦)/, /(解|查|算).{0,3}梦/],
      sample: '我昨晚梦见一条蛇', desc: '检索梦象条目与吉凶歌诀'
    },
    {
      id: 'palm', name: '手相', gl: '掌', group: '相法',
      ds: '三才纹 · 五行手 · 掌丘', kws: '手相 掌纹 生命线 感情线',
      keys: ['手相', '掌纹', '手掌', '手形', '三才纹', '天纹', '人纹', '地纹', '感情线', '智慧线', '生命线', '掌丘', '掌色', '看手'],
      phrases: [/(看|相|算).{0,3}(手|掌)/],
      sample: '看看我的手相', desc: '择手形与三才纹，参掌丘掌色'
    },
    {
      id: 'face', name: '面相', gl: '相', group: '相法',
      ds: '三停五岳 · 五官十二宫', kws: '面相 五官 三停 气色',
      keys: ['面相', '五官', '三停', '五岳', '十二宫', '气色', '神骨', '冰鉴', '麻衣', '眉眼', '鼻相', '看面'],
      phrases: [/(看|相|算).{0,3}(面|脸|五官)/],
      sample: '面相里鼻子主什么', desc: '择三停五官，参气色与十二宫'
    },
    {
      id: 'daodejing', name: '道德经', gl: '道', group: '典籍',
      ds: '八十一章全文 · 义理索引', kws: '道德经 老子 第几章 上善若水',
      keys: ['道德经', '老子', '五千言', '王弼', '八十一章', '上善若水', '道可道', '无为'],
      phrases: [/第.{1,4}章/, /(道德经|老子).{0,6}(全文|原文|章|句|说)/],
      sample: '道德经第八章 / 上善若水', desc: '读八十一章经文，或按句检索'
    },
    {
      id: 'about', name: '依据', gl: '据', group: '典籍',
      ds: '典籍出处 · 三道工序 · 限度', kws: '依据 出处 典籍 准不准',
      keys: ['依据', '出处', '典籍', '引文', '准不准', '可信', '算法', '原理', '怎么算', '来源', '限度', '关于本站'],
      phrases: [/(依据|出处|根据).{0,4}(是什么|在哪|何书)/, /(准|可信|靠谱)不/],
      sample: '这些推算的依据是什么', desc: '查全部典籍出处与诚实边界'
    },
    {
      id: 'mine', name: '我的页面', gl: '我', group: '本站',
      ds: '查询记录 · 重放 · 导出', kws: '我的 历史 记录 足迹 查过',
      keys: ['我的页面', '查询记录', '查询历史', '历史记录', '浏览记录', '搜过的', '查过的', '算过的', '以前查', '之前算', '足迹', '清空记录', '我的'],
      phrases: [/(查过|算过|搜过|看过).{0,6}(什么|哪些|记录)/, /(我的|查看|打开).{0,4}(记录|历史|页面)/, /清空.{0,3}记录/],
      sample: '我之前查过什么', desc: '回看、重放、导出本机查询记录'
    }
  ];

  /* 强语义规则：命中即大幅加权 */
  var RULES = [
    { re: /梦见|梦到|做梦|昨夜梦|昨晚梦|夜里梦|解梦|梦象/, id: 'dream', w: 18 },
    { re: /黄历|宜忌|吉日|择日|老黄历|日子好/, id: 'huangli', w: 15 },
    { re: /八字|四柱|子平|生辰八字|排盘|用神|大运/, id: 'bazi', w: 15 },
    { re: /紫微|紫薇|斗数|命宫|安星/, id: 'ziwei', w: 15 },
    { re: /河洛|河图|洛书|天地二数|元堂/, id: 'heluo', w: 15 },
    { re: /六爻|纳甲|京房|摇卦|摇一卦|帮我摇|铜钱|世应|六亲/, id: 'liuyao', w: 15 },
    { re: /梅花|邵雍|邵康节|体用|互卦|数字起卦|报数/, id: 'meihua', w: 15 },
    { re: /手相|掌纹|感情线|生命线|智慧线|三才纹/, id: 'palm', w: 15 },
    { re: /面相|五官|三停|冰鉴|麻衣/, id: 'face', w: 15 },
    { re: /道德经|老子|第.{1,4}章|上善若水|道可道/, id: 'daodejing', w: 15 },
    { re: /依据|出处|典籍|引用|准不准|怎么算出来的/, id: 'about', w: 13 },
    { re: /我的页面|查询记录|查询历史|历史记录|清空记录|之前查过|以前查过|查过什么/, id: 'mine', w: 16 }
  ];

  /* 择日事项（与黄历页 ITEMS 同步） */
  var ITEMS = ['嫁娶', '出行', '开市', '动土', '安葬', '祭祀', '修造', '纳财', '上任', '求医', '栽种', '入学'];

  /* 《道德经》常见名句 → 章节 */
  var VERSES = [
    [/道可道|非常道|无名天地之始/, 1], [/天下皆知美之为美|有无相生/, 2],
    [/上善若水|水利万物/, 8], [/功遂身退|持而盈之/, 9], [/五色令人目盲/, 12],
    [/致虚极|知常曰明|归根曰静/, 16], [/太上|下知有之/, 17], [/大道废|有仁义/, 18],
    [/见素抱朴|绝圣弃智/, 19], [/孔德之容|惟道是从/, 21], [/曲则全|枉则直/, 22],
    [/人法地|道法自然/, 25], [/重为轻根|静为躁君/, 26], [/知其雄|守其雌|知白守黑/, 28],
    [/兵者不祥之器/, 31], [/知人者智|自知者明|自胜者强/, 33], [/将欲歙之|柔弱胜刚强/, 36],
    [/上德不德|是以有德/, 38], [/反者道之动|弱者道之用/, 40], [/大方无隅|大器晚成|大音希声/, 41],
    [/道生一|一生二|二生三/, 42], [/知足不辱|知止不殆/, 44], [/大成若缺|大巧若拙|清静为天下正/, 45],
    [/不出户|知天下/, 47], [/为学日益|为道日损|无为而无不为/, 48], [/圣人无常心/, 49],
    [/含德之厚|比于赤子/, 55], [/知者不言|和光同尘/, 56], [/以正治国|我无为而民自化/, 57],
    [/祸兮福之所倚|福兮祸之所伏/, 58], [/治大国若烹小鲜/, 60], [/治人事天|莫若啬/, 59],
    [/为无为|图难于其易|千里之行始于足下/, 63], [/合抱之木|生于毫末|慎终如始/, 64],
    [/江海所以能为百谷王|不争/, 66], [/我有三宝|慈|俭|不敢为天下先/, 67], [/善为士者不武/, 68],
    [/知我者希|被褐怀玉/, 70], [/知不知|圣人不病/, 71], [/民不畏威/, 72], [/民不畏死/, 74],
    [/天网恢恢|疏而不失/, 73], [/人之生也柔弱|柔弱者生之徒/, 76], [/天之道|损有余而补不足/, 77],
    [/天下莫柔弱于水|柔之胜刚/, 78], [/和大怨|天道无亲/, 79], [/小国寡民|鸡犬之声相闻/, 80],
    [/信言不美|美言不信|圣人不积|为而不争/, 81]
  ];
  VERSES = VERSES.filter(function (v) { return typeof v[1] === 'number'; });

  I.functions = FN;
  I.items = ITEMS;

  /* ---------------- 小工具 ---------------- */
  function trim(s) { return String(s == null ? '' : s).replace(/^\s+|\s+$/g, ''); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dstr(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function cnNum(s) {
    if (/^\d+$/.test(s)) return parseInt(s, 10);
    var D = { '零': 0, '〇': 0, '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9 };
    if (D[s] !== undefined) return D[s];
    var ten = s.indexOf('十');
    if (ten >= 0) {
      var a = ten === 0 ? 1 : (D[s.charAt(0)] || 0);
      var b = s.length > ten + 1 ? (D[s.charAt(ten + 1)] || 0) : 0;
      return a * 10 + b;
    }
    var n = 0, ok = true;
    for (var i = 0; i < s.length; i++) { if (D[s.charAt(i)] === undefined) { ok = false; break; } n = n * 10 + D[s.charAt(i)]; }
    return ok ? n : 0;
  }
  function zhiIdxOfHour(h) { return h === 23 || h === 0 ? 0 : Math.floor((h + 1) / 2) % 12; }

  /* ---------------- 实体抽取 ---------------- */
  function extract(text) {
    var E = { raw: text }, m, i;

    /* 日期 */
    var today = new Date();
    if (/后天/.test(text)) {
      var d2 = new Date(today.getTime() + 2 * 864e5); E.date = dstr(d2); E.dateWhy = '后天';
    } else if (/明天|明日|次日/.test(text)) {
      var d1 = new Date(today.getTime() + 864e5); E.date = dstr(d1); E.dateWhy = '明天';
    } else if (/今天|今日|本日|当日/.test(text)) {
      E.date = dstr(today); E.dateWhy = '今天';
    }
    m = /(\d{4})\s*[-/.年]\s*(\d{1,2})\s*[-/.月]\s*(\d{1,2})/.exec(text);
    if (m) {
      E.date = m[1] + '-' + pad(+m[2]) + '-' + pad(+m[3]);
      E.dateWhy = m[1] + '年' + m[2] + '月' + m[3] + '日';
    } else if (!E.date) {
      m = /(\d{1,2})\s*月\s*(\d{1,2})\s*[日号]/.exec(text);
      if (m) { E.date = today.getFullYear() + '-' + pad(+m[1]) + '-' + pad(+m[2]); E.dateWhy = m[1] + '月' + m[2] + '日'; }
    }

    /* 时刻 */
    m = /(上午|早上|早晨|凌晨|中午|下午|傍晚|晚上|夜里|夜间)?\s*(\d{1,2})\s*[:：点時时]\s*(\d{1,2}|半)?\s*分?/.exec(text);
    if (m && !/\d{4}\s*[-/.年]/.test(m[0])) {
      var h = parseInt(m[2], 10), mi = m[3] === '半' ? 30 : (parseInt(m[3], 10) || 0);
      var period = m[1] || '';
      if (/下午|傍晚|晚上|夜里|夜间/.test(period) && h < 12) h += 12;
      if (/中午/.test(period) && h < 11) h += 12;
      if (/上午|早上|早晨|凌晨/.test(period) && h === 12) h = 0;
      if (h <= 23 && mi <= 59) { E.time = pad(h) + ':' + pad(mi); E.hour = h; E.timeWhy = (period || '') + m[2] + (m[3] ? (m[3] === '半' ? '点半' : ':' + m[3]) : '点'); }
    }
    if (!E.time) {
      m = /(子|丑|寅|卯|辰|巳|午|未|申|酉|戌|亥)\s*时/.exec(text);
      if (m) {
        var zh = '子丑寅卯辰巳午未申酉戌亥'.indexOf(m[1]);
        E.hourIdx = zh; E.hour = zh === 0 ? 23 : zh * 2 - 1;
        E.time = pad(E.hour) + ':30'; E.timeWhy = m[1] + '时';
      }
    }
    if (E.hour != null && E.hourIdx == null) E.hourIdx = zhiIdxOfHour(E.hour);

    /* 性别 */
    m = /(?:^|[^男女])(男|女)(?:生|孩|性|士|子)?/.exec(text);
    if (m) { E.gender = m[1]; E.genderWhy = m[1]; }

    /* 择日事项 */
    for (i = 0; i < ITEMS.length; i++) if (text.indexOf(ITEMS[i]) >= 0) { E.item = ITEMS[i]; E.itemWhy = ITEMS[i]; break; }

    /* 所问之事 */
    m = /(?:问|占|测|算一算|算算|看看|我想知道)\s*([^，。！？、；;,!?\s]{1,10})/.exec(text);
    if (m) {
      E.q = trim(m[1]).replace(/(吗|呢|吧|啊|如何|怎么样|怎样|吉凶|好不好)$/g, '');
      if (E.q) E.qWhy = E.q;
    }

    /* 章号 / 名句 */
    m = /第\s*([零〇一二两三四五六七八九十百\d]{1,4})\s*章/.exec(text);
    if (m) { var c = cnNum(m[1]); if (c >= 1 && c <= 81) { E.chapter = c; E.chapterWhy = '第' + c + '章'; } }
    if (!E.chapter) {
      for (i = 0; i < VERSES.length; i++) if (VERSES[i][0].test(text)) { E.chapter = VERSES[i][1]; E.chapterWhy = '「' + (text.match(VERSES[i][0]) || [''])[0] + '」'; break; }
    }
    var dq = text.replace(/道德经|老子|王弼本|全文|原文|经文|查|看|检索|搜|给我|帮我|请问|第\s*[零〇一二两三四五六七八九十百\d]{1,4}\s*章|的|吗|呢|啊|吧|\s/g, '');
    if (dq.length >= 2 && dq.length <= 12) E.ddQuery = dq;

    /* 数字起卦：先剔除日期与时分，免得把生辰当成卦数 */
    var pureNums = /^\s*\d{1,4}\s*(?:和|与|、|,|，|\+|加|\s)\s*\d{1,4}\s*$/.test(text);
    if (/数字起卦|报数|两个数|以数起卦|用数起卦|数字卦|起一?卦|成卦|梅花/.test(text) || pureNums) {
      var body = text
        .replace(/(\d{4})\s*[-/.年]\s*(\d{1,2})\s*[-/.月]\s*(\d{1,2})\s*日?/g, ' ')
        .replace(/(\d{1,2})\s*月\s*(\d{1,2})\s*[日号]/g, ' ')
        .replace(/\d{1,2}\s*[:：]\s*\d{1,2}/g, ' ');
      m = /(\d{1,4})\s*(?:和|与|、|,|，|\+|加|及|\s)\s*(\d{1,4})/.exec(body);
      if (m) { E.n1 = parseInt(m[1], 10); E.n2 = parseInt(m[2], 10); E.numWhy = m[1] + '、' + m[2]; }
      else {
        var ns = body.match(/\d{1,4}/g) || [];
        if (ns.length >= 2) { E.n1 = parseInt(ns[0], 10); E.n2 = parseInt(ns[1], 10); E.numWhy = E.n1 + '、' + E.n2; }
      }
    }

    /* 摇卦 */
    if (/摇一卦|摇卦|代为摇|帮我摇|替我摇|随机起卦|自动起卦/.test(text)) E.cast = 1;

    /* 梦象：优先用站内 863 个关键词反查，取最长命中 */
    var cats = root && root.XJDreams;
    if (cats && cats.length) {
      var best = '', seen = {};
      for (i = 0; i < cats.length; i++) {
        var items = cats[i].items || [];
        for (var j = 0; j < items.length; j++) {
          var ks = items[j].k || [];
          for (var k = 0; k < ks.length; k++) {
            var key = trim(ks[k]);
            if (key.length < 1 || key.length > 8 || seen[key]) continue;
            seen[key] = 1;
            if (text.indexOf(key) >= 0 && key.length > best.length) best = key;
          }
        }
      }
      if (best) E.dreamTerm = best;
    }
    if (!E.dreamTerm) {
      m = /(?:梦见|梦到|梦见了|梦到了|做梦梦见|昨夜梦见|昨晚梦见)\s*([^，。！？、；;,!?\s]{1,8})/.exec(text);
      if (m) E.dreamTerm = trim(m[1]).replace(/^(一条|一只|一个|一群|好多|很多|了)/, '').replace(/(了|的)$/, '');
    }
    if (E.dreamTerm) E.dreamWhy = '「' + E.dreamTerm + '」';

    return E;
  }

  /* ---------------- 打分 ---------------- */
  function score(text, f) {
    var s = 0, hit = [], i;
    var t = trim(text);
    if (t === f.name || t === f.id || (f.keys[0] && t === f.keys[0])) s += 24;
    if (t.indexOf(f.name) >= 0) s += 18;
    for (i = 0; i < f.keys.length; i++) {
      if (t.indexOf(f.keys[i]) >= 0) { s += (f.keys[i].length >= 4 ? 9 : 7); if (hit.length < 3) hit.push(f.keys[i]); }
    }
    for (i = 0; i < f.phrases.length; i++) if (f.phrases[i].test(t)) s += 11;
    for (i = 0; i < RULES.length; i++) if (RULES[i].id === f.id && RULES[i].re.test(t)) s += RULES[i].w;
    return { s: s, hit: hit };
  }

  /* ---------------- 参数装配 ---------------- */
  function build(f, E) {
    var p = {}, arg = '', why = [];
    if (E.date) { p.date = E.date; why.push('日期 ' + E.dateWhy); }
    if (E.time) { p.time = E.time; why.push('时刻 ' + E.timeWhy); }
    if (E.gender) { p.gender = E.gender; why.push('性别 ' + E.genderWhy); }
    if (E.hourIdx != null) p.hourIdx = E.hourIdx;

    switch (f.id) {
      case 'huangli':
        if (E.date) p.from = E.date;
        if (E.item) { p.item = E.item; why.push('所行之事 ' + E.itemWhy); }
        break;
      case 'bazi':
        delete p.hourIdx;
        break;
      case 'ziwei':
        p.hour = E.hourIdx != null ? E.hourIdx : 5;
        delete p.hourIdx; delete p.time;
        break;
      case 'heluo':
        delete p.hourIdx;
        break;
      case 'liuyao':
        if (E.q) { p.q = E.q; why.push('所问 ' + E.qWhy); }
        if (E.cast) { p.cast = 1; why.push('代为摇卦'); }
        delete p.gender; delete p.time; delete p.hourIdx;
        break;
      case 'meihua':
        if (E.n1 != null) {
          p.mode = 'num'; p.n1 = E.n1; p.n2 = E.n2; delete p.date; delete p.time;
          why.push('数字 ' + E.numWhy);
        } else {
          p.mode = 'time';
          if (E.hourIdx != null) p.hour = E.hourIdx;
        }
        if (E.q) p.q = E.q;
        delete p.gender; delete p.hourIdx;
        break;
      case 'dream':
        arg = E.dreamTerm || '';
        p = {};
        if (arg) { p.q = arg; why = ['梦象 ' + E.dreamWhy]; }
        else why = [];
        break;
      case 'daodejing':
        arg = E.chapter ? String(E.chapter) : '';
        p = {};
        if (E.chapter) why = ['定位到 ' + E.chapterWhy];
        else if (E.ddQuery) { p.q = E.ddQuery; why = ['检索「' + E.ddQuery + '」']; }
        break;
      case 'palm':
      case 'face':
      case 'about':
      case 'mine':
      case 'home':
        p = {}; why = [];
        break;
    }
    return { params: p, arg: arg, why: why };
  }

  function queryOf(params) {
    var out = [];
    Object.keys(params).forEach(function (k) {
      var v = params[k];
      if (v === '' || v == null) return;
      out.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
    });
    return out.join('&');
  }

  I.queryOf = queryOf;

  I.hashFor = function (r) {
    var s = '#/' + r.id + (r.arg ? '/' + encodeURIComponent(r.arg) : '');
    var q = queryOf(r.params || {});
    return s + (q ? '?' + q : '');
  };

  /* ---------------- 主入口 ---------------- */
  I.parse = function (input) {
    var text = trim(input);
    var E = extract(text);
    var results = [];
    if (text) {
      FN.forEach(function (f) {
        var sc = score(text, f);
        /* 不因「零关键词」提前丢弃：结构化实体（数字、梦象、章号）本身即可立意图 */
        var b = build(f, E);
        var r = {
          id: f.id, name: f.name, gl: f.gl, group: f.group, ds: f.ds,
          score: sc.s, hit: sc.hit, why: b.why,
          arg: b.arg, params: b.params
        };
        /* 结构化实体本身也是意图证据：比零散关键词更可靠 */
        if (E.n1 != null) {
          if (f.id === 'meihua') r.score += 24;
          if (f.id === 'liuyao') r.score -= 6;
          if (f.id === 'bazi') r.score -= 4;
        }
        if (E.cast && f.id === 'liuyao') r.score += 22;
        if (E.dreamTerm && /梦见|梦到|做梦|昨夜|昨晚/.test(text)) {
          if (f.id === 'dream') r.score += 14;
        }
        if (E.chapter && f.id === 'daodejing') r.score += 14;
        if (E.item && /宜|忌|吉日|择日|黄历|日子/.test(text) && f.id === 'huangli') r.score += 10;
        if (f.id === 'bazi' && E.date && (E.time || E.gender)) r.score += 8;
        if (f.id === 'huangli' && E.item) r.score += 6;
        if (f.id === 'daodejing' && E.chapter) r.score += 6;
        if (f.id === 'meihua' && E.n1 != null) r.score += 8;
        r.hash = I.hashFor(r);
        results.push(r);
      });

      results.sort(function (a, b) { return b.score - a.score; });
      results = results.filter(function (r) { return r.score > 0; }).slice(0, 6);

      /* 短句兜底：两三个字、无其他意图，且站内梦象库能查到，就当梦象检索 */
      if (!results.length && E.dreamTerm && text.length <= 6) {
        var f0 = null;
        FN.forEach(function (f) { if (f.id === 'dream') f0 = f; });
        var b0 = build(f0, E);
        var r0 = {
          id: 'dream', name: f0.name, gl: f0.gl, group: f0.group, ds: f0.ds,
          score: 16, hit: [], why: ['按梦象检索「' + E.dreamTerm + '」'],
          arg: b0.arg, params: b0.params
        };
        r0.hash = I.hashFor(r0);
        results.push(r0);
      }
    }
    return {
      text: text,
      entities: E,
      results: results,
      best: (results.length && results[0].score >= 12) ? results[0] : null,
      functions: FN
    };
  };

  /* 快捷问法 */
  I.examples = [
    '我昨晚梦见一条蛇',
    '1990年6月17日 10:30 男，排八字',
    '明天宜嫁娶吗',
    '帮我摇一卦，问求财',
    '用 3 和 8 起一卦，问谋事',
    '我之前查过什么',
    '道德经第八章',
    '上善若水',
    '这些推算的依据是什么'
  ];

  root.XJIntent = I;
  if (typeof module !== 'undefined' && module.exports) module.exports = I;
}(typeof window !== 'undefined' ? window : this));
