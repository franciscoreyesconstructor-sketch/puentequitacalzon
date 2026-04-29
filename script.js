/* SISTEMA DE MONITOREO Y AUDITORÍA - DESARROLLADO POR: ANTONIO SERRA
   VERSIÓN: 13.0 (FINAL - CON PRECARGA COMPLETA SIN CONEXIÓN)
*/

var datosOriginales = [];
var datosFiltrados = [];
var posicionActual = 0;
var zFull = null;
var zUbi = null;
var zPieza = null;

// =========================================
// CORRECCIÓN AUTOMÁTICA DE COMAS DECIMALES
// =========================================
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

// =========================================
// CARGA DE DATOS
// =========================================
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
        console.log("🔧 Comas decimales corregidas automáticamente");
        
        poblarSelectModulo();
        aplicarFiltros();
        inicializarZoomsMiniaturas();
        
    } catch (error) {
        console.error("❌ ERROR:", error.message);
        mostrarError(error.message);
    }
}

// =========================================
// MOSTRAR ERROR EN PANTALLA
// =========================================
function mostrarError(mensaje) {
    document.body.innerHTML = 
        '<div style="background:#b30000;color:white;padding:30px;margin:20px;border-radius:15px;text-align:center;font-family:sans-serif;">' +
        '<h2 style="margin-bottom:15px;">⚠️ Error de Carga</h2>' +
        '<p style="margin-bottom:10px;">' + mensaje + '</p>' +
        '<p style="font-size:14px;opacity:0.9;">Verifique que el archivo <strong>datos_visor.js</strong> esté en la misma carpeta que index.html</p>' +
        '<p style="font-size:12px;opacity:0.7;">Error: ' + mensaje + '</p>' +
        '<button onclick="location.reload()" style="margin-top:20px;padding:12px 30px;background:#ffcc00;border:none;border-radius:8px;font-weight:bold;font-size:16px;color:#000;">REINTENTAR</button>' +
        '</div>';
}

// =========================================
// GESTIÓN DEL SELECTOR DE MÓDULOS
// =========================================
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
    
    selector.onchange = aplicarFiltros;
}

// =========================================
// FILTRADO Y ORDEN LÓGICO POR PASO
// =========================================
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

// =========================================
// ACTUALIZACIÓN DE PANTALLA PRINCIPAL
// =========================================
function actualizarInterfaz() {
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
}

// =========================================
// SISTEMA DE ZOOM (PINCH ZOOM)
// =========================================
function inicializarZoomsMiniaturas() {
    try {
        var contenedores = document.querySelectorAll(".contenedor-img");
        if (contenedores.length >= 2 && typeof PinchZoom !== 'undefined' && PinchZoom.default) {
            zUbi = new PinchZoom.default(contenedores[0], { minZoom: 1, maxZoom: 4 });
            zPieza = new PinchZoom.default(contenedores[1], { minZoom: 1, maxZoom: 4 });
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
    var origen = document.getElementById(idElemento);
    if (!origen || !origen.src) return;
    
    document.getElementById("img-zoom-full").src = origen.src;
    document.getElementById("titulo-zoom-modal").innerText = titulo;
    document.getElementById("modal-zoom-detallado").style.display = "flex";
    
    setTimeout(function() {
        try {
            var wrapper = document.getElementById('wrapper-zoom-detalle');
            if (wrapper && typeof PinchZoom !== 'undefined' && PinchZoom.default) {
                if (!zFull) {
                    zFull = new PinchZoom.default(wrapper, { maxZoom: 6 });
                } else if (typeof zFull.setZoom === "function") {
                    zFull.setZoom(1);
                }
            }
        } catch (e) {}
    }, 100);
}

function cerrarZoomDetalle() {
    document.getElementById("modal-zoom-detallado").style.display = "none";
}

// =========================================
// MANUAL PDF
// =========================================
function abrirManual() {
    window.open('mtmi.pdf', '_blank');
}

// =========================================
// BOTONES DE NAVEGACIÓN
// =========================================
function configurarBotones() {
    var btnSig = document.getElementById("btn-siguiente");
    var btnAnt = document.getElementById("btn-atras");
    
    if (btnSig) {
        btnSig.onclick = function() {
            if (posicionActual < datosFiltrados.length - 1) {
                posicionActual++;
                actualizarInterfaz();
            }
        };
        console.log("✅ Botón SIGUIENTE configurado");
    }
    
    if (btnAnt) {
        btnAnt.onclick = function() {
            if (posicionActual > 0) {
                posicionActual--;
                actualizarInterfaz();
            }
        };
        console.log("✅ Botón ANTERIOR configurado");
    }
}

// =========================================
// PRECARGA DE ARCHIVOS SIN CONEXIÓN
// =========================================
function precargarArchivos() {
    var btn = document.getElementById('btn-precargar');
    var estado = document.getElementById('estado-precarga');
    
    if (!btn || !estado) return;
    
    btn.disabled = true;
    btn.style.opacity = '0.7';
    btn.innerText = '⏳ DESCARGANDO...';
    estado.innerText = 'Esto puede tardar unos minutos. No cierres la página.';
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            action: 'precacheAll'
        });
        
        var intentos = 0;
        var intervalo = setInterval(function() {
            verificarCache();
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
        estado.innerText = '⚠️ Service Worker no disponible. Recarga la página e intenta de nuevo.';
        btn.disabled = false;
        btn.style.opacity = '1';
    }
}

function verificarCache() {
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
                
                estado.innerText = '📦 ' + cached + ' de ' + total + ' archivos descargados (' + porcentaje + '%)';
                
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

// =========================================
// INICIO AUTOMÁTICO
// =========================================
window.addEventListener('load', function() {
    console.log("🚀 INICIANDO SISTEMA PUENTE QUITACALZÓN...");
    cargarDatos();
    configurarBotones();
    
    // Verificar estado de caché después de cargar
    setTimeout(verificarCache, 2000);
    
    console.log("✅ SISTEMA LISTO");
});

// Segunda verificación de botones por si acaso
setTimeout(function() {
    configurarBotones();
}, 1000);
