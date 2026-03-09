/* SISTEMA DE MONITOREO Y AUDITORÍA - DESARROLLADO POR: ANTONIO SERRA
   VERSIÓN: 10.5 (OFFLINE OPTIMIZED)
   ESTE SCRIPT GESTIONA LA CARGA LOCAL, FILTROS Y ZOOM SIN REQUERIR INTERNET.
*/

let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;
let zFull = null;
let zUbi = null;
let zPieza = null;

// CARGA DE DATOS: Configurada para lectura local dentro del APK
async function cargarDatos() {
    try {
        // Eliminamos el Date.now() para que el APK busque el archivo interno
        const respuesta = await fetch('datos_visor.json');
        if (!respuesta.ok) throw new Error("No se encontró el archivo JSON local");
        
        datosOriginales = await respuesta.json();
        
        console.log("Datos cargados correctamente: ", datosOriginales.length, " registros.");
        
        poblarSelectModulo();
        aplicarFiltros();
        inicializarZoomsMiniaturas();
        
    } catch (error) {
        console.error("ERROR CRÍTICO DE CARGA:", error);
        alert("Error al cargar los datos técnicos. Verifique el archivo datos_visor.json");
    }
}

// GESTIÓN DE MÓDULOS EN EL SELECTOR
function poblarSelectModulo() {
    const selector = document.getElementById("filtro-modulo");
    
    // Extraer módulos únicos y limpiar espacios
    const listaModulos = [...new Set(datosOriginales.map(p => String(p.Modulo || p.modulo || "").trim()))]
        .filter(m => m !== "" && m !== "undefined")
        .sort((a, b) => a - b);
        
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
    
    // Ordenar estrictamente por el número de PASO (1, 2, 3...)
    datosFiltrados.sort((a, b) => {
        const pasoA = parseInt(a.Paso || a.paso) || 0;
        const pasoB = parseInt(b.Paso || b.paso) || 0;
        return pasoA - pasoB;
    });
    
    posicionActual = 0;
    actualizarInterfaz();
}

// ACTUALIZACIÓN DE LA PANTALLA PRINCIPAL
function actualizarInterfaz() {
    if (datosFiltrados.length === 0) {
        console.warn("No hay datos para mostrar con el filtro actual.");
        return;
    }
    
    const registro = datosFiltrados[posicionActual];
    
    // Identificadores de pieza y carpeta
    const idPieza = String(registro["Pieza individual"] || "").trim();
    const numeroModulo = String(registro.Modulo || registro.modulo || "").trim();
    const moduloFormateado = numeroModulo.padStart(2, '0');

    // Inserción de textos en el HTML
    document.getElementById("pieza-titulo").innerText = `PIEZA: ${idPieza}`;
    document.getElementById("num-paso").innerText = registro.Paso || registro.paso || "0";
    document.getElementById("dato-modulo-linea").innerText = numeroModulo;
    document.getElementById("dato-posicion-pieza").innerText = registro["Ubicación pieza"] || registro.posicion || "--";
    
    // Datos de Pernos y Torque
    document.getElementById("dato-perno").innerText = registro["Tipo Perno"] || "--";
    document.getElementById("dato-estandar").innerText = registro["Acero Tuerca"] || registro.stdtuerca || "--";
    document.getElementById("dato-torque").innerText = registro["Par apriete (N.m) (Torque)"] || "0";
    
    // Medidas de la Pieza (Largo, Ancho, Alto)
    document.getElementById("dato-largo").innerText = registro["Largo (mm)"] || 0;
    document.getElementById("dato-ancho").innerText = registro["Ancho (mm)"] || 0;
    document.getElementById("dato-alto").innerText = registro["Alto (mm)"] || 0;

    // Contador de progreso
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;

    // Carga de imágenes (Rutas relativas para el APK)
    document.getElementById("img-mapa").src = `fotos/mod${moduloFormateado}${idPieza}.jpg`;
    document.getElementById("img-visor").src = `fotos/${idPieza}.jpg`;
    
    // Reset de Zoom de miniaturas para evitar que la nueva imagen aparezca movida
    resetearZoomMiniaturas();
}

// GESTIÓN DE ZOOM (PINCH ZOOM)
function inicializarZoomsMiniaturas() {
    try {
        const contUbi = document.querySelector(".contenedor-img:first-child");
        const contPieza = document.querySelector(".contenedor-img:last-child");
        
        if (contUbi && contPieza) {
            zUbi = new PinchZoom.default(contUbi, { minZoom: 1, maxZoom: 4 });
            zPieza = new PinchZoom.default(contPieza, { minZoom: 1, maxZoom: 4 });
        }
    } catch (e) {
        console.warn("Librería PinchZoom no detectada todavía.");
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
    
    // Inicializar o resetear el zoom de la pantalla completa
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

// ACCESO AL MANUAL PDF
function abrirManual() {
    // En el APK offline, esto intentará abrir el archivo si se incluyó en el paquete
    window.open('mtmi.pdf', '_blank');
}

// CONTROLES DE NAVEGACIÓN
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

// INICIO DEL SISTEMA
window.onload = cargarDatos;
