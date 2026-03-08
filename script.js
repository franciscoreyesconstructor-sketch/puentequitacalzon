let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

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

function poblarSelectModulo() {
    const selectMod = document.getElementById("filtro-modulo");
    const modulos = [...new Set(datosOriginales.map(p => String(p.Modulo || p.modulo).trim()))].sort((a, b) => a - b);
    selectMod.innerHTML = '<option value="todos">📦 Módulo (Todos)</option>';
    modulos.forEach(m => {
        if(m && m !== "undefined") selectMod.innerHTML += `<option value="${m}">Módulo ${m}</option>`;
    });
    selectMod.onchange = aplicarFiltros;
}

function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    
    // 1. Filtrar
    let filtrados = (modVal === "todos") 
        ? [...datosOriginales] 
        : datosOriginales.filter(p => String(p.Modulo || p.modulo).trim() === modVal);
    
    // 2. Ordenar por PASO (Secuencia del Excel)
    datosFiltrados = filtrados.sort((a, b) => (parseInt(a["Paso"]) || 0) - (parseInt(b["Paso"]) || 0));
    posicionActual = 0;

    actualizarInterfaz();
}

// LÓGICA V7: FUNCIONES PARA EL BOTÓN DE MAPA ÚNICO
function mostrarMapaGeneral() {
    const modal = document.getElementById("modal-mapa-general");
    const imgUbimod = document.getElementById("img-ubimod");
    
    // RUTA ÚNICA: fotos/ubimod.jpg
    imgUbimod.src = `fotos/ubimod.jpg?v=${Date.now()}`; // Forzamos recarga para evitar caché
    
    modal.style.display = "flex";
}

function cerrarMapaGeneral() {
    document.getElementById("modal-mapa-general").style.display = "none";
    // mediumZoom.close() se ejecuta automáticamente al cerrar modal
}

function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];

    const idPieza = String(p["Pieza individual"] || "").trim();
    const numModRaw = String(p.Modulo || p.modulo || "").trim();
    const modFormateado = numModRaw.padStart(2, '0');
    const pasoActual = p["Paso"] || "--";

    // 1. Textos e Identificación
    document.getElementById("pieza-titulo").innerText = `PIEZA: ${idPieza} (PASO ${pasoActual})`;
    document.getElementById("dato-modulo-linea").innerText = "MÓDULO " + modFormateado;
    
    // Mapeo solicitado: Ubicación pieza (Excel) -> Posición pieza (Visor)
    const valorUbicacion = p["Ubicación pieza"] || p.posicion || "--";
    document.getElementById("dato-posicion-pieza").innerText = valorUbicacion;

    // 2. Datos Técnicos
    document.getElementById("dato-perno").innerText = p["Tipo Perno"] || p.perno || "--";
    document.getElementById("dato-torque").innerText = p["Par apriete (N.m) (Torque)"] || p.torque || "0";
    document.getElementById("dato-acero-tuerca").innerText = p["Acero Tuerca"] || p.stdtuerca || "--";
    
    // 3. Cantidades y Medidas
    document.getElementById("cant-pernos").innerText = p["Cantidad Pernos por pieza"] || 0;
    document.getElementById("cant-tuercas").innerText = p["Cantidad Tuercas por pieza"] || 0;
    document.getElementById("cant-golillas").innerText = p["Cantidad Golillas por pieza"] || 0;
    document.getElementById("dato-largo").innerText = p["Largo (mm)"] || 0;
    document.getElementById("dato-ancho").innerText = p["Ancho (mm)"] || 0;
    document.getElementById("dato-alto").innerText = p["Alto (mm)"] || 0;

    // 4. Imágenes (Plano Ubicación mod01... y Foto Pieza)
    if (idPieza) {
        document.getElementById("img-mapa").src = `fotos/mod${modFormateado}${idPieza}.jpg`;
        document.getElementById("img-visor").src = `fotos/${idPieza}.jpg`;
    }

    // 5. Navegación
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
    
    // Refrescar mediumZoom para que las nuevas imágenes sean clickeables
    if (typeof mediumZoom !== 'undefined') {
        mediumZoom('.zoom', { margin: 20, background: '#000', scrollOffset: 0 });
    }
}

// 6. CONTROLES DE BOTONES ANTERIOR / SIGUIENTE
document.getElementById("btn-siguiente").onclick = () => {
    if(posicionActual < datosFiltrados.length - 1) { posicionActual++; actualizarInterfaz(); }
};
document.getElementById("btn-atras").onclick = () => {
    if(posicionActual > 0) { posicionActual--; actualizarInterfaz(); }
};

// INICIAR APLICACIÓN
cargarDatos();
