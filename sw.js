const CACHE_NAME = 'serra-cache-v6.0';
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './datos_visor.js',
  './pinch-zoom.js',
  './mtmi.pdf',
  './manifest.json',
  './fotos/ubimod.jpg'  // Asegúrate que existe
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(assets))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(res => res || fetch(e.request).then(resp => {
        if(!resp || resp.status !== 200) return resp;
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return resp;
      }))
  );
});
