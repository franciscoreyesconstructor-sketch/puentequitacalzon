let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

async function cargarDatos() {
    try {
        const res = await fetch('datos_visor.json');
        datosOriginales = await res.json();
        datosFiltrados = [...datosOriginales];
        poblarSelectModulo();
        actualizarSelectPiezas(); 
        actualizarInterfaz();
    } catch (e) { console.error("Error", e); }
}

function poblarSelectModulo() {
    const modulos = [...new Set(datosOriginales.map(p => String(p["Modulo"]).trim()))].sort((a,b) => a - b);
    const selectMod = document.getElementById("filtro-modulo");
    modulos.forEach(m => { if(m && m !== "undefined") selectMod.innerHTML += `<option value="${m}">Módulo ${m}</option>`; });
    selectMod.onchange = () => { actualizarSelectPiezas(); aplicarFiltros(); };
}

function actualizarSelectPiezas() {
    const modSeleccionado = document.getElementById("filtro-modulo").value;
    const selectPieza = document.getElementById("filtro-pieza");
    selectPieza.innerHTML = '<option value="todos">🔍 Seleccionar Pieza</option>';
    const piezasDisponibles = (modSeleccionado === "todos") ? datosOriginales : datosOriginales.filter(p => String(p["Modulo"]).trim() === modSeleccionado);
    piezasDisponibles.forEach(p => {
        const codigo = p["Pieza individual"];
        if(codigo) selectPieza.innerHTML += `<option value="${codigo}">${codigo}</option>`;
    });
    selectPieza.onchange = aplicarFiltros;
}

function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    const piezaVal = document.getElementById("filtro-pieza").value;
    datosFiltrados = datosOriginales.filter(p => (modVal === "todos" || String(p["Modulo"]).trim() === modVal));
    if (piezaVal !== "todos") {
        const index = datosFiltrados.findIndex(p => String(p["Pieza individual"]).trim() === piezaVal);
        if (index !== -1) posicionActual = index;
    } else {
        posicionActual = 0;
    }
    actualizarInterfaz();
}

function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];
    const id = String(p["Pieza individual"]).trim();
    const mod = String(p["Modulo"]).trim();

    document.getElementById("pieza-titulo").innerText = "PIEZA: " + id;
    document.getElementById("dato-perno").innerText = p["perno"] || "---";
    document.getElementById("dato-acero-tuerca").innerText = p["stdtuerca"] || "---";
    document.getElementById("dato-torque").innerText = p["Par apriete (N.m) (Torque)"] || "0";
    document.getElementById("cant-pernos").innerText = p["Cantidad Pernos por pieza"] || "0";
    document.getElementById("cant-tuercas").innerText = p["Cantidad Tuercas por pieza"] || "0";
    document.getElementById("cant-golillas").innerText = p["Cantidad Golillas por pieza"] || "0";
    document.getElementById("dato-largo").innerText = p["Largo (mm)"] || "0";
    document.getElementById("dato-ancho").innerText = p["Ancho (mm)"] || "0";
    document.getElementById("dato-alto").innerText = p["Alto (mm)"] || "0";

    // LÓGICA DE IMÁGENES REFORZADA MÓDULO 11
    let nombreFotoPlano = (mod === "11" || mod.includes("11")) ? `mod11${id}.jpg` : `mod01${id}.jpg`;
    
    const imgMapa = document.getElementById("img-mapa");
    const imgVisor = document.getElementById("img-visor");
    imgMapa.src = `fotos/${nombreFotoPlano}`;
    imgVisor.src = `fotos/${id}.jpg`;

    // Corrección automática de extensión
    imgMapa.onerror = () => { if (!imgMapa.src.includes(".JPG")) imgMapa.src = imgMapa.src.replace(".jpg", ".JPG"); };

    document.querySelectorAll(".etiqueta-mod").forEach(el => el.innerText = "MOD: " + mod);
    document.querySelectorAll(".etiqueta-nombre").forEach(el => el.innerText = id);
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
}

document.getElementById("btn-siguiente").onclick = () => { if(posicionActual < datosFiltrados.length-1) { posicionActual++; actualizarInterfaz(); } };
document.getElementById("btn-atras").onclick = () => { if(posicionActual > 0) { posicionActual--; actualizarInterfaz(); } };
document.querySelectorAll('img').forEach(img => { img.onclick = function() { this.classList.toggle("img-zoom"); }; });

cargarDatos();