const CACHE_NAME = 'serra-cache-v5.5';
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './datos_visor.json',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(assets)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});