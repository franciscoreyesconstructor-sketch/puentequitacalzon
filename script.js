let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;
let zUbi, zPieza, zFull;

async function cargarDatos() {
    try {
        const r = await fetch('datos_visor.json?v=' + Date.now());
        datosOriginales = await r.json();
        poblarSelectModulo();
        aplicarFiltros();
        
        // Inicializar zooms en las miniaturas
        setTimeout(() => {
            zUbi = new PinchZoom.default(document.getElementById('pz-ubica'), { minZoom: 1, maxZoom: 4 });
            zPieza = new PinchZoom.default(document.getElementById('pz-pieza'), { minZoom: 1, maxZoom: 4 });
        }, 500);
    } catch (e) { console.error(e); }
}

function poblarSelectModulo() {
    const s = document.getElementById("filtro-modulo");
    const m = [...new Set(datosOriginales.map(p => String(p.Modulo || p.modulo || "").trim()))].filter(x => x).sort((a,b)=>a-b);
    s.innerHTML = '<option value="todos">📦 TODOS LOS MÓDULOS</option>';
    m.forEach(x => { s.innerHTML += `<option value="${x}">MÓDULO ${x}</option>`; });
    s.onchange = aplicarFiltros;
}

function aplicarFiltros() {
    const val = document.getElementById("filtro-modulo").value;
    datosFiltrados = (val === "todos") ? [...datosOriginales] : datosOriginales.filter(p => String(p.Modulo || p.modulo || "").trim() === val);
    datosFiltrados.sort((a, b) => (parseInt(a.Paso || a.paso) || 0) - (parseInt(b.Paso || b.paso) || 0));
    posicionActual = 0;
    actualizarInterfaz();
}

function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];
    const id = String(p["Pieza individual"] || "").trim();
    const mod = String(p.Modulo || p.modulo || "").trim().padStart(2, '0');

    document.getElementById("pieza-titulo").innerText = `PIEZA: ${id}`;
    document.getElementById("dato-modulo-linea").innerText = "MÓDULO " + mod;
    document.getElementById("dato-posicion-pieza").innerText = p["Ubicación pieza"] || p.posicion || "--";
    document.getElementById("dato-perno").innerText = p["Tipo Perno"] || "--";
    document.getElementById("dato-estandar").innerText = p["Acero Tuerca"] || p.stdtuerca || "--";
    document.getElementById("dato-torque").innerText = p["Par apriete (N.m) (Torque)"] || "0";
    
    // Medidas
    document.getElementById("dato-largo").innerText = p["Largo (mm)"] || 0;
    document.getElementById("dato-ancho").innerText = p["Ancho (mm)"] || 0;
    document.getElementById("dato-alto").innerText = p["Alto (mm)"] || 0;

    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} de ${datosFiltrados.length}`;
    document.getElementById("img-mapa").src = `fotos/mod${mod}${id}.jpg`;
    document.getElementById("img-visor").src = `fotos/${id}.jpg`;

    if(zUbi) zUbi.setZoom(1);
    if(zPieza) zPieza.setZoom(1);
}

function abrirZoomDetalle(id, tit) {
    document.getElementById("img-zoom-full").src = document.getElementById(id).src;
    document.getElementById("titulo-zoom-modal").innerText = tit;
    document.getElementById("modal-zoom-detallado").style.display = "flex";
    setTimeout(() => {
        if (!zFull) zFull = new PinchZoom.default(document.getElementById('wrapper-zoom-detalle'), { maxZoom: 6 });
        else zFull.setZoom(1);
    }, 150);
}

function cerrarZoomDetalle() { document.getElementById("modal-zoom-detallado").style.display = "none"; }

document.getElementById("btn-siguiente").onclick = () => { if(posicionActual < datosFiltrados.length - 1) { posicionActual++; actualizarInterfaz(); } };
document.getElementById("btn-atras").onclick = () => { if(posicionActual > 0) { posicionActual--; actualizarInterfaz(); } };

cargarDatos();
