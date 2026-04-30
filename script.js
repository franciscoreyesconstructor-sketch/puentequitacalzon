/* ============================================
   SISTEMA DE MONITOREO Y AUDITORÍA
   PUENTE QUITACALZÓN
   DESARROLLADO POR: ANTONIO SERRA
   VERSIÓN: 17.0 FINAL - VISOR FIJO GARANTIZADO
   ============================================ */

var datosOriginales = [];
var datosFiltrados = [];
var posicionActual = 0;
var zFull = null;
var zUbi = null;
var zPieza = null;

// =============================================
// CORRECCIÓN AUTOMÁTICA DE COMAS DECIMALES
// =============================================
function corregirComasDecimales(datos) {
    if (!Array.isArray(datos)) return datos;
    
    return datos.map(function(item) {
        var nuevo = {};
        for (var key in item) {
            if (item.hasOwnProperty(key)) {
                var valor = item[key];
                if (typeof valor === 'string') {
                    nuevo[key] = valor.replace(/(\d),(\d)/g, '$1.$2');
                } else {
                    nuevo[key] = valor;
                }
            }
        }
        return nuevo;
    });
}

// =============================================
// CARGA DE DATOS
// =============================================
function cargarDatos() {
    try {
        if (typeof datosTecnicos === 'undefined') {
            throw new Error("Variable 'datosTecnicos' no encontrada");
        }
        if (!Array.isArray(datosTecnicos)) {
            throw new Error("'datosTecnicos' no es un array válido");
        }
        if (datosTecnicos.length === 0) {
            throw new Error("El array de datos técnicos está vacío");
        }
        
        datosOriginales = corregirComasDecimales(datosTecnicos);
        console.log("✅ Sistema cargado: " + datosOriginales.length + " registros");
        
        poblarSelectModulo();
        aplicarFiltros();
        inicializarZoomsMiniaturas();
        forzarAlturaVisor();
    } catch (error) {
        console.error("❌ ERROR:", error.message);
        mostrarError(error.message);
    }
}

// =============================================
// FORZAR ALTURA FIJA DEL VISOR
// =============================================
function forzarAlturaVisor() {
    var visor = document.querySelector('.visor-imagenes');
    if (visor) {
        visor.style.height = '160px';
        visor.style.minHeight = '160px';
        visor.style.maxHeight = '160px';
        visor.style.overflow = 'hidden';
    }
}

// =============================================
// MOSTRAR ERROR EN PANTALLA
// =============================================
function mostrarError(mensaje) {
    document.body.innerHTML = 
        '<div style="background:#b30000;color:white;padding:30px;margin:20px;border-radius:15px;text-align:center;font-family:sans-serif;">' +
        '<h2 style="margin-bottom:15px;">⚠️ Error de Carga</h2>' +
        '<p style="margin-bottom:10px;">' + mensaje + '</p>' +
        '<p style="font-size:14px;opacity:0.9;">Verifique que el archivo <strong>datos_visor.js</strong> esté en la misma carpeta que index.html</p>' +
        '<button onclick="location.reload()" style="margin-top:20px;padding:12px 30px;background:#ffcc00;border:none;border-radius:8px;font-weight:bold;font-size:16px;color:#000;">REINTENTAR</button>' +
        '</div>';
}

// =============================================
// GESTIÓN DEL SELECTOR DE MÓDULOS
// =============================================
function poblarSelectModulo() {
    var selector = document.getElementById("filtro-modulo");
    if (!selector) return;
    
    var modulosUnicos = [];
    for (var i = 0; i < datosOriginales.length; i++) {
        var mod = String(datosOriginales[i].Modulo || datosOriginales[i].modulo || "").trim();
        if (mod !== "" && mod !== "undefined" && modulosUnicos.indexOf(mod) === -1) {
            modulosUnicos.push(mod);
        }
    }
    
    modulosUnicos.sort(function(a, b) {
        return parseInt(a) - parseInt(b);
    });
    
    selector.innerHTML = '<option value="todos">📦 TODOS LOS MÓDULOS</option>';
    
    for (var j = 0; j < modulosUnicos.length; j++) {
        var opcion = document.createElement("option");
        opcion.value = modulosUnicos[j];
        opcion.textContent = 'MÓDULO ' + modulosUnicos[j];
        selector.appendChild(opcion);
    }
    
    selector.onchange = function() {
        aplicarFiltros();
        forzarAlturaVisor();
    };
}

