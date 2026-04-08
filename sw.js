const CACHE = 'kings-delight-v1';
const PRECACHE = [
  '/',
  '/styles.css',
  '/assets/logo.png',
  '/js/config.js',
  '/js/state.js',
  '/js/cart.js',
  '/js/render.js',
  '/js/order.js',
  '/js/api.js',
  '/js/ui.js'
];

self.addEventListener('install', e =>
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE))
  )
);

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
