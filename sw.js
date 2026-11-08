/* ============================================================
   玄鉴 · Service Worker
   策略：在线优先（network-first）+ 后台更新缓存；断网时读缓存。
   这样既能离线运行，又不会让手机一直看到旧版页面。
   注意：改动任何静态资源后，请把 CACHE 版本号 +1，否则旧缓存不会主动失效。
   ============================================================ */
var CACHE = 'xuanjian-v1';

var PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/style.css',
  './assets/img/favicon.svg',
  './assets/img/taiji.svg',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',
  './assets/img/icon-maskable-512.png',
  './assets/img/apple-touch-icon.png',
  './assets/js/lib/calendar.js',
  './assets/js/lib/lunar.js',
  './assets/js/lib/bazi.js',
  './assets/js/lib/liuyao.js',
  './assets/js/lib/meihua.js',
  './assets/js/lib/ziwei.js',
  './assets/js/lib/heluo.js',
  './assets/js/lib/xiang.js',
  './assets/js/data/hexagrams.js',
  './assets/js/data/dreams.js',
  './assets/js/data/daodejing.js',
  './assets/js/app.js',
  './assets/js/intent.js',
  './assets/js/history.js',
  './assets/js/views/home.js',
  './assets/js/views/bazi.js',
  './assets/js/views/divine.js',
  './assets/js/views/ziwei.js',
  './assets/js/views/xiang.js',
  './assets/js/views/dream.js',
  './assets/js/views/daodejing.js',
  './assets/js/views/mine.js',
  './assets/js/views/portal.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(PRECACHE);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k !== CACHE;
      }).map(function (k) {
        return caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok && res.type === 'basic') {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        if (hit) return hit;
        if (req.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      });
    })
  );
});