// =============================================
// FILTRADO Y ORDEN LÓGICO POR PASO
// =============================================
function aplicarFiltros() {
    var selector = document.getElementById("filtro-modulo");
    if (!selector) return;
    
    var valorSeleccionado = selector.value;
    
    if (valorSeleccionado === "todos") {
        datosFiltrados = datosOriginales.slice();
    } else {
        datosFiltrados = [];
        for (var i = 0; i < datosOriginales.length; i++) {
            if (String(datosOriginales[i].Modulo || datosOriginales[i].modulo || "").trim() === valorSeleccionado) {
                datosFiltrados.push(datosOriginales[i]);
            }
        }
    }
    
    datosFiltrados.sort(function(a, b) {
        var pasoA = parseInt(a.Paso || a.paso || 0);
        var pasoB = parseInt(b.Paso || b.paso || 0);
        return pasoA - pasoB;
    });
    
    posicionActual = 0;
    actualizarInterfaz();
}

// =============================================
// ACTUALIZACIÓN DE PANTALLA PRINCIPAL
// =============================================
function actualizarInterfaz() {
    // Forzar altura fija del visor antes de actualizar
    forzarAlturaVisor();
    
    if (datosFiltrados.length === 0) return;
    
    var registro = datosFiltrados[posicionActual];
    if (!registro) return;
    
    var idPieza = String(registro["Pieza individual"] || "").trim();
    var numeroModulo = String(registro.Modulo || registro.modulo || "").trim();
    var moduloFmt = numeroModulo.length === 1 ? "0" + numeroModulo : numeroModulo;

    document.getElementById("pieza-titulo").innerText = "PIEZA: " + idPieza;
    document.getElementById("num-paso").innerText = registro.Paso || registro.paso || "0";
    document.getElementById("dato-modulo-linea").innerText = numeroModulo;
    document.getElementById("dato-posicion-pieza").innerText = registro["Ubicación pieza"] || "--";
    document.getElementById("dato-perno").innerText = registro["Tipo Perno"] || "--";
    document.getElementById("dato-estandar").innerText = registro["stdtuerca"] || "--";
    document.getElementById("dato-torque").innerText = registro["Par apriete (N.m) (Torque)"] || "0";
    document.getElementById("dato-largo").innerText = registro["Largo (mm)"] || "0";
    document.getElementById("dato-ancho").innerText = registro["Ancho (mm)"] || "0";
    document.getElementById("dato-alto").innerText = registro["Alto (mm)"] || "0";
    document.getElementById("indicador-indice").innerText = (posicionActual + 1) + " / " + datosFiltrados.length;

    var imgMapa = document.getElementById("img-mapa");
    var imgVisor = document.getElementById("img-visor");
    if (imgMapa) imgMapa.src = "fotos/mod" + moduloFmt + idPieza + ".jpg";
    if (imgVisor) imgVisor.src = "fotos/" + idPieza + ".jpg";
    
    resetearZoomMiniaturas();
    
    // Reforzar altura después de cargar imágenes
    setTimeout(forzarAlturaVisor, 100);
}

// =============================================
// SISTEMA DE ZOOM (PINCH ZOOM) - CORREGIDO
// =============================================
function inicializarZoomsMiniaturas() {
    try {
        var contenedores = document.querySelectorAll(".contenedor-img");
        
        if (contenedores.length >= 2) {
            if (typeof PinchZoom === 'undefined') {
                console.warn("⚠️ PinchZoom no disponible");
                return;
            }
            
            if (typeof PinchZoom.default === 'function') {
                zUbi = new PinchZoom.default(contenedores[0], { 
                    tapZoomFactor: 2, 
                    maxZoom: 4, 
                    minZoom: 1,
                    use2d: true 
                });
                zPieza = new PinchZoom.default(contenedores[1], { 
                    tapZoomFactor: 2, 
                    maxZoom: 4, 
                    minZoom: 1,
                    use2d: true 
                });
                console.log("🔍 Zoom inicializado");
            } else if (typeof PinchZoom === 'function') {
                zUbi = new PinchZoom(contenedores[0], { 
                    tapZoomFactor: 2, 
                    maxZoom: 4, 
                    minZoom: 1 
                });
                zPieza = new PinchZoom(contenedores[1], { 
                    tapZoomFactor: 2, 
                    maxZoom: 4, 
                    minZoom: 1 
                });
                console.log("🔍 Zoom inicializado (modo alternativo)");
            }
        }
    } catch (e) {
        console.warn("⚠️ Error al inicializar zoom:", e.message);
    }
}

