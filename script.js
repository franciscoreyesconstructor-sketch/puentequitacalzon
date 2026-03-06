let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

// 1. CARGA INICIAL
async function cargarDatos() {
    try {
        const res = await fetch('datos_visor.json?v=' + Date.now());
        if (!res.ok) throw new Error("No se encuentra datos_visor.json");
        datosOriginales = await res.json();
        poblarSelectModulo();
        aplicarFiltros();
    } catch (e) {
        console.error("Error cargando base de datos:", e);
    }
}

// 2. FILTROS Y ORDENAMIENTO POR PASO
function poblarSelectModulo() {
    const selectMod = document.getElementById("filtro-modulo");
    const modulos = [...new Set(datosOriginales.map(p => String(p.Modulo || p.modulo).trim()))].sort((a,b) => a - b);
    modulos.forEach(m => {
        if(m && m !== "undefined") selectMod.innerHTML += `<option value="${m}">Módulo ${m}</option>`;
    });
    selectMod.onchange = aplicarFiltros;
}

function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    let temp = (modVal === "todos") ? [...datosOriginales] : datosOriginales.filter(p => String(p.Modulo || p.modulo).trim() === modVal);
    
    // ORDENAR POR PASO (0.9, 1.0, 1.1...)
    temp.sort((a, b) => (parseFloat(a.Paso || a.paso) || 0) - (parseFloat(b.Paso || b.paso) || 0));
    
    datosFiltrados = temp;
    posicionActual = 0;
    actualizarInterfaz();
}

// 3. ACTUALIZAR PANTALLA
function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];

    // Textos Identificadores
    const idPieza = p["Pieza individual"] || "--";
    const numPaso = p.Paso || p.paso || "--";
    
    document.getElementById("pieza-titulo").innerText = "PIEZA: " + idPieza;
    document.getElementById("pieza-nombre-grande").innerText = "PIEZA: " + idPieza;
    document.getElementById("dato-paso-linea").innerText = "PASO " + numPaso;
    document.getElementById("valor-paso-grande").innerText = "PASO " + numPaso;

    // Datos Técnicos
    document.getElementById("dato-perno").innerText = p.perno || "--";
    document.getElementById("dato-acero-tuerca").innerText = p.stdtuerca || p["Acero Tuerca"] || "--";
    document.getElementById("dato-torque").innerText = p["Par apriete (N.m) (Torque)"] || "0";
    document.getElementById("cant-pernos").innerText = p["Cantidad Pernos por pieza"] || "0";
    document.getElementById("cant-tuercas").innerText = p["Cantidad Tuercas por pieza"] || "0";
    document.getElementById("cant-golillas").innerText = p["Cantidad Golillas por pieza"] || "0";
    document.getElementById("dato-largo").innerText = p["Largo (mm)"] || "0";
    document.getElementById("dato-ancho").innerText = p["Ancho (mm)"] || "0";
    document.getElementById("dato-alto").innerText = p["Alto (mm)"] || "0";

    // IMÁGENES (Lógica V5.9: mod0 + módulo + pieza)
    const modID = String(p.Modulo || p.modulo).trim();
    document.getElementById("img-mapa").src = `fotos/mod0${modID}${idPieza}.jpg`;
    document.getElementById("img-visor").src = `fotos/${idPieza}.jpg`;

    // Contador
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
}

// 4. FUNCIONES DE LA PANTALLA DE SECUENCIA
function abrirSecuencia() { document.getElementById("pantalla-paso").style.display = "flex"; }
function cerrarSecuencia() { document.getElementById("pantalla-paso").style.display = "none"; }

// 5. NAVEGACIÓN
document.getElementById("btn-siguiente").onclick = () => { if(posicionActual < datosFiltrados.length - 1){ posicionActual++; actualizarInterfaz(); } };
document.getElementById("btn-atras").onclick = () => { if(posicionActual > 0){ posicionActual--; actualizarInterfaz(); } };

cargarDatos();
