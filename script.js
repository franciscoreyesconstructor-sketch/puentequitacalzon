let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

async function cargarDatos() {
    try {
        const res = await fetch('datos_visor.json');
        const rawData = await res.json();
        // Limpieza de nombres de columnas
        datosOriginales = rawData.map(item => {
            let nuevoItem = {};
            for (let key in item) { nuevoItem[key.trim()] = item[key]; }
            return nuevoItem;
        });
        poblarSelectModulo();
        actualizarSelectPiezas(); 
        actualizarInterfaz();
    } catch (e) { console.error("Error cargando JSON", e); }
}

function poblarSelectModulo() {
    const selectMod = document.getElementById("filtro-modulo");
    const modulos = [...new Set(datosOriginales.map(p => String(p["Modulo"] || "").trim()))]
                    .filter(m => m !== "" && m !== "undefined").sort((a,b) => a - b);
    selectMod.innerHTML = '<option value="todos">📦 Módulo (Todos)</option>';
    modulos.forEach(m => { selectMod.innerHTML += `<option value="${m}">Módulo ${m}</option>`; });
    selectMod.onchange = () => { actualizarSelectPiezas(); aplicarFiltros(); };
}

function actualizarSelectPiezas() {
    const modSeleccionado = document.getElementById("filtro-modulo").value;
    const selectPieza = document.getElementById("filtro-pieza");
    selectPieza.innerHTML = '<option value="todos">🔍 Seleccionar Pieza</option>';
    const piezas = (modSeleccionado === "todos") ? datosOriginales : datosOriginales.filter(p => String(p["Modulo"] || "").trim() === modSeleccionado);
    piezas.forEach(p => { if(p["Pieza individual"]) selectPieza.innerHTML += `<option value="${p["Pieza individual"]}">${p["Pieza individual"]}</option>`; });
    selectPieza.onchange = aplicarFiltros;
}

function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    const piezaVal = document.getElementById("filtro-pieza").value;
    datosFiltrados = datosOriginales.filter(p => (modVal === "todos" || String(p["Modulo"] || "").trim() === modVal));
    posicionActual = (piezaVal !== "todos") ? datosFiltrados.findIndex(p => String(p["Pieza individual"] || "").trim() === piezaVal) : 0;
    if (posicionActual === -1) posicionActual = 0;
    actualizarInterfaz();
}

function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];
    const id = String(p["Pieza individual"] || "").trim();
    const mod = String(p["Modulo"] || "").trim();

    // Actualizar Textos
    document.getElementById("pieza-titulo").innerText = "PIEZA: " + id;
    document.getElementById("dato-perno").innerText = p["perno"] || "---";
    document.getElementById("dato-torque").innerText = (p["Par apriete (N.m) (Torque)"] || "0") + " N.m";

    // --- LÓGICA DE IMÁGENES "INTELIGENTE" ---
    const imgMapa = document.getElementById("img-mapa");
    const imgVisor = document.getElementById("img-visor");

    let prefijo = (mod === "11") ? "mod11" : "mod01";
    
    // Intentamos cargar (por defecto busca .jpg minúscula)
    imgMapa.src = `fotos/${prefijo}${id}.jpg`;
    imgVisor.src = `fotos/${id}.jpg`;

    // Si falla el mapa, intentamos con el ID en mayúsculas y extensión .JPG
    imgMapa.onerror = function() {
        if (!this.src.includes(".JPG")) {
            this.src = `fotos/${prefijo}${id.toUpperCase()}.JPG`;
        }
    };

    // Si falla la foto de la pieza, lo mismo
    imgVisor.onerror = function() {
        if (!this.src.includes(".JPG")) {
            this.src = `fotos/${id.toUpperCase()}.JPG`;
        }
    };

    document.querySelectorAll(".etiqueta-mod").forEach(el => el.innerText = "MOD: " + mod);
    document.querySelectorAll(".etiqueta-nombre").forEach(el => el.innerText = id);
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
}

document.getElementById("btn-siguiente").onclick = () => { if(posicionActual < datosFiltrados.length-1) { posicionActual++; actualizarInterfaz(); } };
document.getElementById("btn-atras").onclick = () => { if(posicionActual > 0) { posicionActual--; actualizarInterfaz(); } };

cargarDatos();