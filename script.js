let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

// Variables para los controles de zoom
let pzGeneral, pzPlano, pzFoto;

async function cargarDatos() {
    try {
        const respuesta = await fetch('datos_visor.json?v=' + Date.now());
        datosOriginales = await respuesta.json();
        poblarSelectModulo();
        aplicarFiltros();
        // Inicializar zooms de las miniaturas
        pzPlano = new PinchZoom.default(document.getElementById('zoom-plano'), { minZoom: 1, maxZoom: 4 });
        pzFoto = new PinchZoom.default(document.getElementById('zoom-foto'), { minZoom: 1, maxZoom: 4 });
    } catch (error) {
        console.error("Error al cargar el JSON:", error);
    }
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
            pzGeneral.setZoom(1); // Resetear zoom al abrir
        }
    }, 100);
}

function cerrarMapaGeneral() {
    document.getElementById("modal-mapa-general").style.display = "none";
}

function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];
    const idPieza = String(p["Pieza individual"] || "").trim();
    const modFormateado = String(p.Modulo || p.modulo || "").trim().padStart(2, '0');

    // Cargar Imágenes
    if (idPieza) {
        document.getElementById("img-mapa").src = `fotos/mod${modFormateado}${idPieza}.jpg`;
        document.getElementById("img-visor").src = `fotos/${idPieza}.jpg`;
        
        // Resetear pellizco al cambiar de pieza para que no empiece zoomeado
        if(pzPlano) pzPlano.setZoom(1);
        if(pzFoto) pzFoto.setZoom(1);
    }

    // Datos de texto
    document.getElementById("pieza-titulo").innerText = `PIEZA: ${idPieza} (PASO ${p.Paso || '--'})`;
    document.getElementById("dato-modulo-linea").innerText = "MÓDULO " + modFormateado;
    document.getElementById("dato-posicion-pieza").innerText = p["Ubicación pieza"] || p.posicion || "--";
    document.getElementById("dato-perno").innerText = p["Tipo Perno"] || "--";
    document.getElementById("dato-torque").innerText = p["Par apriete (N.m) (Torque)"] || "0";

    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
}

// ... mantener funciones poblarSelectModulo, aplicarFiltros y botones de navegación ...

cargarDatos();