function resetearZoomMiniaturas() {
    try {
        if (zUbi && typeof zUbi.setZoom === "function") zUbi.setZoom(1);
        if (zPieza && typeof zPieza.setZoom === "function") zPieza.setZoom(1);
    } catch (e) {}
}

function abrirZoomDetalle(idElemento, titulo) {
    console.log("🔍 Abriendo zoom: " + idElemento);
    
    var origen = document.getElementById(idElemento);
    if (!origen || !origen.src) return;
    
    var imgZoom = document.getElementById("img-zoom-full");
    var tituloZoom = document.getElementById("titulo-zoom-modal");
    var modal = document.getElementById("modal-zoom-detallado");
    
    if (!imgZoom || !modal) return;
    
    imgZoom.src = origen.src;
    if (tituloZoom) tituloZoom.innerText = titulo;
    modal.style.display = "flex";
    
    imgZoom.onload = function() {
        setTimeout(function() {
            try {
                var wrapper = document.getElementById('wrapper-zoom-detalle');
                if (!wrapper) return;
                
                if (zFull && typeof zFull.destroy === "function") {
                    zFull.destroy();
                }
                zFull = null;
                
                if (typeof PinchZoom !== 'undefined') {
                    if (typeof PinchZoom.default === 'function') {
                        zFull = new PinchZoom.default(wrapper, { 
                            tapZoomFactor: 2, 
                            maxZoom: 6, 
                            minZoom: 1,
                            use2d: true 
                        });
                    } else if (typeof PinchZoom === 'function') {
                        zFull = new PinchZoom(wrapper, { 
                            tapZoomFactor: 2, 
                            maxZoom: 6, 
                            minZoom: 1 
                        });
                    }
                }
            } catch (e) {}
        }, 200);
    };
    
    if (imgZoom.complete) imgZoom.onload();
}

function cerrarZoomDetalle() {
    if (zFull && typeof zFull.destroy === "function") zFull.destroy();
    zFull = null;
    var modal = document.getElementById("modal-zoom-detallado");
    if (modal) modal.style.display = "none";
}

// =============================================
// MANUAL PDF
// =============================================
function abrirManual() {
    window.open('mtmi.pdf', '_blank');
}

// =============================================
// CONFIGURACIÓN DE BOTONES
// =============================================
function configurarBotones() {
    var btnSig = document.getElementById("btn-siguiente");
    var btnAnt = document.getElementById("btn-atras");
    
    if (btnSig) {
        btnSig.onclick = function() {
            if (posicionActual < datosFiltrados.length - 1) {
                posicionActual++;
                actualizarInterfaz();
                forzarAlturaVisor();
            }
        };
        console.log("✅ Botón SIGUIENTE configurado");
    }
    
    if (btnAnt) {
        btnAnt.onclick = function() {
            if (posicionActual > 0) {
                posicionActual--;
                actualizarInterfaz();
                forzarAlturaVisor();
            }
        };
        console.log("✅ Botón ANTERIOR configurado");
    }
}

// =============================================
// PRECARGA MANUAL DE ARCHIVOS
// =============================================
function precargarArchivos() {
    var btn = document.getElementById('btn-precargar');
    var estado = document.getElementById('estado-precarga');
    
    if (!btn || !estado) return;
    
    btn.disabled = true;
    btn.style.opacity = '0.7';
    btn.innerText = '⏳ VERIFICANDO...';
    estado.innerText = 'Comprobando conexión con el sistema...';
    
    function iniciarPrecarga() {
        if (navigator.serviceWorker.controller) {
            btn.innerText = '⏳ DESCARGANDO...';
            estado.innerText = 'Esto puede tardar unos minutos. No cierres la página.';
            
            navigator.serviceWorker.controller.postMessage({
                action: 'precacheAll'
            });
            
            var intentos = 0;
            var intervalo = setInterval(function() {
                verificarCacheEstado();
                intentos++;
                if (intentos > 36) {
                    clearInterval(intervalo);
                    btn.classList.add('completado');
                    btn.innerText = '✅ COMPLETADO';
                    estado.innerText = '🎉 ¡App lista para usar sin conexión!';
                    btn.disabled = false;
                    btn.style.opacity = '1';
                }
            }, 5000);
        } else {
            estado.innerText = '⚠️ Esperando activación del sistema...';
            setTimeout(iniciarPrecarga, 1000);
        }
    }
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(function() {
            iniciarPrecarga();
        }).catch(function() {
            iniciarPrecarga();
        });
    } else {
        estado.innerText = '⚠️ Service Worker no soportado.';
        btn.disabled = false;
        btn.style.opacity = '1';
    }
}

