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
    
    let filtrados = (modVal === "todos") 
        ? [...datosOriginales] 
        : datosOriginales.filter(p => String(p.Modulo || p.modulo).trim() === modVal);
    
    // ORDENAR POR PASO
    datosFiltrados = filtrados.sort((a, b) => (parseInt(a["Paso"]) || 0) - (parseInt(b["Paso"]) || 0));
    posicionActual = 0;

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
    
    document.getElementById("titulo-mapa-general").innerText = `PLANO GENERAL MÓDULO ${modFormateado}`;
    // RUTA: fotos/ubimod11.jpg
    imgUbimod.src = `fotos/ubimod${modFormateado}.jpg`;
    pantalla.style.display = "flex";
}

function cerrarMapaGeneral() {
    document.getElementById("pantalla-mapa-general").style.display = "none";
    actualizarInterfaz();
}

function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];

    const idPieza = String(p["Pieza individual"] || "").trim();
    const numModRaw = String(p.Modulo || p.modulo || "").trim();
    const modFormateado = numModRaw.padStart(2, '0');
    const pasoActual = p["Paso"] || "--";

    document.getElementById("pieza-titulo").innerText = `PIEZA: ${idPieza} (PASO ${pasoActual})`;
    document.getElementById("dato-modulo-linea").innerText = "MÓDULO " + modFormateado;
    
    const valorUbicacion = p["Ubicación pieza"] || p.posicion || "--";
    document.getElementById("dato-posicion-pieza").innerText = valorUbicacion;

    document.getElementById("dato-perno").innerText = p["Tipo Perno"] || p.perno || "--";
    document.getElementById("dato-torque").innerText = p["Par apriete (N.m) (Torque)"] || p.torque || "0";
    document.getElementById("dato-acero-tuerca").innerText = p["Acero Tuerca"] || p.stdtuerca || "--";
    
    document.getElementById("cant-pernos").innerText = p["Cantidad Pernos por pieza"] || 0;
    document.getElementById("cant-tuercas").innerText = p["Cantidad Tuercas por pieza"] || 0;
    document.getElementById("cant-golillas").innerText = p["Cantidad Golillas por pieza"] || 0;

    if (idPieza) {
        document.getElementById("img-mapa").src = `fotos/mod${modFormateado}${idPieza}.jpg`;
        document.getElementById("img-visor").src = `fotos/${idPieza}.jpg`;
    }

    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
    if (typeof mediumZoom !== 'undefined') {
        mediumZoom('.zoom', { margin: 20, background: '#000' });
    }
}

document.getElementById("btn-siguiente").onclick = () => {
    if(posicionActual < datosFiltrados.length - 1) { posicionActual++; actualizarInterfaz(); }
};
document.getElementById("btn-atras").onclick = () => {
    if(posicionActual > 0) { posicionActual--; actualizarInterfaz(); }
};

cargarDatos();
