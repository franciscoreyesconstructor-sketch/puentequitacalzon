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
    
    // Identificación del Paso
    const pasoActual = p.Paso || p.paso || "0";
    document.getElementById("num-paso").innerText = pasoActual;

    // Actualizar resto de la interfaz
    const id = String(p["Pieza individual"] || "").trim();
    const mod = String(p.Modulo || p.modulo || "").trim().padStart(2, '0');

    document.getElementById("pieza-titulo").innerText = `PIEZA: ${id}`;
    // ... (resto de las asignaciones de datos: perno, torque, etc.) ...

    // Actualizar imágenes
    document.getElementById("img-mapa").src = `fotos/mod${mod}${id}.jpg`;
    document.getElementById("img-visor").src = `fotos/${id}.jpg`;
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
