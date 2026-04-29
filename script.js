/* SISTEMA DE MONITOREO Y AUDITORÍA - DESARROLLADO POR: ANTONIO SERRA
   VERSIÓN: 11.0 (PRODUCCIÓN OFFLINE)
   ESTE SCRIPT NO REQUIERE FETCH NI SERVIDOR. CARGA LOS DATOS DESDE LA VARIABLE LOCAL.
*/

let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;
let zFull = null;
let zUbi = null;
let zPieza = null;

// CARGA DE DATOS: Utiliza la variable 'datosTecnicos' definida en datos_visor.js
function cargarDatos() {
    try {
        // Verificamos si la variable global existe (se carga desde datos_visor.js)
        if (typeof datosTecnicos !== 'undefined') {
            datosOriginales = datosTecnicos;
            console.log("Sistema cargado localmente con " + datosOriginales.length + " registros.");
            
            poblarSelectModulo();
            aplicarFiltros();
            inicializarZoomsMiniaturas();
        } else {
            throw new Error("No se encontró la variable 'datosTecnicos'. Revisa datos_visor.js");
        }
    } catch (error) {
        console.error("ERROR CRÍTICO:", error);
        alert("ERROR: Los datos técnicos no están disponibles. Asegúrese de que datos_visor.js esté en la carpeta raíz.");
    }
}

// GESTIÓN DEL SELECTOR DE MÓDULOS
function poblarSelectModulo() {
    const selector = document.getElementById("filtro-modulo");
    
    // Extraer módulos únicos, limpiar espacios y ordenar de forma ascendente
    const listaModulos = [...new Set(datosOriginales.map(p => String(p.Modulo || p.modulo || "").trim()))]
        .filter(m => m !== "" && m !== "undefined")
        .sort((a, b) => parseInt(a) - parseInt(b));
        
    selector.innerHTML = '<option value="todos">📦 TODOS LOS MÓDULOS</option>';
    
    listaModulos.forEach(mod => {
        const opcion = document.createElement("option");
        opcion.value = mod;
        opcion.textContent = `MÓDULO ${mod}`;
        selector.appendChild(opcion);
    });
    
    selector.onchange = aplicarFiltros;
}

// FILTRADO Y ORDEN LOGÍCO POR PASO
function aplicarFiltros() {
    const valorSeleccionado = document.getElementById("filtro-modulo").value;
    
    if (valorSeleccionado === "todos") {
        datosFiltrados = [...datosOriginales];
    } else {
        datosFiltrados = datosOriginales.filter(p => String(p.Modulo || p.modulo || "").trim() === valorSeleccionado);
    }
    
    // ORDENACIÓN ESTRICTA POR PASO (Para auditoría de armado)
    datosFiltrados.sort((a, b) => {
        const pasoA = parseInt(a.Paso || a.paso) || 0;
        const pasoB = parseInt(b.Paso || b.paso) || 0;
        return pasoA - pasoB;
    });
    
    posicionActual = 0;
    actualizarInterfaz();
}

// ACTUALIZACIÓN DE PANTALLA PRINCIPAL
function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    
    const registro = datosFiltrados[posicionActual];
    
    // Gestión de Identificadores
    const idPieza = String(registro["Pieza individual"] || "").trim();
    const numeroModulo = String(registro.Modulo || registro.modulo || "").trim();
    const moduloFmt = numeroModulo.padStart(2, '0');

    // Inserción de Textos (Auditoría Técnica)
    document.getElementById("pieza-titulo").innerText = `PIEZA: ${idPieza}`;
    document.getElementById("num-paso").innerText = registro.Paso || registro.paso || "0";
    document.getElementById("dato-modulo-linea").innerText = numeroModulo;
    document.getElementById("dato-posicion-pieza").innerText = registro["Ubicación pieza"] || registro.posicion || "--";
    
    // Datos de Pernos y Torque
    document.getElementById("dato-perno").innerText = registro["Tipo Perno"] || "--";
    document.getElementById("dato-estandar").innerText = registro["stdtuerca"] || "--";
    document.getElementById("dato-torque").innerText = registro["Par apriete (N.m) (Torque)"] || "0";
    
    // Medidas de la Pieza
    document.getElementById("dato-largo").innerText = registro["Largo (mm)"] || 0;
    document.getElementById("dato-ancho").innerText = registro["Ancho (mm)"] || 0;
    document.getElementById("dato-alto").innerText = registro["Alto (mm)"] || 0;

    // Contador de Progreso
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;

    // Carga de Imágenes (Rutas locales para APK)
    document.getElementById("img-mapa").src = `fotos/mod${moduloFmt}${idPieza}.jpg`;
    document.getElementById("img-visor").src = `fotos/${idPieza}.jpg`;
    
    // Reset de Zoom para que la nueva imagen no herede el desplazamiento de la anterior
    resetearZoomMiniaturas();
}

// SISTEMA DE ZOOM (PINCH ZOOM)
function inicializarZoomsMiniaturas() {
    try {
        const contUbi = document.querySelector(".contenedor-img:first-child");
        const contPieza = document.querySelector(".contenedor-img:last-child");
        
        if (contUbi && contPieza) {
            zUbi = new PinchZoom.default(contUbi, { minZoom: 1, maxZoom: 4 });
            zPieza = new PinchZoom.default(contPieza, { minZoom: 1, maxZoom: 4 });
        }
    } catch (e) {
        console.warn("Librería de zoom en espera...");
    }
}

function resetearZoomMiniaturas() {
    if (zUbi && typeof zUbi.setZoom === "function") zUbi.setZoom(1);
    if (zPieza && typeof zPieza.setZoom === "function") zPieza.setZoom(1);
}

function abrirZoomDetalle(idElemento, titulo) {
    const origen = document.getElementById(idElemento).src;
    document.getElementById("img-zoom-full").src = origen;
    document.getElementById("titulo-zoom-modal").innerText = titulo;
    document.getElementById("modal-zoom-detallado").style.display = "flex";
    
    setTimeout(() => {
        const wrapper = document.getElementById('wrapper-zoom-detalle');
        if (!zFull) {
            zFull = new PinchZoom.default(wrapper, { maxZoom: 6 });
        } else {
            zFull.setZoom(1);
        }
    }, 100);
}

function cerrarZoomDetalle() {
    document.getElementById("modal-zoom-detallado").style.display = "none";
}

// MANUAL PDF
function abrirManual() {
    window.open('mtmi.pdf', '_blank');
}

// BOTONES DE NAVEGACIÓN
document.getElementById("btn-siguiente").onclick = () => {
    if (posicionActual < datosFiltrados.length - 1) {
        posicionActual++;
        actualizarInterfaz();
    }
};

document.getElementById("btn-atras").onclick = () => {
    if (posicionActual > 0) {
        posicionActual--;
        actualizarInterfaz();
    }
};

// INICIO AUTOMÁTICO AL CARGAR LA VENTANA
window.onload = cargarDatos;