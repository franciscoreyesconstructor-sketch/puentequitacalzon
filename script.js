let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

// 1. CARGA DE DATOS
async function cargarDatos() {
    try {
        const respuesta = await fetch('datos_visor.json?v=' + Date.now());
        datosOriginales = await respuesta.json();
        poblarSelectModulo();
        aplicarFiltros();
    } catch (error) {
        console.error("Error al cargar el JSON:", error);
    }
}

// 2. LLENAR SELECTOR DE MÓDULOS
function poblarSelectModulo() {
    const selectMod = document.getElementById("filtro-modulo");
    const modulos = [...new Set(datosOriginales.map(p => String(p.Modulo || p.modulo).trim()))].sort((a, b) => a - b);
    
    selectMod.innerHTML = '<option value="todos">📦 Módulo (Todos)</option>';
    modulos.forEach(m => {
        if(m && m !== "undefined") selectMod.innerHTML += `<option value="${m}">Módulo ${m}</option>`;
    });
    selectMod.onchange = aplicarFiltros;
}

// 3. FILTRADO Y ORDENAMIENTO POR PASO
function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    
    // Filtrar por módulo seleccionado
    let filtrados = (modVal === "todos") 
        ? [...datosOriginales] 
        : datosOriginales.filter(p => String(p.Modulo || p.modulo).trim() === modVal);
    
    // ORDENAR POR COLUMNA "Paso" (Secuencia de montaje)
    datosFiltrados = filtrados.sort((a, b) => {
        const secA = parseInt(a["Paso"]) || 0;
        const secB = parseInt(b["Paso"]) || 0;
        return secA - secB;
    });
    
    posicionActual = 0;
    actualizarInterfaz();
}

// 4. ACTUALIZAR INTERFAZ
function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];

    const idPieza = String(p["Pieza individual"] || "").trim();
    const numModRaw = String(p.Modulo || p.modulo || "").trim();
    const modFormateado = numModRaw.padStart(2, '0');
    const pasoActual = p["Paso"] || "--";

    // 1. Identificación y Paso
    document.getElementById("pieza-titulo").innerText = `PIEZA: ${idPieza} (PASO ${pasoActual})`;
    document.getElementById("dato-modulo-linea").innerText = "MÓDULO " + modFormateado;
    
    // Ubicación pieza -> Posición pieza
    const valorUbicacion = p["Ubicación pieza"] || p.posicion || "--";
    document.getElementById("dato-posicion-pieza").innerText = valorUbicacion;

    // 2. Datos Técnicos (Perno, Torque, Acero)
    document.getElementById("dato-perno").innerText = p["Tipo Perno"] || p.perno || "--";
    document.getElementById("dato-torque").innerText = p["Par apriete (N.m) (Torque)"] || p.torque || "0";
    document.getElementById("dato-acero-tuerca").innerText = p["Acero Tuerca"] || p.stdtuerca || "--";
    
    // 3. Cantidades y Dimensiones
    document.getElementById("cant-pernos").innerText = p["Cantidad Pernos por pieza"] || 0;
    document.getElementById("cant-tuercas").innerText = p["Cantidad Tuercas por pieza"] || 0;
    document.getElementById("cant-golillas").innerText = p["Cantidad Golillas por pieza"] || 0;
    document.getElementById("dato-largo").innerText = p["Largo (mm)"] || 0;
    document.getElementById("dato-ancho").innerText = p["Ancho (mm)"] || 0;
    document.getElementById("dato-alto").innerText = p["Alto (mm)"] || 0;

    // 4. Imágenes (Plano y Foto)
    if (idPieza) {
        document.getElementById("img-mapa").src = `fotos/mod${modFormateado}${idPieza}.jpg`;
        document.getElementById("img-visor").src = `fotos/${idPieza}.jpg`;
    }

    // 5. Navegación e Índice
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
    
    // Reiniciar Zoom si la librería está presente
    if (typeof mediumZoom !== 'undefined') {
        mediumZoom('.zoom', { margin: 20, background: '#000', scrollOffset: 0 });
    }
}

// 6. CONTROLES DE NAVEGACIÓN
document.getElementById("btn-siguiente").onclick = () => {
    if(posicionActual < datosFiltrados.length - 1) { posicionActual++; actualizarInterfaz(); }
};
document.getElementById("btn-atras").onclick = () => {
    if(posicionActual > 0) { posicionActual--; actualizarInterfaz(); }
};

// Función para mostrar el plano extendido al cambiar de módulo
function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    
    let filtrados = (modVal === "todos") 
        ? [...datosOriginales] 
        : datosOriginales.filter(p => String(p.Modulo || p.modulo).trim() === modVal);
    
    datosFiltrados = filtrados.sort((a, b) => (parseInt(a["Paso"]) || 0) - (parseInt(b["Paso"]) || 0));
    posicionActual = 0;

    // SI SELECCIONA UN MÓDULO ESPECÍFICO, MOSTRAR UBIMOD.JPG
    if (modVal !== "todos") {
        mostrarMapaGeneral(modVal);
    } else {
        actualizarInterfaz();
    }
}

function mostrarMapaGeneral(nMod) {
    const modFormateado = nMod.padStart(2, '0');
    const pantalla = document.getElementById("pantalla-mapa-general");
    const imgUbimod = document.getElementById("img-ubimod");
    
    document.getElementById("titulo-mapa-general").innerText = `MAPA GENERAL MÓDULO ${modFormateado}`;
    
    // Ruta: fotos/ubimod01.jpg, ubimod02.jpg, etc.
    imgUbimod.src = `fotos/ubimod${modFormateado}.jpg`;
    
    pantalla.style.display = "flex";
}

function cerrarMapaGeneral() {
    document.getElementById("pantalla-mapa-general").style.display = "none";
    actualizarInterfaz();
}


// Iniciar aplicación
cargarDatos();
