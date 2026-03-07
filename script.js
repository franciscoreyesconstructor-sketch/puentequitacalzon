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
    
    // 1. Filtramos por módulo
    let filtrados = (modVal === "todos") 
        ? [...datosOriginales] 
        : datosOriginales.filter(p => String(p.Modulo || p.modulo).trim() === modVal);
    
    // 2. ORDENAMOS POR SECUENCIA (Clave para el montaje)
    // Usamos el nombre de tu columna: "Secuencia"
    datosFiltrados = filtrados.sort((a, b) => {
        const secA = parseInt(a["Secuencia"]) || 0;
        const secB = parseInt(b["Secuencia"]) || 0;
        return secA - secB;
    });
    
    posicionActual = 0;
    actualizarInterfaz();
}

function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];

    const idPieza = String(p["Pieza individual"] || "").trim();
    const numModRaw = String(p.Modulo || p.modulo || "").trim();
    const modFormateado = numModRaw.padStart(2, '0');

    // 1. Textos e Identificación
    document.getElementById("pieza-titulo").innerText = "PIEZA: " + idPieza;
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

    // 4. Imágenes (Lógica mod01... mod21)
    if (idPieza) {
        document.getElementById("img-mapa").src = `fotos/mod${modFormateado}${idPieza}.jpg`;
        document.getElementById("img-visor").src = `fotos/${idPieza}.jpg`;
    }

    // 5. Navegación y Zoom
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
    if (typeof mediumZoom !== 'undefined') {
        mediumZoom('.zoom', { margin: 20, background: '#000', scrollOffset: 0 });
    }
}

document.getElementById("btn-siguiente").onclick = () => {
    if(posicionActual < datosFiltrados.length - 1) { posicionActual++; actualizarInterfaz(); }
};
document.getElementById("btn-atras").onclick = () => {
    if(posicionActual > 0) { posicionActual--; actualizarInterfaz(); }
};

cargarDatos();
