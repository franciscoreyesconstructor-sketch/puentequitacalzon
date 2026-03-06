let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

async function cargarDatos() {
    try {
        const res = await fetch('datos_visor.json');
        datosOriginales = await res.json();
        poblarSelectModulo();
        aplicarFiltros();
    } catch (e) { console.error("Error al cargar JSON:", e); }
}

function poblarSelectModulo() {
    const selectMod = document.getElementById("filtro-modulo");
    const modulos = [...new Set(datosOriginales.map(p => String(p.Modulo).trim()))].sort((a,b) => a - b);
    selectMod.innerHTML = '<option value="todos">📦 Todos los Módulos</option>';
    modulos.forEach(m => {
        if(m) selectMod.innerHTML += `<option value="${m}">Módulo ${m}</option>`;
    });
    selectMod.onchange = aplicarFiltros;
}

function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    
    // 1. Filtramos por módulo
    let temporal = (modVal === "todos") 
        ? [...datosOriginales] 
        : datosOriginales.filter(p => String(p.Modulo).trim() === modVal);
    
    // 2. ORDENAR POR PASO (CRECIENTE)
    // Usamos parseFloat para que 0.10 venga después de 0.9 correctamente
    temporal.sort((a, b) => {
        let pasoA = parseFloat(a.Paso) || 0;
        let pasoB = parseFloat(b.Paso) || 0;
        return pasoA - pasoB;
    });

    datosFiltrados = temporal;
    posicionActual = 0;
    actualizarInterfaz();
}

function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];
    
    // Vinculación de datos a los IDs del HTML
    document.getElementById("dato-secuencia").innerText = "SECUENCIA DE MONTAJE: PASO " + (p.Paso || "--");
    document.getElementById("pieza-titulo").innerText = "PIEZA: " + p["Pieza individual"];
    document.getElementById("dato-perno").innerText = p.perno || "N/A";
    document.getElementById("dato-acero-tuerca").innerText = p.stdtuerca || "--";
    document.getElementById("dato-torque").innerText = p["Par apriete (N.m) (Torque)"] || "0";
    document.getElementById("cant-pernos").innerText = p["Cantidad Pernos por pieza"] || "0";
    document.getElementById("cant-tuercas").innerText = p["Cantidad Tuercas por pieza"] || "0";
    document.getElementById("cant-golillas").innerText = p["Cantidad Golillas por pieza"] || "0";
    document.getElementById("dato-largo").innerText = p["Largo (mm)"] || "0";
    document.getElementById("dato-ancho").innerText = p["Ancho (mm)"] || "0";
    document.getElementById("dato-alto").innerText = p["Alto (mm)"] || "0";

    // Carga de imágenes
    const piezaID = String(p["Pieza individual"]).trim();
    const modID = String(p["Modulo"]).trim();
    
    document.getElementById("img-visor").src = `fotos/${piezaID}.jpg`;
    document.getElementById("img-mapa").src = `fotos/mod0${modID}${piezaID}.jpg`;

    // Indicador de posición
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
}

// Navegación
document.getElementById("btn-siguiente").onclick = () => {
    if(posicionActual < datosFiltrados.length - 1) {
        posicionActual++;
        actualizarInterfaz();
    }
};

document.getElementById("btn-atras").onclick = () => {
    if(posicionActual > 0) {
        posicionActual--;
        actualizarInterfaz();
    }
};

cargarDatos();
