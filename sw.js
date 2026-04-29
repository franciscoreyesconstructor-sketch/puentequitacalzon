const CACHE_NAME = 'puente-qc-v2.0';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './datos_visor.js',
  './pinch-zoom.js',
  './mtmi.pdf',
  './manifest.json',
  './icono-192.png'
];

// INSTALACIÓN: Precarga todos los archivos
self.addEventListener('install', event => {
  console.log('⚡ Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Precargando ' + urlsToCache.length + ' archivos...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Todos los archivos precargados correctamente');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Error al precargar:', error);
      })
  );
});

// ACTIVACIÓN: Limpiar caches viejos
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('🗑️ Eliminando cache antiguo:', name);
            return caches.delete(name);
          })
      );
    })
  );
});

// FETCH: Servir desde caché primero, luego red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve de caché si existe
        if (response) {
          return response;
        }
        
        // Si no está en caché, intenta descargarlo
        return fetch(event.request)
          .then(response => {
            // Guardar en caché para la próxima
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseClone);
                  console.log('💾 Nuevo archivo cacheado:', event.request.url);
                });
            }
            return response;
          })
          .catch(error => {
            console.warn('⚠️ Sin conexión, archivo no disponible:', event.request.url);
            // Si falla todo, devuelve página offline
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
  );
});

// MENSAJE: Comunicación con la página
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'checkCache') {
    caches.open(CACHE_NAME).then(cache => {
      cache.keys().then(keys => {
        const cachedUrls = keys.map(key => key.url);
        event.ports[0].postMessage({
          status: 'ready',
          cachedFiles: cachedUrls.length,
          urls: cachedUrls
        });
      });
    });
  }
  
  if (event.data && event.data.action === 'precacheAll') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urlsToCache))
        .then(() => {
          console.log('✅ Precarga manual completada');
        })
    );
  }
});
