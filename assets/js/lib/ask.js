/* 玄鉴 · 问事 · 一事一占的跨模块取象  window.XJAsk
   一句话进来，先解成「事项域 / 问句类型 / 应期 / 所拈之字」，
   再向六爻、梅花、解梦、测字、黄历五处取候，按相关度排序：
   主答一出，余者为参。起卦以此刻为机，不预存答案。 */
(function (root) {
  'use strict';

  var U = root.XJUI || null;

  /* ---------- 文案小件：无 XJUI 时也能在 Node 里跑 ---------- */
  function esc(s) {
    s = (s === null || s === undefined) ? '' : String(s);
    if (U && U.esc) return U.esc(s);
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function card(title, body, tag) {
    if (U && U.card) return U.card(title, body, tag);
    return '<section class="card">' + (title ? '<div class="card-title"><h2>' + title + '</h2>' +
      (tag ? '<span class="tag">' + tag + '</span>' : '') + '</div>' : '') + body + '</section>';
  }
  function quote(text, src) {
    if (U && U.quote) return U.quote(text, src);
    return '<div class="quote">' + text + (src ? '<span class="src">—— ' + src + '</span>' : '') + '</div>';
  }
  function sections(list) {
    if (U && U.sections) return U.sections(list);
    return '<div class="section-list">' + list.map(function (s) {
      return '<div class="section-item"><h3>' + s.title + '</h3><p>' + s.body + '</p>' +
        (s.basis ? '<div class="basis">' + s.basis + '</div>' : '') + '</div>';
    }).join('') + '</div>';
  }
  function hexFigure(bin, mv) { return (U && U.hexFigure) ? U.hexFigure(bin, mv) : '<div class="hex-figure"></div>'; }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function clockStr(d) { return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }
  function dayStr(d) { return (d.getMonth() + 1) + '月' + d.getDate() + '日'; }

  var MOD_NAME = { liuyao: '六爻', meihua: '梅花', dream: '解梦', cezi: '测字', huangli: '黄历' };

  /* ---------- 事项域：以六爻用神为准，兼收口语里最常出现的词 ---------- */
  var DOMAINS = [
    { id: 'career', name: '事业升迁', use: '官鬼 / 父母',
      tags: ['工作', '职业', '职场', '升职', '晋升', '加薪', '跳槽', '离职', '求职', '面试', '录用', '转正', '领导', '上司', '老板', '同事', '事业', '调动', '岗位', '编制', '试用期'],
      lang: '在六爻里属功名之事，以官鬼为用神，看的是职位、上级与名分；父母爻为文书告身，主调令与合同。' },
    { id: 'wealth', name: '求财经营', use: '妻财 / 子孙',
      tags: ['财', '钱', '收入', '工资', '奖金', '生意', '买卖', '经营', '投资', '股', '基金', '回本', '赚', '亏', '债', '欠款', '讨债', '分红', '客户', '订单', '开业', '开张'],
      lang: '在六爻里属求财，以妻财为用神，看财之有无、来处与迟速；子孙为生财之源，兄弟为劫财之忌。' },
    { id: 'love', name: '婚姻感情', use: '妻财 / 官鬼',
      tags: ['婚', '结婚', '婚姻', '嫁', '娶', '感情', '恋爱', '恋', '配偶', '对象', '男友', '女友', '男朋友', '女朋友', '丈夫', '妻子', '复合', '分手', '暗恋', '表白', '相亲', '外遇'],
      lang: '在六爻里属婚姻感情，男以妻财、女以官鬼为用神，看世应之间是否相生相合，又看用神旺衰。' },
    { id: 'exam', name: '考试学业', use: '父母 / 官鬼',
      tags: ['考试', '学业', '升学', '考研', '考公', '考编', '成绩', '录取', '论文', '答辩', '证书', '资格', '复习', '高考', '面试'],
      lang: '在六爻里属功名文书，以父母为用神，看学业之成否；官鬼为名次与主考，子孙为泄气之忌。' },
    { id: 'health', name: '疾病健康', use: '官鬼 / 子孙',
      tags: ['病', '疾病', '生病', '健康', '身体', '手术', '医药', '吃药', '医院', '痊愈', '复查', '体检', '失眠', '疼', '痛', '抑郁', '焦虑', '血压', '胃'],
      lang: '在六爻里属疾病，以官鬼为用神，看症之轻重与去留；子孙为医药，旺则病退。' },
    { id: 'travel', name: '出行迁移', use: '父母 / 世爻',
      tags: ['出行', '旅行', '旅游', '出差', '远行', '搬迁', '出国', '移民', '签证', '机票', '航班', '路上', '旅途', '归期', '返回'],
      lang: '在六爻里属出行，以父母为用神，看舟车之利否；世爻为行者，应爻为所往之地。' },
    { id: 'lawsuit', name: '官讼是非', use: '官鬼 / 父母',
      tags: ['官司', '诉讼', '官非', '纠纷', '仲裁', '律师', '起诉', '被告', '原告', '赔偿', '判决', '胜诉', '败诉', '报警', '立案'],
      lang: '在六爻里属官讼，以官鬼为用神，看是非之曲直；父母为状纸，兄弟为证人。' },
    { id: 'lost', name: '失物寻人', use: '妻财 / 子孙',
      tags: ['失物', '丢', '丢了', '遗失', '找', '找回', '寻', '不见', '找不到', '忘在', '落在', '被偷', '偷', '盗窃', '走失', '失踪'],
      lang: '在六爻里属失物，以妻财为用神，看物之在否与方位；子孙为追寻之力，兄弟为掩藏之蔽。' },
    { id: 'child', name: '孕育子女', use: '子孙 / 父母',
      tags: ['怀孕', '孕', '胎', '生子', '生孩子', '子女', '孩子', '备孕', '生育', '儿子', '女儿', '宝宝'],
      lang: '在六爻里属子嗣，以子孙为用神，看孕育之成否；父母克子孙，为忌。' },
    { id: 'home', name: '田宅家宅', use: '父母 / 二爻',
      tags: ['房', '房子', '宅', '家宅', '搬家', '装修', '租', '租房', '买房', '卖房', '盖房', '入宅', '宅运', '邻居'],
      lang: '在六爻里属家宅，以父母为用神，看宅之安否；世爻为居者，应爻为邻与外界。' },
    { id: 'coop', name: '人际合作', use: '兄弟 / 应爻',
      tags: ['合作', '合伙', '搭档', '朋友', '团队', '签约', '合同', '谈判', '协议', '信任', '小人', '贵人', '股东'],
      lang: '在六爻里属人事，以兄弟为用神，看同侪之向背；应爻为对方，世应生合则合，冲克则离。' },
    { id: 'date', name: '择日行事', use: '建除 / 日辰',
      tags: ['择日', '哪天', '选日', '吉日', '黄道', '定日子', '领证', '办酒', '动土', '开业', '婚礼', '订婚'],
      lang: '问的是日子，先取黄历建除与宜忌为断，六爻则以动爻、用神旺衰定应期。' },
    { id: 'omen', name: '梦象占验', use: '梦象 / 官鬼',
      tags: ['梦', '梦见', '梦到', '梦中', '做梦', '梦象', '托梦', '噩梦', '解梦'],
      lang: '问的是梦象，依《周公解梦》歌诀取象：或象同、或象反、或谐音，梦象为象，所兆为义。' },
    { id: 'cezi', name: '测字决疑', use: '字象 / 笔画',
      tags: ['一字', '测字', '拆字', '字象', '问字'],
      lang: '问的是一个字，正合测字之法：以笔画定数、以部首取象、以增损对关取机。' }
  ];

  var GENERAL = { id: 'general', name: '泛占', use: '妻财',
    tags: [], lang: '所问未落入门类，六爻以妻财为泛占之神，看事之通塞与迟速；象随事转，不专指一物。' };

  var ASK_TYPES = [
    { t: '何解', re: /什么意思|啥意思|何解|含义|象征|代表|预示|征兆|解梦|梦见|梦到|做梦|说明什么|什么兆/ },
    { t: '何时', re: /何时|什么时候|啥时候|哪天|哪一天|几天|多久|几时|何年|何月|何日|哪年|哪个时候/ },
    { t: '能不能', re: /能不能|能否|可不可以|可以吗|行不行|是否|会不会|有没有|成不成|能成|能.{0,6}吗|可.{0,4}成/ },
    { t: '如何', re: /怎么|如何|怎样|该怎么办|怎么办|该不该|要不要|需不需要|值不值/ },
    { t: '吉凶', re: /吉凶|吉否|好不好|顺不顺|顺利|凶吉|好坏|结果/ }
  ];

  /* ---------- 一事一问 ---------- */
  function domainHits(d, raw) {
    var w = 0, hits = [], i;
    for (i = 0; i < d.tags.length; i++) {
      if (raw.indexOf(d.tags[i]) >= 0) { w += d.tags[i].length; hits.push(d.tags[i]); }
    }
    return { w: w, hits: hits };
  }

  function pickChar(raw) {
    var m = raw.match(/[问测]?[一]?字[\s:：是为]*([\u4e00-\u9fa5])/);
    if (m) return m[1];
    var s = raw.replace(/请问|帮我|帮忙|看看|我想|测|拆|问|一字|这个字|该字|此字|的字|字|含义|意思|何解|吉凶|如何|怎么样|什么|一下|吧|呢|吗|啊|呀|。|，|,|？|\?|！|!|、|：|:|「|」|“|”|\s/g, '');
    if (/^[\u4e00-\u9fa5]$/.test(s)) return s;
    return '';
  }

  function understand(q) {
    var raw = String(q === null || q === undefined ? '' : q).replace(/\s+/g, ' ').replace(/^ | $/g, '');
    var i, j, best = null, bestW = 0, bestHits = [], all = [];

    for (i = 0; i < DOMAINS.length; i++) {
      var h = domainHits(DOMAINS[i], raw);
      if (h.w > bestW) { bestW = h.w; best = DOMAINS[i]; bestHits = h.hits; }
      for (j = 0; j < h.hits.length; j++) if (all.indexOf(h.hits[j]) < 0) all.push(h.hits[j]);
    }

    /* 带「梦」字，先入梦象一门 */
    if (/梦/.test(raw)) {
      for (i = 0; i < DOMAINS.length; i++) {
        if (DOMAINS[i].id !== 'omen') continue;
        var ho = domainHits(DOMAINS[i], raw);
        best = DOMAINS[i];
        bestHits = ho.hits.length ? ho.hits : ['梦'];
        break;
      }
    }
    if (!best) { best = GENERAL; bestHits = []; }

    var askType = '吉凶';
    for (i = 0; i < ASK_TYPES.length; i++) {
      if (ASK_TYPES[i].re.test(raw)) { askType = ASK_TYPES[i].t; break; }
    }

    var scope = '';
    if (/今天|今日|今晚|现在|马上|这两天|这几天|最近|这周|本周|下周|这个月|本月|下个月|下月/.test(raw)) scope = '近期';
    else if (/今年|本年|明年|年内|过年/.test(raw)) scope = '今年';
    else if (/长久|将来|以后|一生|长期|多年|晚年/.test(raw)) scope = '长久';

    return {
      raw: raw, domain: best,
      tags: all.slice(0, 6),
      askType: askType,
      timeScope: scope,
      char: pickChar(raw)
    };
  }

  /* ---------- 各模块出一候：只取数据，不在此处加总 ---------- */
  var G_CLASS = { '吉': 'g-ji', '凶': 'g-xiong', '中': 'g-zhong' };

  /* 解梦：词面命中，先整词，再退而取片段 */
  function dreamHits(raw) {
    var D = root.XJDreams;
    if (!D || !D.length) return [];
    var rows = [], seen = [], i, j, k;

    for (i = 0; i < D.length; i++) {
      for (j = 0; j < D[i].items.length; j++) {
        var it = D[i].items[j], best = 0;
        for (k = 0; k < it.k.length; k++) {
          var kw = it.k[k];
          if (kw && raw.indexOf(kw) >= 0) best = Math.max(best, 10 + kw.length * 3);
        }
        if (best) rows.push({ cat: D[i].name, it: it, w: best });
      }
    }

    /* 整词未中，再去「梦」字与虚词，用二字片段碰一碰 */
    if (!rows.length) {
      var core = raw.replace(/梦见|梦到|做梦|梦|昨晚|前天|昨天|今天|最近|总是|老是|我|的|了|是|什么|意思|一下|为什么|怎么会/g, '');
      var frags = [], parts = core.split(/[，,。？?！!、；;：:\s]+/);
      for (i = 0; i < parts.length; i++) {
        var p = parts[i];
        for (j = 0; j + 2 <= p.length; j++) frags.push(p.substr(j, 2));
      }
      for (i = 0; i < D.length; i++) {
        for (j = 0; j < D[i].items.length; j++) {
          var it2 = D[i].items[j], best2 = 0;
          for (k = 0; k < it2.k.length; k++) {
            for (var f = 0; f < frags.length; f++) {
              if (it2.k[k].indexOf(frags[f]) >= 0) best2 = Math.max(best2, 4 + frags[f].length);
            }
          }
          if (best2) rows.push({ cat: D[i].name, it: it2, w: best2 });
        }
      }
    }

    rows.sort(function (a, b) { return b.w - a.w; });
    var out = [];
    for (i = 0; i < rows.length && out.length < 3; i++) {
      if (seen.indexOf(rows[i].it) >= 0) continue;
      seen.push(rows[i].it);
      out.push(rows[i]);
    }
    return out;
  }

  function dreamItemHtml(row) {
    var it = row.it;
    return '<div class="dream-item">' +
      '<div class="dream-head"><b>' + esc(it.k[0]) + '</b>' +
      '<span class="dream-g ' + (G_CLASS[it.g] || '') + '">' + esc(it.g) + '</span>' +
      '<span class="dream-src">' + esc(it.src) + '</span>' +
      '<span class="dream-cat">' + esc(row.cat) + '</span></div>' +
      (it.quote ? '<div class="dream-quote">「' + esc(it.quote) + '」<span class="muted">《周公解梦》通行本</span></div>' : '') +
      '<p class="dream-text">' + esc(it.t) + '</p>' +
      '<div class="dream-keys">' + it.k.map(function (kw) { return '<span>' + esc(kw) + '</span>'; }).join('') + '</div>' +
      '</div>';
  }

  /* 择日之问：问的是「哪一天」，黄历才是正主，六爻梅花退为旁参 */
  var RE_DAY = /哪天|哪一天|几号|哪日|什么日子|吉日|好日子|择日|择吉|挑日子|挑个日子/;
  var RE_TODAY = /今天|今日|明天|明日|后天|今儿|这几日|近几天|这几天/;

  function buildDream(raw, u, now, method) {
    var hits = dreamHits(raw);
    if (!hits.length && u.domain.id !== 'omen') return null;
    var s = u.domain.id === 'omen' ? 72 : 44;
    s += Math.min(14, hits.length * 6);
    if (!hits.length) s -= 16;

    var body = '<p class="small muted">《周公解梦》以象取义：梦象为象，所兆为义，或取同形，或取反义，或取谐音。' +
      '下列所录，皆有本可查，非临文编造。</p>';
    if (hits.length) {
      body += '<div class="dream-list">' + hits.map(dreamItemHtml).join('') + '</div>';
    } else {
      body += '<p class="muted">本站梦象库中未检得与该梦直接对应的条目。可换用更短的词再问，如「牙」「水」「蛇」「血」。</p>';
    }
    body += '<p class="small muted">梦本心神浮游，同一梦象，在古法里也有吉凶两说；此处取其条例，供你自省，不必尽信。</p>';

    var isDream = u.domain.id === 'omen' || /梦/.test(raw);
    return {
      module: 'dream', title: '解梦 · ' + (hits.length ? hits[0].it.k[0] : '梦象未得'),
      score: s, body: body, facts: { hits: hits.length, top: hits.length ? hits[0].it.k[0] : '' },
      rawData: { items: hits.map(function (r) { return r.it; }), cats: hits.map(function (r) { return r.cat; }) },
      why: isDream
        ? '问中带「梦」字，先取《周公解梦》的梦象条例为断；梦象是象，须与所问之事相参。'
        : '所问与梦无关，梦象库只作旁类备参：纵有词面巧合，也不足据以断此事之成败。'
    };
  }

  /* 六爻 */
  function buildLiuyao(q, u, now, method) {
    var L = root.XJLiuyao;
    if (!L || !L.cast || !L.analyze) return null;
    var vals = L.cast();
    var res = L.analyze({ vals: vals, date: now, question: q, ziRule: 'late' });
    if (!res || !res.ben || !res.judge) return null;

    var ben = res.ben, bian = res.bian, j = res.judge, f = res.four || {};
    var movers = [], i;
    for (i = 0; i < ben.yao.length; i++) if (ben.yao[i].moving) movers.push(i + 1);
    var mv = movers.length === 1 ? movers[0] : 0;
    var gz = function (p) { return p ? p.gan + p.zhi : '—'; };

    var h = '<p class="small muted">以此刻起卦，触机而占 · ' + esc(clockStr(now)) + ' · ' +
      esc(gz(f.year) + '年 ' + gz(f.month) + '月 ' + gz(f.day) + '日') +
      ' · 月建' + esc(f.month ? f.month.zhi : '—') + ' 日辰' + esc(f.day ? f.day.zhi : '—') + '</p>';

    h += '<div class="hex-wrap"><div class="center">' + hexFigure(ben.binary, mv) +
      '<div class="small muted">' + esc(ben.name) + '</div></div><dl class="kv">';
    h += '<dt>本卦</dt><dd>' + esc(ben.full) + '（' + esc(ben.palace) + '宫 · ' + esc(ben.gongWx) + '）</dd>';
    h += '<dt>变卦</dt><dd>' + (movers.length ? esc(bian.name) + '（动爻 ' + movers.join('、') + '）' : '无动爻，静卦以本卦断') + '</dd>';
    h += '<dt>世应</dt><dd>世' + ben.shi + '爻 · 应' + ben.ying + '爻</dd>';
    h += '<dt>旬空</dt><dd>' + esc((res.kong || []).join('') || '无') + '</dd>';
    h += '<dt>用神</dt><dd>' + useText(res) + '</dd>';
    h += '</dl></div>';

    if (res.hexBen && res.hexBen.gua) {
      h += quote(esc(res.hexBen.gua), '《周易·' + esc(res.hexBen.name) + '》卦辞');
      if (res.hexBen.xiang) h += quote(esc(res.hexBen.xiang), '《周易·' + esc(res.hexBen.name) + '》大象');
    }

    h += '<p><b>' + esc(j.verdict) + '</b> <span class="small muted">（' + j.score + ' 分 · ' +
      esc(j.q ? j.q.label : '') + '）</span></p>';

    h += '<table class="table yao-table small"><thead><tr><th>六神</th><th>纳甲</th><th>六亲</th><th>世应</th><th>旺衰</th></tr></thead><tbody>';
    for (i = 5; i >= 0; i--) {
      var y = ben.yao[i], mark = [];
      if (y.kong) mark.push('空');
      if (y.yuePo) mark.push('月破');
      if (y.riPo) mark.push('日破');
      h += '<tr><td>' + esc(y.liushen) + '</td><td>' + esc(y.gz) +
        (y.moving ? '<span class="yao-move">动</span>' : '') + '</td><td>' + esc(y.liuqin) + '</td><td>' +
        (y.pos === ben.shi ? '世' : y.pos === ben.ying ? '应' : '') + '</td><td>' +
        esc(mark.join('·') || '—') + '</td></tr>';
    }
    h += '</tbody></table>';

    var secs = [], rs = j.reasons || [];
    for (i = 0; i < rs.length && secs.length < 5; i++) {
      var t = rs[i].text, cut = t.indexOf('，');
      var lead = (cut > 0 && cut <= 18) ? t.slice(0, cut) : t.slice(0, 14);
      secs.push({
        title: (rs[i].d > 0 ? '＋' : rs[i].d < 0 ? '－' : '·') + esc(lead),
        body: esc(t), basis: esc(rs[i].ref || '')
      });
    }
    h += sections(secs);

    var s = 66;
    if (u.askType === '能不能' || u.askType === '吉凶' || u.askType === '何时') s += 6;
    if (u.domain.id === 'omen') s -= 28;
    if (u.domain.id === 'date') s -= 6;
    if (u.domain.id === 'cezi') s -= 14;
    if (method === 'liuyao') s += 16;
    else if (method === 'meihua') s -= 14;
    s += Math.min(8, u.tags.length * 2);
    if (RE_DAY.test(q)) s -= 10;

    return {
      module: 'liuyao',
      title: '六爻 · ' + ben.name + (movers.length ? '之' + bian.name : ''),
      score: s, body: h,
      facts: {
        name: ben.name, bian: bian.name, useType: res.useType, useIdx: res.useIdx,
        score: j.score, level: j.level, verdict: j.verdict, moving: movers,
        monthZhi: f.month ? f.month.zhi : '', dayZhi: f.day ? f.day.zhi : '',
        dayGan: f.day ? f.day.gan : '', vals: vals
      },
      rawData: res,
      why: '所问属' + u.domain.name + '，六爻以' + u.domain.use + '为用神，最宜断成败与迟速；以此刻触机起卦，看世应、月建日辰与动变。'
    };
  }

  function useText(res) {
    if (res.useIdx >= 0 && res.ben.yao[res.useIdx]) {
      var y = res.ben.yao[res.useIdx];
      return esc(res.useType) + ' · 取第' + (res.useIdx + 1) + '爻 ' + esc(y.gz) +
        '（' + esc(y.liuqin) + (y.moving ? '，动' : '，静') + '）';
    }
    if (res.fuShen) {
      return esc(res.useType) + ' 不上卦，伏于第' + res.fuShen.pos + '爻 ' +
        esc(res.fuShen.fei.gz) + ' 之下（伏神 ' + esc(res.fuShen.yao.gz) + '）';
    }
    return esc(res.useType) + ' 不上卦，卦中无可用之爻';
  }

  /* 梅花 */
  function buildMeihua(q, u, now, method) {
    var M = root.XJMeihua;
    if (!M || !M.timeGua || !M.analyze) return null;
    var cast = M.timeGua(now);
    var res = M.analyze(cast, { date: now });
    if (!res || !res.ben) return null;

    var h = '<p class="small muted">以此刻起卦，触机而占 · ' + esc(clockStr(now)) + ' · 年月日时起卦（' +
      esc(res.ben.name) + '）</p>';
    h += '<div class="hex-wrap"><div class="center">' + hexFigure(res.ben.bin, res.moving) +
      '<div class="small muted">' + esc(res.ben.name) + '</div></div><dl class="kv">';
    h += '<dt>本卦</dt><dd>' + esc(res.ben.name) + '</dd>';
    h += '<dt>互卦</dt><dd>' + esc(res.hu.name) + ' <span class="small muted">事之中段</span></dd>';
    h += '<dt>变卦</dt><dd>' + esc(res.bian.name) + '（第' + res.moving + '爻动，事之终局）</dd>';
    h += '<dt>体用</dt><dd>体' + esc(res.ti.tri + res.ti.wx) + ' · 用' + esc(res.yong.tri + res.yong.wx) + ' · ' + esc(res.rel) + '</dd>';
    h += '<dt>月令</dt><dd>' + esc(res.season) + '令 · 体卦' + esc(res.ti.qi.qi) + '、用卦' + esc(res.yong.qi.qi) + '</dd>';
    h += '</dl></div>';

    var bi = res.ben.info;
    if (bi && bi.gua) h += quote(esc(bi.gua), '《周易·' + esc(bi.name) + '》卦辞');

    h += '<p><b>' + esc(res.verdict) + '</b> <span class="small muted">（' + res.score + ' 分 · 体用' +
      esc(res.rel) + '）</span></p>';

    var secs = [], rs = res.reasons || [];
    for (var i = 0; i < rs.length && secs.length < 4; i++) {
      var t = rs[i].text, cut = t.indexOf('，');
      var lead = (cut > 0 && cut <= 18) ? t.slice(0, cut) : t.slice(0, 14);
      secs.push({
        title: (rs[i].d > 0 ? '＋' : rs[i].d < 0 ? '－' : '·') + esc(lead),
        body: esc(t), basis: esc(rs[i].ref || '')
      });
    }
    h += sections(secs);
    h += '<p class="small muted">' + esc(res.qiText) + '</p>';

    var s = 56;
    if (u.askType === '能不能' || u.askType === '吉凶') s += 6;
    if (u.domain.id === 'omen') s -= 24;
    if (u.domain.id === 'cezi') s -= 12;
    if (method === 'meihua') s += 20;
    else if (method === 'liuyao') s -= 12;
    s += Math.min(6, u.tags.length);
    if (RE_DAY.test(q)) s -= 6;

    return {
      module: 'meihua', title: '梅花 · ' + res.ben.name + '之' + res.bian.name,
      score: s, body: h,
      facts: {
        name: res.ben.name, hu: res.hu.name, bian: res.bian.name, rel: res.rel,
        ti: res.ti.tri + res.ti.wx, yong: res.yong.tri + res.yong.wx,
        score: res.score, verdict: res.verdict, moving: res.moving, season: res.season
      },
      rawData: res,
      why: '同一时刻可再起一梅花卦：体为己、用为所问，看两者生克与旺衰，与六爻互为旁证。'
    };
  }

  /* 黄历 */
  function buildHuangli(q, u, now, method) {
    var C = root.XJCalendar;
    if (!C || !C.fourPillars || !C.jianchu || !C.ZHI) return null;

    var f = C.fourPillars(now, { ziRule: 'late' });
    var mIdx = C.ZHI.indexOf(f.month.zhi), dIdx = C.ZHI.indexOf(f.day.zhi);
    var jc = C.jianchu(mIdx, dIdx);
    var cs = C.chongSha(dIdx);
    var gz = function (p) { return p ? p.gan + p.zhi : '—'; };

    var h = '<p class="small muted">今日 · ' + esc(clockStr(now)) + ' · ' +
      esc(gz(f.year) + '年 ' + gz(f.month) + '月 ' + gz(f.day) + '日') + '</p>';
    h += '<dl class="kv">';
    h += '<dt>建除</dt><dd>' + esc(jc.name) + (jc.isHuangDao ? ' · 黄道' : ' · 黑道') + '</dd>';
    h += '<dt>宜</dt><dd class="yi">' + esc(jc.yiji.yi) + '</dd>';
    h += '<dt>忌</dt><dd class="ji">' + esc(jc.yiji.ji) + '</dd>';
    h += '<dt>冲煞</dt><dd>冲' + esc(cs.chongZhi) + '（' + esc(cs.chongShengxiao) + '）· 煞' + esc(cs.sha) + '</dd>';
    var pg = (C.PENGZU_GAN && C.PENGZU_GAN.length) ? C.PENGZU_GAN[C.GAN.indexOf(f.day.gan)] : '';
    var pz = (C.PENGZU_ZHI && C.PENGZU_ZHI.length) ? C.PENGZU_ZHI[dIdx] : '';
    if (pg || pz) h += '<dt>彭祖</dt><dd>' + esc([pg, pz].filter(function (x) { return !!x; }).join('；')) + '</dd>';
    h += '</dl>';

    /* 未来六日一览：择日要看的是「哪一天」，不是一句吉凶 */
    var rows = '', i;
    for (i = 1; i <= 6; i++) {
      var dt = new Date(now.getTime() + i * 86400000);
      var f2 = C.fourPillars(dt, { ziRule: 'late' });
      var j2 = C.jianchu(C.ZHI.indexOf(f2.month.zhi), C.ZHI.indexOf(f2.day.zhi));
      var yi2 = String(j2.yiji.yi).split('、').slice(0, 3).join('、');
      rows += '<tr><td>' + esc(dayStr(dt)) + '</td><td>' + esc(gz(f2.day)) + '</td><td>' +
        esc(j2.name) + (j2.isHuangDao ? ' · 黄' : ' · 黑') + '</td><td>' + esc(yi2) + '</td></tr>';
    }
    h += '<table class="table small"><thead><tr><th>日</th><th>日辰</th><th>建除</th><th>宜（节选）</th></tr></thead><tbody>' +
      rows + '</tbody></table>';
    h += '<p class="small muted">建除以月建与日辰相较为序，黄道六神为除、危、定、执、成、开。宜忌取《协纪辨方》一路的通行条例，' +
      '是「宜于做什么」的常例，不是对某件事的断语。</p>';

    var s = 44;
    if (u.domain.id === 'date') s += 30;
    if (u.askType === '何时') s += 14;
    if (u.timeScope === '近期') s += 4;
    if (u.domain.id === 'omen' || u.domain.id === 'cezi') s -= 18;
    var pick = RE_DAY.test(q) || RE_TODAY.test(q);
    if (pick) s = Math.max(s, 80);

    return {
      module: 'huangli', title: '黄历 · 今日建除与宜忌',
      score: s, body: h,
      facts: { jianchu: jc.name, huangDao: jc.isHuangDao, yi: jc.yiji.yi, ji: jc.yiji.ji, chong: cs.chongZhi, gz: gz(f.day) },
      rawData: { jc: jc, cs: cs, f: f, dayGz: gz(f.day), monthZhi: f.month.zhi, dayGan: f.day.gan },
      why: pick
        ? '所问要挑一个日子，黄历正主其事：建除十二神、冲煞、彭祖百忌，加未来六日的宜忌一览，看哪一天合你的事。'
        : '所问不在择日，黄历只备一体：看看这一日宜什么、冲什么，与所问之事未必相干，勿据以断成败。'
    };
  }

  /* 测字：XJCezi 由主控另行维护，不存在则跳过 */
  function buildCezi(q, u, now, method) {
    var Z = root.XJCezi;
    if (!Z || !Z.analyze || !u.char) return null;
    var res = Z.analyze({ char: u.char, question: q, date: now });
    if (!res || res.error || !res.info) return null;

    var h = '<dl class="kv">';
    h += '<dt>所拈之字</dt><dd>' + esc(res.char) + ' · ' + res.info.strokes + '画 · ' + esc(res.info.radical) + '部' +
      (res.info.extra ? '（部外' + res.info.extra + '画）' : '') + '</dd>';
    h += '<dt>字之五行</dt><dd>' + esc(res.shu.wx) + '</dd>';
    if (res.shi) {
      h += '<dt>时令</dt><dd>月建' + esc(res.shi.monthZhi) + '（' + esc(res.shi.monthWx) + '）· 日辰' +
        esc(res.shi.dayGan) + '（' + esc(res.shi.dayWx) + '）· 字与月建' + esc(res.shi.mRel) + '、与日辰' + esc(res.shi.dRel) + '</dd>';
    }
    h += '</dl>';

    if (res.sections && res.sections.length) h += sections(res.sections);
    else if (res.reasons && res.reasons.length) {
      h += sections(res.reasons.map(function (r) {
        return { title: (r.d > 0 ? '＋' : r.d < 0 ? '－' : '·') + esc(r.text.slice(0, 12)), body: esc(r.text) };
      }));
    }

    var s = 74;
    if (method === 'liuyao' || method === 'meihua') s -= 10;
    s += Math.min(6, u.tags.length * 2);

    return {
      module: 'cezi', title: '测字 · 「' + res.char + '」',
      score: s, body: h,
      facts: { char: res.char, strokes: res.info.strokes, radical: res.info.radical, wx: res.shu.wx, score: res.score, level: res.level, verdict: res.verdict },
      rawData: res,
      why: '所问只此一字，正合测字之法：以笔画定数、部首取象、增损对关取机，字象与所问相参。'
    };
  }

  var lastErrors = [];

  function candidates(q, opts) {
    opts = opts || {};
    var u = opts.understood || understand(q);
    var now = (opts.date instanceof Date) ? opts.date : new Date(opts.date || Date.now());
    var method = opts.method || 'auto';
    var out = [], i;
    lastErrors = [];

    var builders = [
      function () { return buildLiuyao(u.raw, u, now, method); },
      function () { return buildMeihua(u.raw, u, now, method); },
      function () { return buildHuangli(u.raw, u, now, method); },
      function () { return buildDream(u.raw, u, now, method); },
      function () { return buildCezi(u.raw, u, now, method); }
    ];
    var names = ['六爻', '梅花', '黄历', '解梦', '测字'];

    for (i = 0; i < builders.length; i++) {
      var c = null;
      try { c = builders[i](); }
      catch (e) { lastErrors.push(names[i] + '一候未能成卦：' + (e && e.message ? e.message : e)); }
      if (!c) continue;
      c.score = Math.max(0, Math.min(100, Math.round(c.score)));
      c.html = card(c.title, c.body, MOD_NAME[c.module] + ' · 相关 ' + c.score + ' 分');
      c._i = out.length;
      out.push(c);
    }

    out.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a._i - b._i;
    });
    return out;
  }

  /* ---------- 组合成页 ---------- */
  function understandCard(u) {
    var body = '<dl class="kv">';
    body += '<dt>所问</dt><dd>' + esc(u.raw || '（空）') + '</dd>';
    body += '<dt>所属域</dt><dd>' + esc(u.domain.name) +
      ' <span class="small muted">六爻用神 ' + esc(u.domain.use) + '</span></dd>';
    body += '<dt>问句类型</dt><dd>' + esc(u.askType) + (u.timeScope ? ' · 应期看' + esc(u.timeScope) : '') + '</dd>';
    body += '<dt>关键词</dt><dd>' + (u.tags.length ? esc(u.tags.join('、')) :
      '<span class="muted">未取到显著关键词，以泛占论</span>') + '</dd>';
    if (u.char) body += '<dt>所拈之字</dt><dd>' + esc(u.char) + '</dd>';
    /* 域的术数译法不在此重复，主答卡的「你问的是」一段已把它讲开 */
    body += '</dl>';
    return card('先解所问', body, '一事一问');
  }

  function modernBox(c, u) {
    var M = root.XJModern;
    if (!M || !M.explain) return '';
    var e;
    try { e = M.explain(c.module, c.rawData, u); } catch (err) { return ''; }
    if (!e || !e.paras || !e.paras.length) return '';
    var h = '<div class="modern-box"><h3>以今日之语言解之</h3>';
    for (var i = 0; i < e.paras.length; i++) {
      h += '<p><b>' + esc(e.paras[i].lead) + '</b>' + esc(e.paras[i].text) + '</p>';
    }
    if (e.caveat) h += '<p class="small muted">' + esc(e.caveat) + '</p>';
    return h + '</div>';
  }

  function primaryCard(c, u) {
    return card(c.title, c.body + modernBox(c, u), MOD_NAME[c.module] + ' · 相关 ' + c.score + ' 分');
  }

  function relatedCard(list) {
    var body;
    if (list.length) {
      body = list.map(function (c) {
        return '<details><summary>' + esc(c.title) + ' <span class="small muted">' +
          esc(MOD_NAME[c.module] + ' · 相关 ' + c.score + ' 分') + '</span></summary>' +
          '<p class="small muted">' + esc(c.why) + '</p>' + c.body + '</details>';
      }).join('');
    } else {
      body = '<p class="muted">无他候可参。一类事，一卦足以断之。</p>';
    }
    if (lastErrors.length) body += '<p class="small muted">另：' + esc(lastErrors.join('；')) + '</p>';
    return card('相关之候', body, list.length ? list.length + ' 候' : '无');
  }

  function answer(q, opts) {
    opts = opts || {};
    var u = understand(q);
    var list = candidates(q, { understood: u, date: opts.date, method: opts.method });
    var primary = list.length ? list[0] : null;
    var related = list.slice(1, 4);

    var html = understandCard(u);
    if (primary) html += primaryCard(primary, u);
    else {
      html += card('未能取象', '<p class="muted">所问过简，或站内诸法皆未及此。可把事由写全一句，如「我下个月能不能升职」。</p>', '空');
    }
    html += relatedCard(related);

    return { understood: u, primary: primary, related: related, html: html };
  }

  var API = {
    DOMAINS: DOMAINS,
    MODULE_NAME: MOD_NAME,
    understand: understand,
    candidates: candidates,
    answer: answer,
    modernBox: modernBox
  };
  root.XJAsk = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
}(typeof window !== 'undefined' ? window : this));
