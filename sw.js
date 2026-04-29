/* ============================================
   SERVICE WORKER - PUENTE QUITACALZÓN
   VERSIÓN: FINAL - PRECARGA AUTOMÁTICA TOTAL
   ============================================ */

const CACHE_NAME = 'puente-qc-completo-v1.0';

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

// Lista de todas las piezas únicas del puente
const piezasUnicas = [
  '60IC15W', '60IC16W', '60IC17W',
  '60VP01W', '60VP02W', '60VP03W',
  '60VD01W', '60VD02W',
  '60TS01W',
  '60SP01',
  '60SC01W', '60SC02W', '60SC09W',
  'SB01', 'LB04W',
  'DK07', 'EJ02'
];

// Generar todas las rutas de imágenes posibles
function generarRutasImagenes() {
  const rutas = [];
  
  // Para cada módulo del 1 al 21
  for (let modulo = 1; modulo <= 21; modulo++) {
    const modFmt = String(modulo).padStart(2, '0');
    
    // Imágenes de ubicación: modXX + código de pieza
    for (let i = 0; i < piezasUnicas.length; i++) {
      rutas.push('./fotos/mod' + modFmt + piezasUnicas[i] + '.jpg');
    }
  }
  
  // Imágenes individuales de cada pieza
  for (let j = 0; j < piezasUnicas.length; j++) {
    rutas.push('./fotos/' + piezasUnicas[j] + '.jpg');
  }
  
  // Agregar variantes comunes que pueden faltar
  const extras = [
    './fotos/mod01DK07.jpg',
    './fotos/mod21EJ02.jpg',
    './fotos/ubimod.jpg'
  ];
  
  for (let k = 0; k < extras.length; k++) {
    if (rutas.indexOf(extras[k]) === -1) {
      rutas.push(extras[k]);
    }
  }
  
  return rutas;
}

// Combinar todo
const todasLasRutas = archivosBase.concat(generarRutasImagenes());

console.log('📦 SW: Total archivos a precargar: ' + todasLasRutas.length);

// ============================================
// FUNCIÓN: PRECARGAR EN LOTES
// ============================================
function precargarEnLotes(cache, urls, tamanoLote) {
  tamanoLote = tamanoLote || 10;
  let promesa = Promise.resolve();
  let completados = 0;
  let fallidos = 0;
  
  for (let i = 0; i < urls.length; i += tamanoLote) {
    const lote = urls.slice(i, i + tamanoLote);
    const numLote = Math.floor(i / tamanoLote) + 1;
    const totalLotes = Math.ceil(urls.length / tamanoLote);
    
    promesa = promesa.then(function() {
      return Promise.allSettled(
        lote.map(function(url) {
          return cache.add(url).then(function() {
            completados++;
            return { ok: true, url: url };
          }).catch(function() {
            fallidos++;
            return { ok: false, url: url };
          });
        })
      ).then(function() {
        const porcentaje = Math.round(((completados + fallidos) / urls.length) * 100);
        console.log('📥 Lote ' + numLote + '/' + totalLotes + ' | ' + porcentaje + '% | ✅ ' + completados + ' ❌ ' + fallidos);
        
        // Enviar progreso a la página
        self.clients.matchAll().then(function(clients) {
          clients.forEach(function(client) {
            client.postMessage({
              type: 'progress',
              completados: completados,
              fallidos: fallidos,
              total: urls.length,
              porcentaje: porcentaje
            });
          });
        });
      });
    });
  }
  
  return promesa.then(function() {
    console.log('✅ PRECARGA COMPLETADA: ' + completados + ' archivos en caché');
    return { completados: completados, fallidos: fallidos, total: urls.length };
  });
}

// ============================================
// EVENTO: INSTALL
// ============================================
self.addEventListener('install', function(event) {
  console.log('⚡ SW: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('📦 Iniciando precarga de ' + todasLasRutas.length + ' archivos...');
      return precargarEnLotes(cache, todasLasRutas, 10);
    }).then(function(resultado) {
      console.log('🎉 SW: Instalación completada. ' + resultado.completados + ' archivos listos.');
      return self.skipWaiting();
    }).catch(function(error) {
      console.error('❌ SW: Error en instalación:', error);
    })
  );
});

// ============================================
// EVENTO: ACTIVATE
// ============================================
self.addEventListener('activate', function(event) {
  console.log('🚀 SW: Activado');
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          console.log('🗑️ Eliminando cache antiguo: ' + name);
          return caches.delete(name);
        })
      );
    }).then(function() {
      // Tomar control de todas las pestañas inmediatamente
      return self.clients.claim();
    })
  );
});

// ============================================
// EVENTO: FETCH (Estrategia Cache First)
// ============================================
self.addEventListener('fetch', function(event) {
  // Solo cachear peticiones GET de nuestro dominio
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      if (cachedResponse) {
        // Devuelve desde caché
        return cachedResponse;
      }
      
      // Si no está en caché, descargar y guardar
      return fetch(event.request).then(function(response) {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Guardar copia en caché
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
        
        return response;
      }).catch(function(error) {
        console.warn('⚠️ Sin conexión: ' + event.request.url);
        
        // Si es navegación, devolver index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        
        // Si es imagen, devolver placeholder
        if (event.request.destination === 'image') {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#333" width="200" height="200"/><text fill="#ffcc00" font-size="20" x="50" y="100">Sin imagen</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
      });
    })
  );
});

// ============================================
// EVENTO: MESSAGE (Comunicación con la página)
// ============================================
self.addEventListener('message', function(event) {
  // Verificar estado de caché
  if (event.data && event.data.action === 'checkCache') {
    caches.open(CACHE_NAME).then(function(cache) {
      cache.keys().then(function(keys) {
        event.ports[0].postMessage({
          status: 'ready',
          cachedFiles: keys.length,
          totalFiles: todasLasRutas.length
        });
      });
    });
  }
  
  // Forzar precarga manual
  if (event.data && event.data.action === 'precacheAll') {
    console.log('📥 Iniciando precarga manual...');
    event.waitUntil(
      caches.open(CACHE_NAME).then(function(cache) {
        return precargarEnLotes(cache, todasLasRutas, 10);
      }).then(function(resultado) {
        console.log('✅ Precarga manual completada: ' + resultado.completados + ' archivos');
        
        // Notificar a todas las pestañas
        self.clients.matchAll().then(function(clients) {
          clients.forEach(function(client) {
            client.postMessage({
              type: 'complete',
              completados: resultado.completados,
              total: resultado.total
            });
          });
        });
      })
    );
  }
  
  // Obtener lista de archivos cacheados
  if (event.data && event.data.action === 'getCachedList') {
    caches.open(CACHE_NAME).then(function(cache) {
      cache.keys().then(function(keys) {
        const urls = keys.map(function(key) { return key.url; });
        event.ports[0].postMessage({
          status: 'list',
          urls: urls,
          count: urls.length
        });
      });
    });
  }
});

console.log('✅ SW: Listo y esperando eventos');
