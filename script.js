/* SISTEMA DE MONITOREO Y AUDITORÍA - DESARROLLADO POR: ANTONIO SERRA
   VERSIÓN: 12.0 (CORREGIDA - PRODUCCIÓN OFFLINE)
   ESTE SCRIPT NO REQUIERE FETCH NI SERVIDOR. CARGA LOS DATOS DESDE LA VARIABLE LOCAL.
*/

let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;
let zFull = null;
let zUbi = null;
let zPieza = null;

// CORRECCIÓN AUTOMÁTICA DE COMAS DECIMALES (2,5 → 2.5)
function corregirComasDecimales(datos) {
    if (!Array.isArray(datos)) return datos;
    
    return datos.map(function(item) {
        var nuevo = {};
        for (var key in item) {
            if (item.hasOwnProperty(key)) {
                var valor = item[key];
                if (typeof valor === 'string') {
                    // Reemplaza comas decimales por puntos (ej: "2,5" → "2.5")
                    nuevo[key] = valor.replace(/(\d),(\d)/g, '$1.$2');
                } else {
                    nuevo[key] = valor;
                }
            }
        }
        return nuevo;
    });
}

// CARGA DE DATOS: Utiliza la variable 'datosTecnicos' definida en datos_visor.js
function cargarDatos() {
    try {
        // Verificamos si la variable global existe
        if (typeof datosTecnicos === 'undefined') {
            throw new Error("Variable 'datosTecnicos' no encontrada. Verifique datos_visor.js");
        }
        
        // Verificar que sea un array
        if (!Array.isArray(datosTecnicos)) {
            throw new Error("'datosTecnicos' no es un array válido");
        }
        
        // Verificar que tenga datos
        if (datosTecnicos.length === 0) {
            throw new Error("El array de datos técnicos está vacío");
        }
        
        // Corregir comas decimales automáticamente
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

// MOSTRAR ERROR AMIGABLE EN PANTALLA
function mostrarError(mensaje) {
    document.body.innerHTML = '<div style="background:#b30000;color:white;padding:30px;margin:20px;border-radius:15px;text-align:center;font-family:sans-serif;">' +
        '<h2 style="margin-bottom:15px;">⚠️ Error de Carga</h2>' +
        '<p style="margin-bottom:10px;">' + mensaje + '</p>' +
        '<p style="font-size:14px;opacity:0.9;">Verifique que el archivo <strong>datos_visor.js</strong> esté en la misma carpeta que index.html</p>' +
        '<p style="font-size:12px;opacity:0.7;">Error: ' + mensaje + '</p>' +
        '<button onclick="location.reload()" style="margin-top:20px;padding:12px 30px;background:#ffcc00;border:none;border-radius:8px;font-weight:bold;font-size:16px;color:#000;">REINTENTAR</button>' +
        '</div>';
}

// GESTIÓN DEL SELECTOR DE MÓDULOS
function poblarSelectModulo() {
    var selector = document.getElementById("filtro-modulo");
    if (!selector) return;
    
    // Extraer módulos únicos
    var modulosUnicos = [];
    for (var i = 0; i < datosOriginales.length; i++) {
        var mod = String(datosOriginales[i].Modulo || datosOriginales[i].modulo || "").trim();
        if (mod !== "" && mod !== "undefined" && modulosUnicos.indexOf(mod) === -1) {
            modulosUnicos.push(mod);
        }
    }
    
    // Ordenar numéricamente
    modulosUnicos.sort(function(a, b) {
        return parseInt(a) - parseInt(b);
    });
    
    // Construir opciones
    selector.innerHTML = '<option value="todos">📦 TODOS LOS MÓDULOS</option>';
    
    for (var j = 0; j < modulosUnicos.length; j++) {
        var opcion = document.createElement("option");
        opcion.value = modulosUnicos[j];
        opcion.textContent = 'MÓDULO ' + modulosUnicos[j];
        selector.appendChild(opcion);
    }
    
    selector.onchange = aplicarFiltros;
}

// FILTRADO Y ORDEN LÓGICO POR PASO
function aplicarFiltros() {
    var selector = document.getElementById("filtro-modulo");
    if (!selector) return;
    
    var valorSeleccionado = selector.value;
    
    if (valorSeleccionado === "todos") {
        datosFiltrados = datosOriginales.slice(); // Copia del array
    } else {
        datosFiltrados = [];
        for (var i = 0; i < datosOriginales.length; i++) {
            if (String(datosOriginales[i].Modulo || datosOriginales[i].modulo || "").trim() === valorSeleccionado) {
                datosFiltrados.push(datosOriginales[i]);
            }
        }
    }
    
    // ORDENACIÓN ESTRICTA POR PASO
    datosFiltrados.sort(function(a, b) {
        var pasoA = parseInt(a.Paso || a.paso || 0);
        var pasoB = parseInt(b.Paso || b.paso || 0);
        return pasoA - pasoB;
    });
    
    posicionActual = 0;
    actualizarInterfaz();
}

// ACTUALIZACIÓN DE PANTALLA PRINCIPAL
function actualizarInterfaz() {
    if (datosFiltrados.length === 0) {
        // Mostrar valores por defecto
        if (document.getElementById("pieza-titulo")) document.getElementById("pieza-titulo").innerText = "PIEZA: --";
        if (document.getElementById("num-paso")) document.getElementById("num-paso").innerText = "0";
        if (document.getElementById("indicador-indice")) document.getElementById("indicador-indice").innerText = "0 / 0";
        return;
    }
    
    var registro = datosFiltrados[posicionActual];
    if (!registro) return;
    
    // Gestión de Identificadores
    var idPieza = String(registro["Pieza individual"] || "").trim();
    var numeroModulo = String(registro.Modulo || registro.modulo || "").trim();
    var moduloFmt = numeroModulo.padStart ? numeroModulo.padStart(2, '0') : ('0' + numeroModulo).slice(-2);

    // Inserción de Textos
    if (document.getElementById("pieza-titulo")) document.getElementById("pieza-titulo").innerText = "PIEZA: " + idPieza;
    if (document.getElementById("num-paso")) document.getElementById("num-paso").innerText = registro.Paso || registro.paso || "0";
    if (document.getElementById("dato-modulo-linea")) document.getElementById("dato-modulo-linea").innerText = numeroModulo;
    if (document.getElementById("dato-posicion-pieza")) document.getElementById("dato-posicion-pieza").innerText = registro["Ubicación pieza"] || "--";
    
    // Datos de Pernos y Torque
    if (document.getElementById("dato-perno")) document.getElementById("dato-perno").innerText = registro["Tipo Perno"] || "--";
    if (document.getElementById("dato-estandar")) document.getElementById("dato-estandar").innerText = registro["stdtuerca"] || "--";
    if (document.getElementById("dato-torque")) document.getElementById("dato-torque").innerText = registro["Par apriete (N.m) (Torque)"] || "0";
    
    // Medidas de la Pieza
    if (document.getElementById("dato-largo")) document.getElementById("dato-largo").innerText = registro["Largo (mm)"] || "0";
    if (document.getElementById("dato-ancho")) document.getElementById("dato-ancho").innerText = registro["Ancho (mm)"] || "0";
    if (document.getElementById("dato-alto")) document.getElementById("dato-alto").innerText = registro["Alto (mm)"] || "0";

    // Contador de Progreso
    if (document.getElementById("indicador-indice")) document.getElementById("indicador-indice").innerText = (posicionActual + 1) + " / " + datosFiltrados.length;

    // Carga de Imágenes
    var imgMapa = document.getElementById("img-mapa");
    var imgVisor = document.getElementById("img-visor");
    if (imgMapa) imgMapa.src = "fotos/mod" + moduloFmt + idPieza + ".jpg";
    if (imgVisor) imgVisor.src = "fotos/" + idPieza + ".jpg";
    
    // Reset de Zoom
    resetearZoomMiniaturas();
}

// SISTEMA DE ZOOM (PINCH ZOOM)
function inicializarZoomsMiniaturas() {
    try {
        var contenedores = document.querySelectorAll(".contenedor-img");
        if (contenedores.length >= 2) {
            if (typeof PinchZoom !== 'undefined' && PinchZoom.default) {
                zUbi = new PinchZoom.default(contenedores[0], { minZoom: 1, maxZoom: 4 });
                zPieza = new PinchZoom.default(contenedores[1], { minZoom: 1, maxZoom: 4 });
                console.log("🔍 Zoom inicializado");
            } else {
                console.warn("⚠️ Librería PinchZoom no disponible");
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
    } catch (e) {
        // Ignorar errores de zoom
    }
}

function abrirZoomDetalle(idElemento, titulo) {
    var origen = document.getElementById(idElemento);
    if (!origen || !origen.src) return;
    
    var imgZoom = document.getElementById("img-zoom-full");
    var tituloZoom = document.getElementById("titulo-zoom-modal");
    var modal = document.getElementById("modal-zoom-detallado");
    
    if (imgZoom) imgZoom.src = origen.src;
    if (tituloZoom) tituloZoom.innerText = titulo;
    if (modal) modal.style.display = "flex";
    
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
        } catch (e) {
            console.warn("⚠️ Error al abrir zoom:", e.message);
        }
    }, 100);
}

function cerrarZoomDetalle() {
    var modal = document.getElementById("modal-zoom-detallado");
    if (modal) modal.style.display = "none";
}

// MANUAL PDF
function abrirManual() {
    window.open('mtmi.pdf', '_blank');
}

// BOTONES DE NAVEGACIÓN
function inicializarBotones() {
    var btnSiguiente = document.getElementById("btn-siguiente");
    var btnAtras = document.getElementById("btn-atras");
    
    if (btnSiguiente) {
        btnSiguiente.onclick = function() {
            if (posicionActual < datosFiltrados.length - 1) {
                posicionActual++;
                actualizarInterfaz();
            }
        };
    }
    
    if (btnAtras) {
        btnAtras.onclick = function() {
            if (posicionActual > 0) {
                posicionActual--;
                actualizarInterfaz();
            }
        };
    }
    
    console.log("🔘 Botones de navegación inicializados");
}

// INICIO AUTOMÁTICO AL CARGAR LA VENTANA
window.onload = function() {
    console.log("🚀 Iniciando Sistema de Monitoreo - Puente Quitacalzón");
    cargarDatos();
    inicializarBotones();
};

// Inicializar botones también si el DOM ya estaba cargado
if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(inicializarBotones, 50);
}
