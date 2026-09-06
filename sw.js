/* かしかろぐ - 最小構成のService Worker
   キャッシュ処理でエラーが起きてもアプリ本体の動作に影響しないよう、
   すべての処理をtry-catchで保護しています。 */

var CACHE_NAME = 'kashikalog-cache-v1';
var ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', function (event) {
  try {
    event.waitUntil(
      caches.open(CACHE_NAME).then(function (cache) {
        return cache.addAll(ASSETS_TO_CACHE).catch(function () {
          /* 一部アセットのキャッシュに失敗してもインストールは継続 */
        });
      }).catch(function () { /* noop */ })
    );
  } catch (e) { /* noop */ }
  try { self.skipWaiting(); } catch (e) { /* noop */ }
});

self.addEventListener('activate', function (event) {
  try {
    event.waitUntil(
      caches.keys().then(function (keys) {
        return Promise.all(
          keys.map(function (key) {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
            return null;
          })
        );
      }).catch(function () { /* noop */ })
    );
  } catch (e) { /* noop */ }
  try { self.clients.claim(); } catch (e) { /* noop */ }
});

self.addEventListener('fetch', function (event) {
  try {
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        if (cached) return cached;
        return fetch(event.request).catch(function () {
          return cached;
        });
      }).catch(function () {
        return fetch(event.request);
      })
    );
  } catch (e) {
    /* 何もしない：ブラウザの標準フェッチに委ねる */
  }
});
