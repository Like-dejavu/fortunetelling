/* ============================================================
   我的页面 · 查询历史
   记录只存本机浏览器，可检索、重放、删除、导出、清空。
   ============================================================ */
(function (root) {
  'use strict';
  var App = root.XJApp, U = root.XJUI, H = root.XJHistory;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function esc(s) { return U.esc(s); }

  function timeOf(t) {
    var d = new Date(t);
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function dayOf(t) {
    var d = new Date(t), now = new Date();
    var a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    var b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    var diff = Math.round((b - a) / 864e5);
    if (diff === 0) return '今天';
    if (diff === 1) return '昨天';
    if (diff > 1 && diff < 7) return diff + ' 天前';
    return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
  }

  function dateFull(t) {
    var d = new Date(t);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  var CHIP_LABEL = {
    date: '日期', time: '时刻', hour: '时辰', gender: '性别', q: '所问',
    item: '事项', n1: '上数', n2: '下数', mode: '起卦', chapter: '章'
  };
  var CHIP_KEYS = ['date', 'time', 'hour', 'gender', 'q', 'item', 'n1', 'n2', 'mode'];

  function chips(x) {
    var p = x.params || {}, out = [];
    if (x.arg) out.push('<span class="mi-chip">' + esc(x.arg) + '</span>');
    CHIP_KEYS.forEach(function (k) {
      if (p[k] == null || p[k] === '' || out.length >= 5) return;
      var v = String(p[k]);
      if (k === 'mode') v = v === 'num' ? '数字起卦' : '时间起卦';
      if (k === 'hour') v = '第 ' + v + ' 时';
      out.push('<span class="mi-chip"><i>' + CHIP_LABEL[k] + '</i>' + esc(v) + '</span>');
    });
    return out.length ? '<div class="mi-chips">' + out.join('') + '</div>' : '';
  }

  function itemHtml(x) {
    var hash = x.hash || ('#/' + x.route);
    return '<div class="mine-item" data-id="' + esc(x.id || '') + '">' +
      '<span class="mi-gl">' + esc(x.gl || '·') + '</span>' +
      '<div class="mi-body">' +
      '<div class="mi-top"><b>' + esc(x.title || x.route) + '</b>' +
      '<span class="mi-time" title="' + esc(dateFull(x.t)) + '">' + timeOf(x.t) + '</span>' +
      (x.source === 'ask' ? '<span class="mi-src">问句</span>' : '<span class="mi-src dim">页内</span>') +
      '</div>' +
      (x.text ? '<div class="mi-text">「' + esc(x.text) + '」</div>' : '') +
      '<div class="mi-sum">' + esc(x.summary || '推算一次') + '</div>' +
      chips(x) +
      '</div>' +
      '<div class="mi-ops">' +
      '<a class="mi-btn" href="' + esc(hash) + '">重放 ↗</a>' +
      '<button type="button" class="mi-btn ghost" data-del="' + esc(x.id || '') + '">删除</button>' +
      '</div></div>';
  }

  function listHtml(list) {
    if (!list.length) {
      return '<div class="mine-empty"><span class="me-seal">鉴</span>' +
        '<h3>尚无匹配的记录</h3><p>换个关键词，或清空筛选条件试试。</p>' +
        '<a class="btn ghost" href="#/home">回主界面</a></div>';
    }
    var groups = [], cur = null;
    list.forEach(function (x) {
      var label = dayOf(x.t);
      if (!cur || cur.label !== label) { cur = { label: label, items: [] }; groups.push(cur); }
      cur.items.push(x);
    });
    return '<div class="mine-groups">' + groups.map(function (g) {
      return '<div class="mine-day"><div class="mine-day-head"><b>' + esc(g.label) + '</b>' +
        '<span>' + g.items.length + ' 条</span></div>' +
        g.items.map(itemHtml).join('') + '</div>';
    }).join('') + '</div>';
  }

  function emptyHtml() {
    return '<div class="mine-empty"><span class="me-seal">鉴</span>' +
      '<h3>这里还没有记录</h3>' +
      '<p>在主界面写下所问，或直接使用任一功能页推算，<br>玄鉴会把这次查询留在这里，随时可以重放。</p>' +
      '<a class="btn" href="#/home">去问一句 ↗</a></div>';
  }

  function statHtml() {
    var s = H.stats();
    return '<div class="mine-stats">' +
      '<div><b>' + s.total + '</b><span>累计查询</span></div>' +
      '<div><b>' + s.today + '</b><span>今日</span></div>' +
      '<div><b>' + s.kinds + '</b><span>用过的功能</span></div>' +
      '<div><b class="txt">' + esc(s.top) + '</b><span>最常问' + (s.topN ? ' · ' + s.topN + ' 次' : '') + '</span></div>' +
      '</div>';
  }

  App.page('mine', {
    render: function () {
      var ok = H.available();
      var html = '<div class="page-head"><h1>我的页面 · 查询记录</h1>' +
        '<p class="lede">凡有所问，皆留其迹。此处按时间列出你在玄鉴的每一次查询，可检索、可重放（连同当时的参数）、可删除，亦可导出留档。' +
        '记录只写在这台设备的浏览器里，不上传、不联网、不含任何身份信息。</p></div>';

      html += statHtml();

      html += '<div class="card mine-toolbar">' +
        '<div class="mine-tools">' +
        '<input type="search" id="mine-q" placeholder="检索问句、功能或摘要" autocomplete="off">' +
        '<select id="mine-filter"><option value="">全部功能</option></select>' +
        '<button type="button" class="btn ghost" id="mine-export">导出 JSON</button>' +
        '<button type="button" class="btn ghost danger" id="mine-clear">清空记录</button>' +
        '</div>' +
        '<div class="mine-confirm" id="mine-confirm" style="display:none">' +
        '<span>确定清空全部查询记录？此操作不可撤销。</span>' +
        '<button type="button" class="btn ghost" id="mine-cancel">取消</button>' +
        '<button type="button" class="btn ghost danger" id="mine-confirm-yes">确认清空</button></div>' +
        '<div class="mine-tip" id="mine-tip"></div>' +
        '</div>';

      html += '<div id="mine-list"></div>';

      html += '<div class="mine-privacy">' +
        U.card('关于这些记录',
          '<dl class="kv" style="grid-template-columns:92px 1fr">' +
          '<dt>存在何处</dt><dd>' + (ok ? '本机浏览器的 localStorage（键名 <code>xuanjian.history.v1</code>）' : '<b>当前环境不支持本地存储，仅保存在本次会话内存中，刷新即失</b>') + '</dd>' +
          '<dt>记些什么</dt><dd>时间、去往的功能、原始问句、参数摘要与可重放链接；不记录姓名、账号，也不采集输入之外的任何信息</dd>' +
          '<dt>保留多少</dt><dd>最多 ' + H.max + ' 条，超出自动淘汰最旧的</dd>' +
          '<dt>如何删除</dt><dd>单条点「删除」，或「清空记录」；亦可在浏览器设置中清除本站数据</dd>' +
          '</dl>' +
          '<p class="small muted" style="margin-top:12px">无痕／隐私窗口下浏览器可能禁用本地存储，此时页面会明确提示「仅存于本次会话」。更换浏览器或设备不会同步记录。</p>',
          '隐私') +
        '</div>';
      return html;
    },

    after: function () {
      var box = document.getElementById('mine-list');
      var q = document.getElementById('mine-q');
      var sel = document.getElementById('mine-filter');
      var tip = document.getElementById('mine-tip');
      var confirmBar = document.getElementById('mine-confirm');
      if (!box) return;

      /* 功能筛选项只初始化一次，避免重绘丢状态 */
      if (sel && sel.options && sel.options.length <= 1) {
        var seen = {};
        H.all().forEach(function (x) {
          if (seen[x.route]) return;
          seen[x.route] = 1;
          var f = null;
          if (root.XJIntent) root.XJIntent.functions.forEach(function (y) { if (y.id === x.route) f = y; });
          var o = document.createElement('option');
          o.value = x.route;
          o.textContent = f ? f.name : x.route;
          if (sel.appendChild) sel.appendChild(o);
        });
      }

      function current() {
        var kw = q && q.value ? String(q.value).replace(/^\s+|\s+$/g, '').toLowerCase() : '';
        var route = sel && sel.value ? sel.value : '';
        return H.all().filter(function (x) {
          if (route && x.route !== route) return false;
          if (!kw) return true;
          var hay = [x.text, x.summary, x.title, x.arg, x.route].join(' ').toLowerCase();
          CHIP_KEYS.forEach(function (k) { if (x.params && x.params[k] != null) hay += ' ' + String(x.params[k]); });
          return hay.indexOf(kw) >= 0;
        });
      }

      function repaint() {
        var all = H.all();
        if (!all.length) { box.innerHTML = emptyHtml(); if (tip) tip.innerHTML = ''; return; }
        var list = current();
        box.innerHTML = listHtml(list);
        if (tip) tip.innerHTML = '共 ' + all.length + ' 条记录' + (list.length !== all.length ? '，筛出 ' + list.length + ' 条' : '') + '。';
        bind();
      }

      function bind() {
        if (!box.querySelectorAll) return;
        Array.prototype.forEach.call(box.querySelectorAll('[data-del]'), function (b) {
          U.on(b, 'click', function () {
            H.remove(b.getAttribute('data-del'));
            repaint();
          });
        });
      }

      if (q) U.on(q, 'input', repaint);
      if (sel) U.on(sel, 'change', repaint);

      var ex = document.getElementById('mine-export');
      if (ex) U.on(ex, 'click', function () {
        var text = H.export('json');
        try {
          var blob = new root.Blob([text], { type: 'application/json;charset=utf-8' });
          var url = root.URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url; a.download = '玄鉴-查询记录-' + new Date().toISOString().slice(0, 10) + '.json';
          if (document.body && document.body.appendChild) document.body.appendChild(a);
          if (a.click) a.click();
          if (root.URL.revokeObjectURL) setTimeout(function () { root.URL.revokeObjectURL(url); }, 1000);
        } catch (e) {
          if (tip) tip.innerHTML = '此环境不支持直接下载，可复制记录：' + esc(text.slice(0, 200)) + '…';
        }
      });

      var cl = document.getElementById('mine-clear');
      var cc = document.getElementById('mine-cancel');
      var cy = document.getElementById('mine-confirm-yes');
      if (cl && confirmBar) U.on(cl, 'click', function () { confirmBar.style.display = 'flex'; });
      if (cc && confirmBar) U.on(cc, 'click', function () { confirmBar.style.display = 'none'; });
      if (cy && confirmBar) U.on(cy, 'click', function () {
        H.clear(); confirmBar.style.display = 'none'; repaint();
      });

      repaint();
    }
  });
}(typeof window !== 'undefined' ? window : this));
