/* 玄鉴 · 离线缓存
   只在 http/https 下注册（file:// 不支持 Service Worker）。
   本站是纯静态站点，缓存全部即缓存全站。 */
var CACHE = 'xuanjian-v3';
var ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'assets/css/style.css',
  'assets/img/favicon.svg',
  'assets/img/icon-192.png',
  'assets/img/icon-512.png',
  'assets/img/apple-touch-icon.png',
  'assets/js/pwa.js',
  'assets/js/app.js',
  'assets/js/lib/calendar.js',
  'assets/js/lib/lunar.js',
  'assets/js/lib/bazi.js',
  'assets/js/lib/liuyao.js',
  'assets/js/lib/meihua.js',
  'assets/js/lib/ziwei.js',
  'assets/js/lib/heluo.js',
  'assets/js/lib/xiang.js',
  'assets/js/lib/cezi.js',
  'assets/js/lib/modern.js',
  'assets/js/lib/ask.js',
  'assets/js/data/hexagrams.js',
  'assets/js/data/dreams.js',
  'assets/js/data/daodejing.js',
  'assets/js/data/hanzi.js',
  'assets/js/data/cezi-text.js',
  'assets/js/views/home.js',
  'assets/js/views/bazi.js',
  'assets/js/views/divine.js',
  'assets/js/views/ziwei.js',
  'assets/js/views/xiang.js',
  'assets/js/views/dream.js',
  'assets/js/views/daodejing.js',
  'assets/js/views/cezi.js',
  'assets/js/views/ask.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      /* 逐个加入：某一项失败不致整体失败 */
      return Promise.all(ASSETS.map(function (u) {
        return c.add(new Request(u, { cache: 'reload' })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  /* 页面导航：网络优先，断网回缓存 */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match('index.html');
        });
      })
    );
    return;
  }

  /* 静态资源：缓存优先 */
  e.respondWith(
    caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return hit; });
    })
  );
});
