let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;
let zoomInstanciaFull = null;
let zoomInstanciaGeneral = null;

async function cargarDatos() {
    try {
        const respuesta = await fetch('datos_visor.json?v=' + Date.now());
        datosOriginales = await respuesta.json();
        poblarSelectModulo();
        aplicarFiltros();
    } catch (error) { console.error("Error:", error); }
}

function poblarSelectModulo() {
    const selectMod = document.getElementById("filtro-modulo");
    const modulos = [...new Set(datosOriginales.map(p => String(p.Modulo || p.modulo || "").trim()))]
        .filter(m => m !== "").sort((a, b) => a - b);
    selectMod.innerHTML = '<option value="todos">📦 TODOS LOS MÓDULOS</option>';
    modulos.forEach(m => { selectMod.innerHTML += `<option value="${m}">MÓDULO ${m}</option>`; });
    selectMod.onchange = aplicarFiltros;
}

function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    let filtrados = (modVal === "todos") ? [...datosOriginales] : datosOriginales.filter(p => String(p.Modulo || p.modulo || "").trim() === modVal);
    datosFiltrados = filtrados.sort((a, b) => (parseInt(a.Paso || a.paso) || 0) - (parseInt(b.Paso || b.paso) || 0));
    posicionActual = 0;
    actualizarInterfaz();
}

function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];
    const idPieza = String(p["Pieza individual"] || "").trim();
    const modFormateado = String(p.Modulo || p.modulo || "").trim().padStart(2, '0');

    document.getElementById("pieza-titulo").innerText = `PIEZA ${idPieza}`;
    document.getElementById("dato-modulo-linea").innerText = "MÓDULO " + modFormateado;
    document.getElementById("dato-posicion-pieza").innerText = p["Ubicación pieza"] || p.posicion || "--";
    document.getElementById("dato-perno").innerText = p["Tipo Perno"] || "--";
    document.getElementById("dato-estandar").innerText = p["Acero Tuerca"] || p.stdtuerca || "--";
    document.getElementById("dato-torque").innerText = p["Par apriete (N.m) (Torque)"] || "0";
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} de ${datosFiltrados.length}`;

    document.getElementById("img-mapa").src = `fotos/mod${modFormateado}${idPieza}.jpg`;
    document.getElementById("img-visor").src = `fotos/${idPieza}.jpg`;
}

// FUNCIONES DE ZOOM PANTALLA COMPLETA
function abrirZoomDetalle(idImgOrigen, titulo) {
    const src = document.getElementById(idImgOrigen).src;
    document.getElementById("img-zoom-full").src = src;
    document.getElementById("titulo-zoom-modal").innerText = titulo;
    document.getElementById("modal-zoom-detallado").style.display = "flex";

    // Crear instancia de zoom si no existe o resetearla
    setTimeout(() => {
        if (!zoomInstanciaFull) {
            zoomInstanciaFull = new PinchZoom.default(document.getElementById('wrapper-zoom-detalle'), { minZoom: 1, maxZoom: 5 });
        } else {
            zoomInstanciaFull.setZoom(1);
        }
    }, 100);
}

function cerrarZoomDetalle() {
    document.getElementById("modal-zoom-detallado").style.display = "none";
}

function mostrarMapaGeneral() {
    document.getElementById("img-ubimod").src = `fotos/ubimod.jpg?v=${Date.now()}`; 
    document.getElementById("modal-mapa-general").style.display = "flex";
    setTimeout(() => {
        if (!zoomInstanciaGeneral) {
            zoomInstanciaGeneral = new PinchZoom.default(document.getElementById('wrapper-general'), { minZoom: 1, maxZoom: 6 });
        } else {
            zoomInstanciaGeneral.setZoom(1);
        }
    }, 100);
}

function cerrarMapaGeneral() { document.getElementById("modal-mapa-general").style.display = "none"; }

document.getElementById("btn-siguiente").onclick = () => { if(posicionActual < datosFiltrados.length - 1) { posicionActual++; actualizarInterfaz(); } };
document.getElementById("btn-atras").onclick = () => { if(posicionActual > 0) { posicionActual--; actualizarInterfaz(); } };

cargarDatos();
