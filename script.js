9let datosOriginales = [];
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

    // Limpiamos los datos
    const idPieza = String(p["Pieza individual"] || "").trim();
    let numMod = String(p.Modulo || p.modulo || "").trim();

    // LÓGICA DE FORMATEO DE MÓDULO (01, 02... 10, 11...)
    // Si numMod es "1", lo convierte en "01". Si es "11", se queda como "11".
    const modFormateado = numMod.padStart(2, '0');

    // 1. CARGA DE IMÁGENES
    if (idPieza) {
        // Construye: fotos/mod01 + pieza.jpg  O  fotos/mod11 + pieza.jpg
        document.getElementById("img-mapa").src = `fotos/mod${modFormateado}${idPieza}.jpg`;
        
        // Foto de la pieza simple
        document.getElementById("img-visor").src = `fotos/${idPieza}.jpg`;
    }

    // 2. TEXTOS TÉCNICOS
    document.getElementById("pieza-titulo").innerText = "PIEZA: " + idPieza;
    document.getElementById("dato-modulo-linea").innerText = "MÓDULO " + modFormateado;
    document.getElementById("dato-perno").innerText = p["Tipo Perno"] || p.perno || "--";
    document.getElementById("dato-torque").innerText = p["Par apriete (N.m) (Torque)"] || p.torque || "0";

document.getElementById('dato-ubicacion-pieza').textContent = ubicación pieza['posición pieza'];
    
    // 3. CANTIDADES Y MEDIDAS
    document.getElementById("dato-acero-tuerca").innerText = p.stdtuerca || p["Acero Tuerca"] || "--";
    document.getElementById("cant-pernos").innerText = p["Cantidad Pernos por pieza"] || 0;
    document.getElementById("cant-tuercas").innerText = p["Cantidad Tuercas por pieza"] || 0;
    document.getElementById("cant-golillas").innerText = p["Cantidad Golillas por pieza"] || 0;
    document.getElementById("dato-largo").innerText = p["Largo (mm)"] || 0;
    document.getElementById("dato-ancho").innerText = p["Ancho (mm)"] || 0;
    document.getElementById("dato-alto").innerText = p["Alto (mm)"] || 0;

    // 4. ACTUALIZAR ZOOM
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
    
    // Reiniciar librería de zoom para las nuevas fotos
    if (typeof mediumZoom !== 'undefined') {
        mediumZoom('.zoom', { background: '#000' });
    }
}


document.getElementById("btn-siguiente").onclick = () => {
    if(posicionActual < datosFiltrados.length - 1) { posicionActual++; actualizarInterfaz(); }
};
document.getElementById("btn-atras").onclick = () => {
    if(posicionActual > 0) { posicionActual--; actualizarInterfaz(); }
};

cargarDatos();

