let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

// Instancias de zoom
let zoomPlano, zoomFoto, zoomGeneral;

async function cargarDatos() {
    try {
        const respuesta = await fetch('datos_visor.json?v=' + Date.now());
        datosOriginales = await respuesta.json();
        
        // Inicializar zooms DESPUÉS de asegurar que existen los elementos en el DOM
        setTimeout(() => {
            try {
                zoomPlano = new PinchZoom.default(document.getElementById('wrapper-plano'), { minZoom: 1, maxZoom: 4 });
                zoomFoto = new PinchZoom.default(document.getElementById('wrapper-foto'), { minZoom: 1, maxZoom: 4 });
            } catch (e) {
                console.warn("PinchZoom no listo, se reintentará.");
            }
        }, 500);

        poblarSelectModulo();
        aplicarFiltros();
    } catch (error) {
        console.error("Error al cargar datos:", error);
    }
}

function poblarSelectModulo() {
    const selectMod = document.getElementById("filtro-modulo");
    const modulos = [...new Set(datosOriginales.map(p => String(p.Modulo || p.modulo || "").trim()))]
        .filter(m => m !== "" && m !== "undefined")
        .sort((a, b) => a - b);

    selectMod.innerHTML = '<option value="todos">📦 TODOS LOS MÓDULOS</option>';
    modulos.forEach(m => {
        selectMod.innerHTML += `<option value="${m}">MÓDULO ${m}</option>`;
    });
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
    const modRaw = String(p.Modulo || p.modulo || "").trim();
    const modFormateado = modRaw.padStart(2, '0');

    // Actualizar Textos
    document.getElementById("pieza-titulo").innerText = `PIEZA ${idPieza} (PASO ${p.Paso || p.paso || '--'})`;
    document.getElementById("dato-modulo-linea").innerText = "MÓDULO " + modFormateado;
    document.getElementById("dato-posicion-pieza").innerText = p["Ubicación pieza"] || p.posicion || "--";
    document.getElementById("dato-perno").innerText = p["Tipo Perno"] || "--";
    document.getElementById("dato-estandar").innerText = p["Acero Tuerca"] || p.stdtuerca || "--";
    document.getElementById("dato-torque").innerText = p["Par apriete (N.m) (Torque)"] || "0";
    
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} de ${datosFiltrados.length}`;

    // Actualizar Imágenes
    if (idPieza) {
        document.getElementById("img-mapa").src = `fotos/mod${modFormateado}${idPieza}.jpg`;
        document.getElementById("img-visor").src = `fotos/${idPieza}.jpg`;
    }

    // RESETEAR ZOOM CON SEGURIDAD (Evita el error TypeError)
    if (zoomPlano && typeof zoomPlano.setZoom === 'function') {
        zoomPlano.setZoom(1);
    }
    if (zoomFoto && typeof zoomFoto.setZoom === 'function') {
        zoomFoto.setZoom(1);
    }
}

function mostrarMapaGeneral() {
    const modal = document.getElementById("modal-mapa-general");
    document.getElementById("img-ubimod").src = `fotos/ubimod.jpg?v=${Date.now()}`; 
    modal.style.display = "flex";
    
    setTimeout(() => {
        if (!zoomGeneral && typeof PinchZoom !== 'undefined') {
            zoomGeneral = new PinchZoom.default(document.getElementById('wrapper-general'), { minZoom: 1, maxZoom: 6 });
        } else if (zoomGeneral && typeof zoomGeneral.setZoom === 'function') {
            zoomGeneral.setZoom(1);
        }
    }, 200);
}

function cerrarMapaGeneral() {
    document.getElementById("modal-mapa-general").style.display = "none";
}

document.getElementById("btn-siguiente").onclick = () => {
    if(posicionActual < datosFiltrados.length - 1) { posicionActual++; actualizarInterfaz(); }
};
document.getElementById("btn-atras").onclick = () => {
    if(posicionActual > 0) { posicionActual--; actualizarInterfaz(); }
};

cargarDatos();
