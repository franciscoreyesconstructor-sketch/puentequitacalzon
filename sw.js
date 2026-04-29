const CACHE_NAME = 'puente-qc-v3.0';

// Archivos base que siempre deben estar disponibles
const archivosBase = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './datos_visor.js',
  './pinch-zoom.js',
  './mtmi.pdf',
  './manifest.json',
  './icono-192.png',
  './fotos/ubimod.jpg'
];

// Función para generar todas las rutas de imágenes
function generarRutasImagenes() {
  const rutas = [];
  
  // Recorremos los módulos del 1 al 21
  for (let modulo = 1; modulo <= 21; modulo++) {
    const modFmt = String(modulo).padStart(2, '0');
    
    // Lista de piezas que aparecen en los datos
    const piezas = [
      '60IC15W', '60IC16W', '60IC17W',
      '60VP01W', '60VP02W', '60VP03W',
      '60VD01W', '60VD02W',
      '60TS01W',
      '60SP01',
      '60SC01W', '60SC02W', '60SC09W',
      'SB01', 'LB04W',
      'DK07', 'EJ02'
    ];
    
    // Agregar imágenes de ubicación (modXX + código de pieza)
    for (let j = 0; j < piezas.length; j++) {
      rutas.push('./fotos/mod' + modFmt + piezas[j] + '.jpg');
    }
    
    // Agregar imágenes de pieza individual
    for (let k = 0; k < piezas.length; k++) {
      rutas.push('./fotos/' + piezas[k] + '.jpg');
    }
  }
  
  return rutas;
}

// Combinar archivos base + imágenes generadas
const todasLasRutas = archivosBase.concat(generarRutasImagenes());

// INSTALACIÓN: Precarga todos los archivos
self.addEventListener('install', event => {
  console.log('⚡ Service Worker: Instalando...');
  console.log('📦 Total de archivos a precargar: ' + todasLasRutas.length);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Precargar en lotes para no bloquear
        return precargarEnLotes(cache, todasLasRutas);
      })
      .then(() => {
        console.log('✅ Precarga completada');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Error en precarga:', error);
      })
  );
});

// Precargar archivos en lotes de 50
function precargarEnLotes(cache, urls) {
  const tamanoLote = 50;
  let promesa = Promise.resolve();
  
  for (let i = 0; i < urls.length; i += tamanoLote) {
    const lote = urls.slice(i, i + tamanoLote);
    promesa = promesa.then(() => {
      console.log('📥 Precargando lote ' + (Math.floor(i/tamanoLote) + 1) + ' de ' + Math.ceil(urls.length/tamanoLote));
      return Promise.allSettled(
        lote.map(url => 
          cache.add(url).catch(err => {
            console.warn('⚠️ No se pudo precargar: ' + url);
          })
        )
      );
    });
  }
  
  return promesa;
}

// ACTIVACIÓN
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

// FETCH: Estrategia Cache First
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then(response => {
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseClone);
                });
            }
            return response;
          })
          .catch(error => {
            console.warn('⚠️ Sin conexión: ' + event.request.url);
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
  );
});

// MENSAJES
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'checkCache') {
    caches.open(CACHE_NAME).then(cache => {
      cache.keys().then(keys => {
        event.ports[0].postMessage({
          status: 'ready',
          cachedFiles: keys.length,
          totalFiles: todasLasRutas.length
        });
      });
    });
  }
  
  if (event.data && event.data.action === 'precacheAll') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => precargarEnLotes(cache, todasLasRutas))
        .then(() => console.log('✅ Precarga manual completada'))
    );
  }
});