// =============================================
// VERIFICAR ESTADO DE CACHÉ
// =============================================
function verificarCacheEstado() {
    var btn = document.getElementById('btn-precargar');
    var estado = document.getElementById('estado-precarga');
    
    if (!btn || !estado) return;
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        var channel = new MessageChannel();
        
        channel.port1.onmessage = function(event) {
            if (event.data.status === 'ready') {
                var cached = event.data.cachedFiles;
                var total = event.data.totalFiles;
                var porcentaje = Math.round((cached / total) * 100);
                
                estado.innerText = '📦 ' + cached + ' de ' + total + ' archivos (' + porcentaje + '%)';
                
                if (cached >= total * 0.9) {
                    btn.classList.add('completado');
                    btn.innerText = '✅ ' + cached + ' ARCHIVOS DESCARGADOS';
                    estado.innerText = '🎉 ¡App lista para usar sin conexión!';
                    btn.disabled = false;
                    btn.style.opacity = '1';
                }
            }
        };
        
        navigator.serviceWorker.controller.postMessage(
            { action: 'checkCache' },
            [channel.port2]
        );
    }
}

// =============================================
// VERIFICAR CACHÉ AL INICIAR
// =============================================
function verificarCacheAlIniciar() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        var channel = new MessageChannel();
        
        channel.port1.onmessage = function(event) {
            if (event.data.status === 'ready') {
                var cached = event.data.cachedFiles;
                var total = event.data.totalFiles;
                
                if (cached < total * 0.5) {
                    console.log('📦 Iniciando precarga automática...');
                    navigator.serviceWorker.controller.postMessage({
                        action: 'precacheAll'
                    });
                } else {
                    console.log('✅ ' + cached + ' archivos en caché');
                }
            }
        };
        
        navigator.serviceWorker.controller.postMessage(
            { action: 'checkCache' },
            [channel.port2]
        );
    }
}

// =============================================
// ESCUCHAR MENSAJES DEL SERVICE WORKER
// =============================================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'progress') {
            actualizarIndicadorDescarga(event.data.porcentaje, event.data.completados, event.data.total, false);
        }
        
        if (event.data && event.data.type === 'complete') {
            actualizarIndicadorDescarga(100, event.data.completados, event.data.total, true);
            
            setTimeout(function() {
                var indicador = document.getElementById('indicador-descarga');
                if (indicador) indicador.style.display = 'none';
            }, 5000);
        }
    });
}

// =============================================
// ACTUALIZAR INDICADOR VISUAL DE DESCARGA
// =============================================
function actualizarIndicadorDescarga(porcentaje, completados, total, terminado) {
    var barra = document.getElementById('barra-progreso-descarga');
    var texto = document.getElementById('texto-progreso-descarga');
    var indicador = document.getElementById('indicador-descarga');
    
    if (!indicador) return;
    
    indicador.style.display = 'block';
    
    if (terminado) {
        if (barra) { barra.style.width = '100%'; barra.style.backgroundColor = '#4CAF50'; }
        if (texto) { texto.innerText = '✅ ' + completados + ' archivos descargados. ¡App lista sin conexión!'; texto.style.color = '#4CAF50'; }
    } else {
        if (barra) barra.style.width = porcentaje + '%';
        if (texto) texto.innerText = '📥 Descargando: ' + completados + ' de ' + total + ' archivos (' + porcentaje + '%)';
    }
}

// =============================================
// INICIO AUTOMÁTICO
// =============================================
window.addEventListener('load', function() {
    console.log("🚀 INICIANDO SISTEMA PUENTE QUITACALZÓN...");
    
    cargarDatos();
    configurarBotones();
    forzarAlturaVisor();
    
    setTimeout(function() {
        verificarCacheAlIniciar();
    }, 3000);
    
    // Reforzar altura del visor cada segundo durante 5 segundos
    for (var i = 1; i <= 5; i++) {
        setTimeout(forzarAlturaVisor, i * 1000);
    }
    
    console.log("✅ SISTEMA LISTO");
});

setTimeout(function() {
    configurarBotones();
}, 1000);

// Reforzar altura al cambiar tamaño de ventana
window.addEventListener('resize', forzarAlturaVisor);
