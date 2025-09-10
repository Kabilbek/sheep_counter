const CACHE_NAME = 'sheep-pwa-v1';
const PRECACHE_URLS = [
  'index.html',
  'manifest.json',
  'service-worker.js',
  'libs/tf.min.js',
  'libs/coco-ssd.min.js',
  'icons/icon-192.png',
  'icons/icon-512.png'
  // егер модельді локалға салсаңыз: 'model/model.json', 'model/group1-shard1of1.bin', ...
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => (k !== CACHE_NAME) ? caches.delete(k) : null)
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request).then(fetchResp => {
        // опционалды түрде runtime кэшке салуға болады:
        caches.open(CACHE_NAME).then(cache => {
          try { cache.put(event.request, fetchResp.clone()); } catch(e) {}
        });
        return fetchResp;
      }).catch(() => {
        // офлайн кезінде index.html қайтару (навигация үшін)
        if (event.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});
