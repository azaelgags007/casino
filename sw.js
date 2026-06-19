// ── SERVICE WORKER — Casino Royal ────────────────────────────
const CACHE = 'casino-royal-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/core/deck.js',
  '/js/core/stats.js',
  '/js/core/app.js',
  '/js/games/adivina.js',
  '/js/games/blackjack.js',
  '/js/games/memory.js',
  '/js/games/cards2048.js',
  '/js/games/poker.js',
  '/js/games/yahtzee.js',
  '/js/games/ruleta.js',
  '/js/games/slots.js',
  '/js/games/guerra.js',
  '/js/games/bingo.js',
  '/js/games/solitario.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // Cache same-origin requests
        if (e.request.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
