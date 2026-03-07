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
        console.error("Error cargando JSON:", error);
    }
}

function poblarSelectModulo() {
    const selectMod = document.getElementById("filtro-modulo");
    const modulos = [...new Set(datosOriginales.map(p => String(p.Modulo || p.modulo).trim()))].sort((a,b) => a - b);
    selectMod.innerHTML = '<option value="todos">📦 Módulo (Todos)</option>';
    modulos.forEach(m => {
        if(m && m !== "undefined") selectMod.innerHTML += `<option value="${m}">Módulo ${m}</option>`;
    });
    selectMod.onchange = aplicarFiltros;
}

function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    datosFiltrados = (modVal === "todos") ? [...datosOriginales] : datosOriginales.filter(p => String(p.Modulo || p.modulo).trim() === modVal);
    posicionActual = 0;
    actualizarInterfaz();
}

function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];

    // Mapeo de columnas corregido
    const idPieza = String(p["Pieza individual"] || "").trim();
    const idMod = String(p.Modulo || p.modulo || "").trim();
    
    // Aquí usamos el nombre de columna que nos indicaste
    const valorPerno = p["Tipo Perno"] || p.perno || "--";
    const valorTorque = p["Par apriete (N.m) (Torque)"] || p.torque || "0";

    // Inyectar datos en HTML
    document.getElementById("pieza-titulo").innerText = "PIEZA: " + idPieza;
    document.getElementById("dato-modulo-linea").innerText = "MÓDULO " + idMod;
    document.getElementById("dato-perno").innerText = valorPerno;
    document.getElementById("dato-acero-tuerca").innerText = p.stdtuerca || p["Acero Tuerca"] || "--";
    document.getElementById("dato-torque").innerText = valorTorque;
    
    // Cantidades
    document.getElementById("cant-pernos").innerText = p["Cantidad Pernos por pieza"] || 0;
    document.getElementById("cant-tuercas").innerText = p["Cantidad Tuercas por pieza"] || 0;
    document.getElementById("cant-golillas").innerText = p["Cantidad Golillas por pieza"] || 0;
    
    // Medidas
    document.getElementById("dato-largo").innerText = p["Largo (mm)"] || 0;
    document.getElementById("dato-ancho").innerText = p["Ancho (mm)"] || 0;
    document.getElementById("dato-alto").innerText = p["Alto (mm)"] || 0;

    // Rutas de Imágenes V5
      document.getElementById("img-mapa").src = `fotos/mod0${idMod}${idPieza}.jpg`;

    document.getElementById("img-visor").src = `fotos/${idPieza}.jpg`;

    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;

    // Reiniciar el zoom para las nuevas imágenes cargadas
    mediumZoom('.zoom', {
        margin: 24,
        background: '#000',
        scrollOffset: 0,
    });
    
}

document.getElementById("btn-siguiente").onclick = () => {
    if(posicionActual < datosFiltrados.length - 1) { posicionActual++; actualizarInterfaz(); }
};
document.getElementById("btn-atras").onclick = () => {
    if(posicionActual > 0) { posicionActual--; actualizarInterfaz(); }
};

cargarDatos();

