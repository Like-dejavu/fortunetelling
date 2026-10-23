/* 玄鉴 · 离线与「加到主屏幕」支持
   只在 http/https 下注册 Service Worker；file:// 打开时静默跳过，
   站点照常可用，只是不能离线缓存。 */
(function () {
  if (typeof navigator === 'undefined' || !navigator.serviceWorker) return;
  var proto = (location && location.protocol) || '';
  if (proto !== 'http:' && proto !== 'https:') return;
  if (typeof window === 'undefined' || !window.addEventListener) return;

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').then(function () {
      /* 有更新时常驻用户不会自动刷新，这里只在首次安装时记录 */
    }).catch(function () { /* 忽略：注册失败不影响使用 */ });
  });
})();
