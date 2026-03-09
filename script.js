let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;
let pzGeneral, pzPlano, pzFoto;

async function cargarDatos() {
    try {
        console.log("Iniciando carga de datos...");
        const respuesta = await fetch('datos_visor.json?v=' + Date.now());
        if (!respuesta.ok) throw new Error("No se pudo cargar el archivo JSON");
        
        datosOriginales = await respuesta.json();
        console.log("Datos cargados:", datosOriginales.length);

        poblarSelectModulo();
        aplicarFiltros();
        inicializarZooms();
    } catch (error) {
        console.error("Error crítico:", error);
        document.getElementById("pieza-titulo").innerText = "ERROR AL CARGAR JSON";
    }
}

function inicializarZooms() {
    // Inicializar los contenedores de pellizco
    try {
        pzPlano = new PinchZoom.default(document.getElementById('zoom-plano'), { minZoom: 1, maxZoom: 4 });
        pzFoto = new PinchZoom.default(document.getElementById('zoom-foto'), { minZoom: 1, maxZoom: 4 });
    } catch (e) { console.log("Librería de zoom no lista"); }
}

function poblarSelectModulo() {
    const selectMod = document.getElementById("filtro-modulo");
    // Detectar si la propiedad es 'Modulo' o 'modulo'
    const modulos = [...new Set(datosOriginales.map(p => String(p.Modulo || p.modulo || "").trim()))]
        .filter(m => m !== "" && m !== "undefined")
        .sort((a, b) => a - b);

    selectMod.innerHTML = '<option value="todos">📦 Módulo (Todos)</option>';
    modulos.forEach(m => {
        selectMod.innerHTML += `<option value="${m}">Módulo ${m}</option>`;
    });
    
    selectMod.onchange = aplicarFiltros;
}

function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    
    let filtrados = (modVal === "todos") 
        ? [...datosOriginales] 
        : datosOriginales.filter(p => String(p.Modulo || p.modulo || "").trim() === modVal);
    
    // Ordenar por columna Paso
    datosFiltrados = filtrados.sort((a, b) => (parseInt(a.Paso) || 0) - (parseInt(b.Paso) || 0));
    
    posicionActual = 0;
    actualizarInterfaz();
}

function actualizarInterfaz() {
    if (datosFiltrados.length === 0) {
        document.getElementById("pieza-titulo").innerText = "SIN DATOS DISPONIBLES";
        return;
    }

    const p = datosFiltrados[posicionActual];
    const idPieza = String(p["Pieza individual"] || "").trim();
    const modRaw = String(p.Modulo || p.modulo || "").trim();
    const modFormateado = modRaw.padStart(2, '0');

    // Cargar Imágenes con prevención de error
    const imgMapa = document.getElementById("img-mapa");
    const imgVisor = document.getElementById("img-visor");

    imgMapa.src = `fotos/mod${modFormateado}${idPieza}.jpg`;
    imgVisor.src = `fotos/${idPieza}.jpg`;

    // Resetear Zooms al cambiar
    if(pzPlano) pzPlano.setZoom(1);
    if(pzFoto) pzFoto.setZoom(1);

    // Actualizar Textos
    document.getElementById("pieza-titulo").innerText = `PIEZA: ${idPieza} (PASO ${p.Paso || '--'})`;
    document.getElementById("dato-modulo-linea").innerText = "MÓDULO " + modFormateado;
    document.getElementById("dato-posicion-pieza").innerText = p["Ubicación pieza"] || p.posicion || "--";
    document.getElementById("dato-perno").innerText = p["Tipo Perno"] || "--";
    document.getElementById("dato-torque").innerText = p["Par apriete (N.m) (Torque)"] || "0";

    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
}

function mostrarMapaGeneral() {
    const modal = document.getElementById("modal-mapa-general");
    const img = document.getElementById("img-ubimod");
    img.src = `fotos/ubimod.jpg?v=${Date.now()}`; 
    modal.style.display = "flex";

    setTimeout(() => {
        if (!pzGeneral) {
            pzGeneral = new PinchZoom.default(document.getElementById('zoom-general'), { minZoom: 1, maxZoom: 6 });
        } else {
            pzGeneral.setZoom(1);
        }
    }, 100);
}

function cerrarMapaGeneral() {
    document.getElementById("modal-mapa-general").style.display = "none";
}

// Botones
document.getElementById("btn-siguiente").onclick = () => {
    if(posicionActual < datosFiltrados.length - 1) { posicionActual++; actualizarInterfaz(); }
};
document.getElementById("btn-atras").onclick = () => {
    if(posicionActual > 0) { posicionActual--; actualizarInterfaz(); }
};

// Iniciar
window.onload = cargarDatos;
