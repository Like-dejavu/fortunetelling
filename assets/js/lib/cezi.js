/* ============================================================
   玄鉴 · 测字  window.XJCezi
   依《测字秘牒》（清·程省）十法、《神机相字法》相字之例
   十法：装头 接脚 穿心 包笼 破解 添笔 减笔 对关 摘字 观梅
   说明：
     · 字形与笔画数取自 Unicode Unihan（kTotalStrokes / kRSUnicode），非估算。
     · 「河图数配五行」为一六水、二七火、三八木、四九金、五十土，与本站河洛理数同源。
     · 装头/接脚/穿心/包笼/添笔/减笔/对关 用固定的字形增损表（客观字际关系，非引文）。
     · 凡断语所据，逐条写出依据；属推演者标「推演」，属通说者标「相字通说」。
   ============================================================ */
(function (root) {
  'use strict';

  /* 注意：浏览器里 data/ 的脚本在 lib/ 之后才加载（Node 下两者无先后），
     所以全局对象一律「用时再取」，不能在 IIFE 执行时抓取，否则拿到 undefined。 */
  function CAL() {
    var c = root.XJCalendar;
    if (c) return c;
    if (typeof require !== 'undefined') { try { return require('./calendar.js'); } catch (e) {} }
    return null;
  }
  function HZ() {
    var h = root.XJHanzi;
    if (h) return h;
    if (typeof require !== 'undefined') { try { return require('../data/hanzi.js'); } catch (e) {} }
    return null;
  }
  function TXT() {
    var x = root.XJCeziText;
    if (x) return x;
    if (typeof require !== 'undefined') { try { return require('../data/cezi-text.js'); } catch (e) {} }
    return null;
  }

  var WX = ['木', '火', '土', '金', '水'];
  var SHENG = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };   // 我生
  var KE = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };      // 我克

  /* ---------- 河图数配五行：一六水 二七火 三八木 四九金 五十土 ---------- */
  function hetuWx(n) {
    var d = n % 10;
    if (d === 1 || d === 6) return '水';
    if (d === 2 || d === 7) return '火';
    if (d === 3 || d === 8) return '木';
    if (d === 4 || d === 9) return '金';
    return '土';  /* 5, 0(即10) */
  }
  function hetuPair(n) {
    var d = n % 10;
    if (d === 1 || d === 6) return '一六';
    if (d === 2 || d === 7) return '二七';
    if (d === 3 || d === 8) return '三八';
    if (d === 4 || d === 9) return '四九';
    return '五十';
  }

  /* ---------- 关系：返回「字」与「他」的五行关系 ---------- */
  function relOf(me, other) {
    if (!me || !other) return '无涉';
    if (me === other) return '比和';
    if (SHENG[other] === me) return '他生我';
    if (SHENG[me] === other) return '我生他';
    if (KE[other] === me) return '他克我';
    if (KE[me] === other) return '我克他';
    return '无涉';
  }

  /* ---------- 十法：名称与固定次序 ---------- */
  var FA_ORDER = [
    { id: 'zhuangtou', name: '装头', gloss: '于字之上增一笔或一部，别成一字，以观其向背。' },
    { id: 'jiejiao', name: '接脚', gloss: '于字之下增一笔或一部，别成一字，以观其承托。' },
    { id: 'chuanxin', name: '穿心', gloss: '于字之中穿一笔，别成一字，以观其贯注。' },
    { id: 'baolong', name: '包笼', gloss: '以他形包护其字，别成一字，以观其含容。' },
    { id: 'pojie', name: '破解', gloss: '拆散字形，分其偏旁部伍，逐部取象。' },
    { id: 'tianbi', name: '添笔', gloss: '就本字增一二笔成他字，观所增之字以定吉凶。' },
    { id: 'jianbi', name: '减笔', gloss: '就本字减一二笔成他字，观所减之字以定吉凶。' },
    { id: 'duiguan', name: '对关', gloss: '取相对、相反或形近之字对看，两两相形。' },
    { id: 'zhaizi', name: '摘字', gloss: '摘取字中一部为主，余为宾，以主断事。' },
    { id: 'guanmei', name: '观梅', gloss: '数其笔画，以河图数配五行，参时令论生克。邵子观梅之遗意。' }
  ];

  /* ---------- 字形增损表：客观字际关系 ----------
     pos: top 装头 / bottom 接脚 / mid 穿心 / wrap 包笼；add 所增之笔或部 */
  var VARIANTS = [
    { from: '大', to: '太', add: '丶', pos: 'mid' },
    { from: '大', to: '天', add: '一', pos: 'top' },
    { from: '大', to: '夫', add: '一', pos: 'top' },
    { from: '大', to: '犬', add: '丶', pos: 'top' },
    { from: '人', to: '大', add: '一', pos: 'top' },
    { from: '人', to: '个', add: '丨', pos: 'bottom' },
    { from: '王', to: '玉', add: '丶', pos: 'bottom' },
    { from: '王', to: '主', add: '丶', pos: 'top' },
    { from: '王', to: '全', add: '人', pos: 'top' },
    { from: '日', to: '旦', add: '一', pos: 'bottom' },
    { from: '日', to: '白', add: '丿', pos: 'top' },
    { from: '日', to: '目', add: '一', pos: 'mid' },
    { from: '日', to: '早', add: '十', pos: 'bottom' },
    { from: '田', to: '由', add: '丨', pos: 'top' },
    { from: '田', to: '甲', add: '丨', pos: 'bottom' },
    { from: '田', to: '申', add: '丨', pos: 'mid' },
    { from: '田', to: '男', add: '力', pos: 'bottom' },
    { from: '木', to: '本', add: '一', pos: 'bottom' },
    { from: '木', to: '末', add: '一', pos: 'top' },
    { from: '木', to: '未', add: '一', pos: 'top' },
    { from: '木', to: '休', add: '亻', pos: 'left' },
    { from: '十', to: '千', add: '丿', pos: 'top' },
    { from: '十', to: '土', add: '一', pos: 'bottom' },
    { from: '十', to: '士', add: '一', pos: 'bottom' },
    { from: '口', to: '日', add: '一', pos: 'mid' },
    { from: '口', to: '中', add: '丨', pos: 'mid' },
    { from: '口', to: '囚', add: '人', pos: 'wrap' },
    { from: '口', to: '困', add: '木', pos: 'wrap' },
    { from: '口', to: '国', add: '玉', pos: 'wrap' },
    { from: '門', to: '問', add: '口', pos: 'wrap' },
    { from: '门', to: '问', add: '口', pos: 'wrap' },
    { from: '白', to: '百', add: '一', pos: 'top' },
    { from: '目', to: '自', add: '丿', pos: 'top' },
    { from: '目', to: '且', add: '一', pos: 'bottom' },
    { from: '心', to: '必', add: '丿', pos: 'mid' },
    { from: '心', to: '愁', add: '秋', pos: 'top' },
    { from: '一', to: '二', add: '一', pos: 'bottom' },
    { from: '二', to: '三', add: '一', pos: 'bottom' },
    { from: '二', to: '工', add: '丨', pos: 'mid' },
    { from: '火', to: '灭', add: '一', pos: 'top' },
    { from: '月', to: '朋', add: '月', pos: 'left' },
    { from: '山', to: '出', add: '山', pos: 'top' },
    { from: '生', to: '星', add: '日', pos: 'top' },
    { from: '立', to: '位', add: '亻', pos: 'left' },
    { from: '土', to: '圭', add: '土', pos: 'bottom' },
    { from: '見', to: '現', add: '王', pos: 'left' }
  ];
  /* 由增损表反推：字 → 可加某笔成某字 / 可减某笔成某字 */
  var ADD_MAP = {}, CUT_MAP = {};
  (function () {
    for (var i = 0; i < VARIANTS.length; i++) {
      var v = VARIANTS[i];
      (ADD_MAP[v.from] = ADD_MAP[v.from] || []).push(v);
      (CUT_MAP[v.to] = CUT_MAP[v.to] || []).push(v);
    }
  }());

  /* ---------- 对关：义对与形对 ---------- */
  var DUIGUAN_PAIRS = [
    ['上', '下'], ['天', '地'], ['日', '月'], ['男', '女'], ['生', '死'], ['出', '入'],
    ['來', '去'], ['来', '去'], ['得', '失'], ['成', '败'], ['吉', '凶'], ['明', '暗'],
    ['多', '少'], ['大', '小'], ['高', '低'], ['前', '后'], ['內', '外'], ['内', '外'],
    ['動', '靜'], ['动', '静'], ['開', '關'], ['开', '关'], ['春', '秋'], ['往', '來'],
    ['進', '退'], ['进', '退'], ['貧', '富'], ['贫', '富'], ['貴', '賤'], ['贵', '贱'],
    ['早', '晚'], ['買', '賣'], ['买', '卖'], ['真', '假'], ['虛', '實'], ['虚', '实'],
    ['未', '末'], ['己', '已'], ['戊', '戌'], ['士', '土'], ['問', '聞'], ['问', '闻'],
    ['受', '授'], ['折', '拆'], ['候', '侯'], ['析', '折']
  ];

  /* ---------- 部首五行（相字通说，取部首本义所属） ---------- */
  var BU_WX = {
    '水': '水', '冫': '水', '雨': '水', '魚': '水', '鱼': '水', '舟': '水', '冖': '水',
    '木': '木', '艸': '木', '竹': '木', '禾': '木', '糸': '木', '糹': '木', '耒': '木',
    '火': '火', '日': '火', '赤': '火', '光': '火', '丶': '火', '心': '火', '忄': '火',
    '土': '土', '山': '土', '石': '土', '田': '土', '阜': '土', '邑': '土', '里': '土',
    '金': '金', '玉': '金', '刀': '金', '斤': '金', '戈': '金', '車': '金', '车': '金',
    '貝': '金', '贝': '金', '矢': '金', '弓': '金', '辛': '金', '酉': '金', '皿': '金'
  };
  /* 部首吉凶（相字通说，权重小，仅作微调） */
  var BU_JI = {
    '王': 4, '玉': 4, '金': 4, '水': 3, '木': 3, '禾': 3, '日': 3, '月': 3, '示': 3,
    '衣': 2, '宀': 3, '广': 2, '田': 3, '山': 2, '石': 2, '竹': 2, '艸': 2, '糸': 2,
    '口': 1, '言': 1, '人': 1, '女': 1, '子': 2, '力': 1, '大': 1, '土': 1,
    '歹': -4, '刀': -3, '尸': -3, '鬼': -4, '血': -4, '疒': -3, '凶': -3, '戈': -2,
    '弓': -2, '虫': -2, '犬': -1, '豕': -1, '虍': -2, '攴': -1, '攵': -1, '疋': -1
  };

  /* ---------- 所问之事与字之亲和 ---------- */
  var AFFINITY = {
    career: { wx: ['金', '土'], bu: ['王', '玉', '人', '大', '力', '山'], score: 6, note: '事业升迁，古以官星为职、印星为权，字宜端方凝重' },
    wealth: { wx: ['金', '木'], bu: ['金', '貝', '贝', '禾', '田', '玉'], score: 6, note: '求财以财星为主，字宜丰实有藏' },
    love: { wx: ['木', '水'], bu: ['女', '子', '心', '糸', '月', '日'], score: 6, note: '婚姻感情，古以「女」「子」相合为象' },
    study: { wx: ['木', '火'], bu: ['文', '言', '日', '竹', '糸', '示'], score: 6, note: '考试学业重文书，字宜清朗有头绪' },
    health: { wx: ['土', '水'], bu: ['人', '心', '肉', '疒', '骨'], score: 5, note: '疾病以「身」与「心」为象，字忌支离破碎' },
    travel: { wx: ['水', '木'], bu: ['辵', '辶', '行', '舟', '足', '車', '车'], score: 5, note: '出行迁移以「行」为象，字宜流动不滞' },
    lawsuit: { wx: ['金', '火'], bu: ['言', '刀', '戈', '臼', '口'], score: 5, note: '官讼是非，字带戈刀口舌者主争' },
    lost: { wx: ['土', '金'], bu: ['宀', '广', '口', '田', '山'], score: 5, note: '失物寻人，看字中有「藏」与「出」之分' },
    child: { wx: ['水', '木'], bu: ['子', '女', '生', '育'], score: 5, note: '孕育子女，以「子」「生」为象' },
    house: { wx: ['土', '木'], bu: ['宀', '广', '户', '門', '门', '土', '木'], score: 5, note: '田宅家宅，字宜有覆盖周护之形' },
    people: { wx: ['木', '火'], bu: ['人', '口', '言', '心'], score: 5, note: '人际合作，看字之左右是否相顾' },
    timing: { wx: ['土', '金'], bu: ['日', '月', '辰', '時', '时'], score: 4, note: '择日行事，重干支与建除，字只作参' }
  };

  /* ---------- 触机取字（测字所常用、字义分明者） ---------- */
  var CAST_POOL = ('問问明好財财官婚病行歸归来去成敗败吉凶買买卖夢梦水火山田土金木日月中人大小多少' +
    '安家宅門门路走止進进退得失虛虚实動动靜静上下天地男女老幼生死出入喜怒哀樂乐' +
    '春夏秋冬東西南北東西風风雨雪雲云雷電电星月花草木石金玉珠寶宝刀劍剑筆笔書书' +
    '米麥麦衣食住行醫医藥药酒茶馬马牛羊肉魚鱼鳥鸟蟲虫龍龙虎犬豕鬼神魂魄祖宗孫孙' +
    '父子兄弟夫妻朋友君臣師师徒弟官兵賊贼盜盗囚獄狱刑罰罚賞赏恩仇恩怨情愛爱恨' +
    '愁苦歡欢樂乐憂忧思慮虑恐怕驚惊夢想想願愿望求索尋找找等候早晚朝夕光暗影聲声').split('');

  /* ---------- 事项识别（与 XJAsk 同构，若其已载则复用） ---------- */
  var DOMAIN_RULES = [
    { id: 'career', name: '事业升迁', kw: ['工作', '升职', '升遷', '跳槽', '事业', '事業', '领导', '領導', '同事', '面试', '面試', '录用', '錄用', '职场', '職場', '公务员', '公務員', '考试', '考試', '编制'] },
    { id: 'wealth', name: '求财经营', kw: ['财', '財', '钱', '錢', '生意', '投资', '投資', '买卖', '買賣', '生意', '收入', '工资', '發財', '发财', '债', '債', '借贷'] },
    { id: 'love', name: '婚姻感情', kw: ['婚', '恋', '戀', '感情', '对象', '對象', '男友', '女友', '结婚', '結婚', '离婚', '離婚', '分手', '复婚', '復婚', '相亲', '相親'] },
    { id: 'study', name: '考试学业', kw: ['考', '学', '學', '试', '試', '升学', '升學', '考研', '高考', '录取', '論文', '论文', '答辩', '答辯', '学位', '學位'] },
    { id: 'health', name: '疾病健康', kw: ['病', '疾', '健康', '医', '醫', '药', '藥', '手术', '手術', '痛', '身体', '身體', '血', '失眠'] },
    { id: 'travel', name: '出行迁移', kw: ['出行', '旅', '搬家', '遷', '迁', '走', '远方', '遠方', '出差', '机票', '機票', '签证', '簽證', '回國', '回国'] },
    { id: 'lawsuit', name: '官讼是非', kw: ['官司', '诉讼', '訴訟', '纠纷', '糾紛', '打官司', '上庭', '律师', '律師', '罚', '罰', '拘留', '是非'] },
    { id: 'lost', name: '失物寻人', kw: ['丢', '丟', '失', '丢东西', '找不到', '寻', '尋', '走失', '失物', '不見', '不见', '遗忘'] },
    { id: 'child', name: '孕育子女', kw: ['怀孕', '懷孕', '生育', '孩子', '子女', '胎', '产', '產', '求子', '儿', '兒'] },
    { id: 'house', name: '田宅家宅', kw: ['房', '宅', '宅子', '买房', '買房', '装修', '裝修', '租', '搬', '家宅', '物业', '物業'] },
    { id: 'people', name: '人际合作', kw: ['合作', '合伙', '合夥', '朋友', '人际', '人際', '关系', '關係', '贵人', '貴人', '小人', '团队', '團隊'] },
    { id: 'timing', name: '择日行事', kw: ['哪天', '吉日', '择日', '擇日', '日子', '日期', '什么时候', '什麼時候', '几号', '幾號', '宜忌', '黄历', '黃曆'] }
  ];

  var JI_CHARS = '吉利亨通兴隆昌盛荣耀光明富贵吉祥文昌福禄寿康宁泰安和顺成';
  var XIONG_CHARS = '凶险厄困阻碍破损伤病死亡败衰落孤寡离散忧愁苦悲祸灾';

  /* ---------- 字义吉凶（相字通说：字义为三要之一，形、音、义） ----------
     只收字义明确者，权 ±6；义有两可者不入表（作中论）。 */
  var ZI_YI = {
    '吉': ['吉', '吉庆之字，其义为善'], '祥': ['吉', '祥者善也，福之先见'],
    '福': ['吉', '福者备也，百顺之名'], '祿': ['吉', '禄者福也，食禄之象'], '禄': ['吉', '禄者福也，食禄之象'],
    '壽': ['吉', '寿者久也，年命之永'], '寿': ['吉', '寿者久也，年命之永'],
    '喜': ['吉', '喜者乐也，庆会之象'], '慶': ['吉', '庆者贺也，福履之至'], '庆': ['吉', '庆者贺也，福履之至'],
    '安': ['吉', '安者静也，居处之宁'], '康': ['吉', '康者安也，身体之和'], '寧': ['吉', '宁者安也，家宅之静'], '宁': ['吉', '宁者安也，家宅之静'],
    '泰': ['吉', '泰者通也，上下之交'], '和': ['吉', '和者调也，众情之洽'], '順': ['吉', '顺者从也，事势之利'], '顺': ['吉', '顺者从也，事势之利'],
    '成': ['吉', '成者就也，功业之毕'], '就': ['吉', '就者成也，事之即'], '得': ['吉', '得者获也，所求之应'],
    '興': ['吉', '兴者起也，家业之振'], '兴': ['吉', '兴者起也，家业之振'], '隆': ['吉', '隆者盛也，其势方高'],
    '榮': ['吉', '荣者显也，名位之彰'], '荣': ['吉', '荣者显也，名位之彰'], '貴': ['吉', '贵者尊也，位望之崇'], '贵': ['吉', '贵者尊也，位望之崇'],
    '富': ['吉', '富者备也，财货之充'], '財': ['吉', '财者资也，用度之给'], '财': ['吉', '财者资也，用度之给'],
    '明': ['吉', '明者照也，事理之晰'], '光': ['吉', '光者耀也，声誉之著'], '達': ['吉', '达者通也，志意之遂'], '达': ['吉', '达者通也，志意之遂'],
    '通': ['吉', '通者彻也，阻隔之开'], '亨': ['吉', '亨者通也，事之无碍'], '利': ['吉', '利者宜也，有所获'],
    '進': ['吉', '进者前也，其势向上'], '进': ['吉', '进者前也，其势向上'], '升': ['吉', '升者上也，位之加'],
    '生': ['吉', '生者出也，气之方长'], '春': ['吉', '春者动也，万物之始'],
    '婚': ['吉', '婚者昏也，合二姓之好'], '好': ['吉', '好者美也，两情之洽'], '合': ['吉', '合者聚也，两事之并'],
    '全': ['吉', '全者完也，无所缺'], '圓': ['吉', '圆者满也，事之周'], '圆': ['吉', '圆者满也，事之周'],
    '旺': ['吉', '旺者盛也，气之炽'], '盛': ['吉', '盛者满也，其势方张'],

    '凶': ['凶', '凶者恶也，事之逆'], '險': ['凶', '险者阻也，前路不平'], '险': ['凶', '险者阻也，前路不平'],
    '厄': ['凶', '厄者困也，事之穷'], '困': ['凶', '困者穷也，力不得伸'], '阻': ['凶', '阻者碍也，事不前'],
    '礙': ['凶', '碍者止也，有所隔'], '破': ['凶', '破者裂也，成者复败'], '損': ['凶', '损者减也，有所失'], '损': ['凶', '损者减也，有所失'],
    '傷': ['凶', '伤者创也，体有所损'], '伤': ['凶', '伤者创也，体有所损'], '病': ['凶', '病者疾也，身之不安'],
    '疾': ['凶', '疾者急也，患之速'], '死': ['凶', '死者尽也，气之竭'], '亡': ['凶', '亡者失也，所有皆空'],
    '敗': ['凶', '败者毁也，事之覆'], '败': ['凶', '败者毁也，事之覆'], '衰': ['凶', '衰者退也，气之减'],
    '落': ['凶', '落者坠也，其势向下'], '孤': ['凶', '孤者独也，无与为伴'], '寡': ['凶', '寡者少也，其势单'],
    '離': ['凶', '离者散也，合者复分'], '离': ['凶', '离者散也，合者复分'], '散': ['凶', '散者分也，聚者不复'],
    '憂': ['凶', '忧者愁也，心之不宁'], '忧': ['凶', '忧者愁也，心之不宁'], '愁': ['凶', '愁者结也，思之不解'],
    '苦': ['凶', '苦者辛也，所历之难'], '悲': ['凶', '悲者哀也，情之伤'], '禍': ['凶', '祸者害也，灾之至'], '祸': ['凶', '祸者害也，灾之至'],
    '災': ['凶', '灾者害也，天之罚'], '灾': ['凶', '灾者害也，天之罚'], '亂': ['凶', '乱者紊也，序之失'], '乱': ['凶', '乱者紊也，序之失'],
    '刀': ['凶', '刀者兵也，有伤伐之象'], '鬼': ['凶', '鬼者幽也，事之暗昧'], '尸': ['凶', '尸者陈也，气之滞'],
    '囚': ['凶', '囚者系也，身不得出'], '狱': ['凶', '狱者讼也，事之拘'], '獄': ['凶', '狱者讼也，事之拘'],
    '病': ['凶', '病者疾也，身之不安'], '絕': ['凶', '绝者断也，续之无望'], '绝': ['凶', '绝者断也，续之无望'],
    '空': ['凶', '空者虚也，求之无得'], '虛': ['凶', '虚者空也，实之反'], '虚': ['凶', '虚者空也，实之反'],
    '難': ['凶', '难者艰也，行之不易'], '难': ['凶', '难者艰也，行之不易'], '止': ['凶', '止者停也，进者不进'],
    '退': ['凶', '退者却也，其势向下'], '失': ['凶', '失者亡也，所有不守'],
    '中': ['中', '中者不偏，事在两可']
  };

  function yiOf(ch) {
    return ZI_YI[ch] || null;
  }


  function detectDomain(text) {
    var s = text || '';
    var best = null, bestN = 0;
    for (var i = 0; i < DOMAIN_RULES.length; i++) {
      var r = DOMAIN_RULES[i], n = 0;
      for (var j = 0; j < r.kw.length; j++) if (s.indexOf(r.kw[j]) >= 0) n++;
      if (n > bestN) { bestN = n; best = r; }
    }
    return best || { id: 'general', name: '泛问', kw: [] };
  }

  /* ---------- 断语档位 ---------- */
  function levelOf(score) {
    if (score >= 72) return { level: '大吉', verdict: '所问之事，象意相扶，宜作主张' };
    if (score >= 60) return { level: '吉', verdict: '可从愿而行，惟须循序' };
    if (score >= 47) return { level: '中平', verdict: '得失相参，宜守常度，不宜躁进' };
    if (score >= 34) return { level: '不利', verdict: '象不助事，宜缓不宜急' };
    return { level: '凶', verdict: '所问多阻，宜止宜改，不宜强求' };
  }

  /* ---------- 十法总表（合并数据文件中的引文） ---------- */
  function shifaList() {
    var T = TXT();
    var out = [], data = (T && T.shifa) || [];
    for (var i = 0; i < FA_ORDER.length; i++) {
      var f = FA_ORDER[i], hit = null;
      for (var j = 0; j < data.length; j++) if (data[j].id === f.id) { hit = data[j]; break; }
      out.push({
        id: f.id,
        name: (hit && hit.name) || f.name,
        quote: (hit && hit.quote) || '',
        gloss: (hit && hit.gloss) || f.gloss,
        apply: (hit && hit.apply) || ''
      });
    }
    return out;
  }

  /* ---------- 逐法落实到本字 ---------- */
  function applyFa(ch, info, shu) {
    var fa = shifaList();
    var adds = ADD_MAP[ch] || [], cuts = CUT_MAP[ch] || [];
    var pair = null;
    for (var p = 0; p < DUIGUAN_PAIRS.length; p++) {
      if (DUIGUAN_PAIRS[p][0] === ch) { pair = DUIGUAN_PAIRS[p][1]; break; }
      if (DUIGUAN_PAIRS[p][1] === ch) { pair = DUIGUAN_PAIRS[p][0]; break; }
    }
    var findings = {};
    var posName = { top: '装头', bottom: '接脚', mid: '穿心', wrap: '包笼', left: '偏旁' };

    function byPos(pos) {
      var arr = [];
      for (var i = 0; i < adds.length; i++) if (adds[i].pos === pos) arr.push(adds[i]);
      return arr;
    }
    var zh = byPos('top'), jj = byPos('bottom'), cx = byPos('mid'), bl = byPos('wrap'), left = byPos('left');
    if (zh.length) findings.zhuangtou = '上加「' + zh[0].add + '」，成「' + zh[0].to + '」字';
    if (jj.length) findings.jiejiao = '下加「' + jj[0].add + '」，成「' + jj[0].to + '」字';
    if (cx.length) findings.chuanxin = '中穿「' + cx[0].add + '」，成「' + cx[0].to + '」字';
    if (bl.length) findings.baolong = '外裹「' + bl[0].add + '」，成「' + bl[0].to + '」字';
    findings.pojie = '此字从「' + (info.radical || '？') + '」部，部外 ' + info.extra + ' 笔' +
      (info.extra === 0 ? '，为独体之字，象不可分' : '，为合体之字，可分主从');
    if (adds.length) {
      findings.tianbi = '添笔可得：' + adds.map(function (v) { return '「' + v.to + '」'; }).join('、');
    }
    if (cuts.length) {
      findings.jianbi = '减笔可得：' + cuts.map(function (v) { return '「' + v.from + '」'; }).join('、');
    }
    if (pair) findings.duiguan = '此字与「' + pair + '」相对，两字相形，可观其向背';
    findings.zhaizi = '以「' + (info.radical || '？') + '」为主（主事），以余 ' + info.extra + ' 笔为宾（辅之）';
    findings.guanmei = '共 ' + info.strokes + ' 笔，' + hetuPair(info.strokes) + '之数，属' + shu.wx +
      '；' + (info.strokes % 2 ? '奇数属阳' : '偶数属阴') +
      (info.strokes <= 5 ? '，为生数' : (info.strokes <= 10 ? '，为成数' : '，逾十取尾，' + hetuPair(info.strokes) + '为用'));

    var out = [];
    for (var i = 0; i < fa.length; i++) {
      var f = fa[i], find = findings[f.id] || '';
      out.push({
        id: f.id, name: f.name, quote: f.quote, gloss: f.gloss,
        applied: !!find, finding: find || '本字无可用之增损（须就所书之字随手增损，非概然可套）',
        pos: posName[f.id] || ''
      });
    }
    return out;
  }

  /* ---------- 主分析 ---------- */
  function analyze(opt) {
    opt = opt || {};
    var raw = String(opt.char || '').replace(/\s/g, '');
    var qText = String(opt.question || '').trim();
    if (!raw) return { error: '请先写一个字。' };
    var ch = raw.charAt(0);
    if (raw.length > 1) opt.multi = raw;
    var H = HZ();
    var info = H ? H.lookup(ch) : null;
    if (!info) {
      return {
        error: '「' + ch + '」不在本站形数表（收常用及繁体字 ' + (H ? H.size : 0) + ' 字）。' +
          '可以换一字，或改用其简体；若为生僻字，字形笔画无从确计，不敢妄断。'
      };
    }

    var dt = opt.date instanceof Date ? opt.date : new Date();
    var C = CAL();
    var four = C ? C.fourPillars(dt, { ziRule: 'late' }) : null;
    var monthZhi = four ? four.month.zhi : '';
    var dayGan = four ? four.day.gan : '';
    var monthWx = monthZhi && C ? C.wuxingOfZhi(monthZhi) : '';
    var dayWx = dayGan && C ? C.wuxingOfGan(dayGan) : '';

    var wx = hetuWx(info.strokes);
    var shu = {
      n: info.strokes,
      wx: wx,
      pair: hetuPair(info.strokes),
      odd: info.strokes % 2 === 1,
      sheng: info.strokes <= 5,
      tail: info.strokes % 10 === 0 ? 10 : info.strokes % 10
    };

    var reasons = [], score = 50;

    /* 一、时令生克 */
    var mRel = relOf(wx, monthWx), dRel = relOf(wx, dayWx);
    function bump(rel, table, tag) {
      var d = table[rel] || 0;
      if (d) {
        score += d;
        reasons.push({
          text: tag + '：字属' + wx + '，' + tag.replace('月建', '月建').replace('日辰', '日辰') + (tag.indexOf('月建') >= 0 ? monthZhi : dayGan) +
            '属' + (tag.indexOf('月建') >= 0 ? monthWx : dayWx) + '，' + rel + '，' + (d > 0 ? '+' : '') + d,
          d: d
        });
      }
      return d;
    }
    bump(mRel, { '他生我': 12, '比和': 9, '我生他': -6, '我克他': -5, '他克我': -12, '无涉': 0 }, '月建');
    bump(dRel, { '他生我': 7, '比和': 5, '我生他': -4, '我克他': -3, '他克我': -8, '无涉': 0 }, '日辰');

    /* 二、部首吉凶 */
    var buJi = BU_JI[info.radical];
    if (typeof buJi === 'number') {
      score += buJi;
      reasons.push({ text: '部首「' + info.radical + '」' + (buJi > 0 ? '为吉部' : '为忌部') + '，' + (buJi > 0 ? '+' : '') + buJi, d: buJi });
    }

    /* 二之二、字义 */
    var yi = yiOf(ch);
    var yiD = 0;
    if (yi) {
      yiD = yi[0] === '吉' ? 6 : (yi[0] === '凶' ? -6 : 0);
      if (yiD) {
        score += yiD;
        reasons.push({ text: '字义：' + yi[1] + '，' + (yiD > 0 ? '+' : '') + yiD, d: yiD });
      }
    }

    /* 三、添减笔所见之字 */
    var adds = ADD_MAP[ch] || [], cuts = CUT_MAP[ch] || [];
    function wxScoreOfCharList(list, sign) {
      var d = 0, notes = [];
      for (var i = 0; i < list.length; i++) {
        var t = list[i];
        var v = 0;
        for (var k = 0; k < JI_CHARS.length; k++) if (t.indexOf(JI_CHARS.charAt(k)) >= 0) { v += sign * 4; break; }
        if (!v) for (var k2 = 0; k2 < XIONG_CHARS.length; k2++) if (t.indexOf(XIONG_CHARS.charAt(k2)) >= 0) { v += sign * -4; break; }
        if (v) { d += v; notes.push('「' + t + '」' + (v > 0 ? '吉' : '凶')); }
      }
      return { d: d, notes: notes };
    }
    var tAdd = wxScoreOfCharList(adds.map(function (v) { return v.to; }), 1);
    var tCut = wxScoreOfCharList(cuts.map(function (v) { return v.from; }), 1);
    if (tAdd.d) {
      score += tAdd.d;
      reasons.push({ text: '添笔所见：' + tAdd.notes.join('、') + '，' + (tAdd.d > 0 ? '+' : '') + tAdd.d, d: tAdd.d });
    }
    if (tCut.d) {
      score += tCut.d;
      reasons.push({ text: '减笔所见：' + tCut.notes.join('、') + '，' + (tCut.d > 0 ? '+' : '') + tCut.d, d: tCut.d });
    }

    /* 四、对关 */
    var pair = null;
    for (var p = 0; p < DUIGUAN_PAIRS.length; p++) {
      if (DUIGUAN_PAIRS[p][0] === ch) { pair = DUIGUAN_PAIRS[p][1]; break; }
      if (DUIGUAN_PAIRS[p][1] === ch) { pair = DUIGUAN_PAIRS[p][0]; break; }
    }
    var pairIsJi = false, pairIsXiong = false;
    if (pair) {
      pairIsJi = JI_CHARS.indexOf(pair) >= 0;
      pairIsXiong = XIONG_CHARS.indexOf(pair) >= 0;
      var pd = pairIsXiong ? -4 : 0;   /* 所测为凶字之对，则反取其意，不加不减 */
      if (pd) { score += pd; reasons.push({ text: '对关见「' + pair + '」，其字带凶，反观则所测之字未必凶，' + pd, d: pd }); }
    }

    /* 五、所问之事（未写所问则只就字论字，此项不加不减） */
    var domain = detectDomain(qText);
    var aff = (qText && AFFINITY[domain.id]) ? AFFINITY[domain.id] : null;
    if (aff) {
      var hitWx = aff.wx.indexOf(wx) >= 0;
      var hitBu = aff.bu.indexOf(info.radical) >= 0;
      var d5 = (hitWx ? aff.score : 0) + (hitBu ? 4 : 0) + ((!hitWx && !hitBu) ? -4 : 0);
      if (d5) {
        score += d5;
        reasons.push({
          text: '所问「' + domain.name + '」：' + aff.note + '；本字属' + wx + '、从「' + info.radical + '」部，' +
            (hitWx && hitBu ? '五行与部首俱相得' : hitWx ? '五行相得' : hitBu ? '部首相得' : '五行与部首俱不相得') + '，' + (d5 > 0 ? '+' : '') + d5,
          d: d5
        });
      }
    }

    score = Math.max(0, Math.min(100, score));
    var lv = levelOf(score);

    /* ---------- 断语 ---------- */
    var sections = [];
    var fa = applyFa(ch, info, shu);

    sections.push({
      title: '观梅 · 数其笔画',
      body: '「' + ch + '」共 <b>' + info.strokes + '</b> 笔，' + hetuPair(info.strokes) + '之数配' + wx + '（一六水、二七火、三八木、四九金、五十土，河图之数）。' +
        '以阴阳论，' + (shu.odd ? '奇数属阳，主动、主外、主刚' : '偶数属阴，主静、主内、主柔') + '；' +
        '以生成论，' + (shu.sheng ? '五笔以内为生数，其气方长' : (info.strokes <= 10 ? '六至十为成数，其气已定' : '逾十者取尾数，' + hetuPair(info.strokes) + '为用，所谓「遇十不用」')) + '。',
      basis: '河图数：天一生水、地六成之；地二生火、天七成之；天三生木、地八成之；地四生金、天九成之；天五生土、地十成之。'
    });

    sections.push({
      title: '摘字 · 分部取象',
      body: '此字从「<b>' + (info.radical || '？') + '</b>」部，部外 ' + info.extra + ' 笔。' +
        (info.extra === 0 ? '部首即本体，为独体之字，一事一体，无主从可分。' : '为合体之字：以部首为主（所问之正事），以余笔为宾（所问之旁因）。') +
        (BU_WX[info.radical] ? '部首「' + info.radical + '」于五行属' + BU_WX[info.radical] + '。' : '') +
        (yi ? '又以字义论：' + yi[1] + '。' : ''),
      basis: '部首依《说文》五百四十部归并之康熙二百一十四部；字之笔画取 Unicode Unihan 所载总笔画。测字有形、音、义三要，此取形与义。'
    });

    var appliedList = [];
    for (var q = 0; q < fa.length; q++) if (fa[q].applied) appliedList.push(fa[q].name + '：' + fa[q].finding);
    sections.push({
      title: '十法 · 所施何法',
      body: '本字可用者 ' + appliedList.length + ' 法。<ul class="small" style="margin:8px 0 0;padding-left:20px">' +
        appliedList.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>',
      basis: '《测字秘牒》十法：装头、接脚、穿心、包笼、破解、添笔、减笔、对关、摘字、观梅（一本作「观枚」）。' +
        ((TXT() && TXT().books && TXT().books[0] && TXT().books[0].src) ? '（原书：' + TXT().books[0].title + '）' : '')
    });

    if (four) {
      sections.push({
        title: '时令 · 与月建日辰相参',
        body: '占时' + (C ? C.fmtDate(dt) : '') + '，' + four.year.gan + four.year.zhi + '年 ' + four.month.gan + monthZhi + '月 ' +
          dayGan + four.day.zhi + '日。字属' + wx + '，月建' + monthZhi + '属' + monthWx + '（' + mRel + '），' +
          '日干' + dayGan + '属' + dayWx + '（' + dRel + '）。' +
          (mRel === '他生我' ? '月建生字，其气得助，事有外来之援。' :
            mRel === '他克我' ? '月建克字，时令不与之，事多阻于外势。' :
              mRel === '比和' ? '月建与字比和，气类相从，事在掌握。' :
                mRel === '我生他' ? '字生月建，我耗于外，力有未尽。' : '字克月建，我能制时，然亦费力。'),
        basis: '月建、日辰为断卦之纲，测字借用其法：以字之五行与月建日辰论生克。属推演。'
      });
    }

    if (aff) {
      sections.push({
        title: '所问 · ' + (qText ? domain.name : '未指'),
        body: (qText
          ? '君所问者，「' + qText.slice(0, 40) + (qText.length > 40 ? '…' : '') + '」'
          : '君未指所问，故只就字论字——') +
          '，归于' + domain.name + '。' + aff.note + '。' +
          '本字' + (aff.wx.indexOf(wx) >= 0 ? '五行与所问相得' : '五行与所问不相得') + '，' +
          (aff.bu.indexOf(info.radical) >= 0 ? '部首又合其事之象' : '部首不合其事之象') +
          (aff.wx.indexOf(wx) >= 0 && aff.bu.indexOf(info.radical) >= 0 ? '，二者俱应，其象为真。' : '，须以他法参看，不可执一。'),
        basis: '所问与字之相应，为测字「触机」之要：字从口出，与所问之事相应者，其象乃真。'
      });
    }

    sections.push({
      title: '总断',
      body: '<b>' + lv.level + '</b>（' + score + ' 分）。' + lv.verdict + '。' +
        (score >= 72 ? '可乘时举事，然亦宜留余地。' :
          score >= 60 ? '谋之可成，惟不宜求全。' :
            score >= 47 ? '事在可否之间，守正则无大失。' :
              score >= 34 ? '此时不宜动，动则多阻；待月建日辰转而生字，再图之。' :
                '强求无益，宜改弦易辙，或另择时日。'),
      basis: '计分之法：以五十为中和之数，月建、日辰、部首、添减笔、对关、所问六者加减之，其加减悉载于上。'
    });

    return {
      char: ch,
      multi: opt.multi || '',
      question: qText,
      info: info,
      shu: shu,
      fa: fa,
      four: four,
      shi: { monthZhi: monthZhi, monthWx: monthWx, dayGan: dayGan, dayWx: dayWx, mRel: mRel, dRel: dRel },
      domain: domain,
      score: score,
      level: lv.level,
      verdict: lv.verdict,
      reasons: reasons,
      sections: sections,
      shifaAll: shifaList(),
      books: (TXT() && TXT().books) || [],
      rules: (TXT() && TXT().rules) || [],
      shenji: (TXT() && TXT().shenji) || []
    };
  }

  function castChar() {
    var i = Math.floor(Math.random() * CAST_POOL.length);
    return CAST_POOL[i];
  }

  var API = {
    analyze: analyze,
    castChar: castChar,
    hetuWx: hetuWx,
    hetuPair: hetuPair,
    relOf: relOf,
    shifaList: shifaList,
    detectDomain: detectDomain,
    FA_ORDER: FA_ORDER,
    VARIANTS: VARIANTS,
    DUIGUAN_PAIRS: DUIGUAN_PAIRS,
    AFFINITY: AFFINITY,
    BU_WX: BU_WX,
    levelOf: levelOf
  };
  root.XJCezi = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
}(typeof window !== 'undefined' ? window : this));
