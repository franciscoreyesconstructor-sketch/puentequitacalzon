let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

// 1. CARGA DE DATOS
async function cargarDatos() {
    try {
        // Usamos timestamp para evitar archivos viejos en memoria
        const respuesta = await fetch('datos_visor.json?v=' + Date.now());
        datosOriginales = await respuesta.json();
        
        poblarSelectModulo();
        aplicarFiltros();
    } catch (error) {
        console.error("Error al cargar el JSON:", error);
    }
}

// 2. SELECTOR DE MÓDULOS
function poblarSelectModulo() {
    const selectMod = document.getElementById("filtro-modulo");
    const modulos = [...new Set(datosOriginales.map(p => String(p.Modulo || p.modulo).trim()))].sort((a,b) => a - b);
    
    selectMod.innerHTML = '<option value="todos">📦 Módulo (Todos)</option>';
    modulos.forEach(m => {
        if(m && m !== "undefined") {
            selectMod.innerHTML += `<option value="${m}">Módulo ${m}</option>`;
        }
    });
    
    selectMod.onchange = aplicarFiltros;
}

// 3. FILTRADO
function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    
    datosFiltrados = (modVal === "todos") 
        ? [...datosOriginales] 
        : datosOriginales.filter(p => String(p.Modulo || p.modulo).trim() === modVal);
    
    posicionActual = 0;
    actualizarInterfaz();
}

// 4. ACTUALIZAR PANTALLA (Aquí corregimos el error del Perno)
function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];

    // --- CORRECCIÓN DE NOMBRES DE COLUMNA ---
    // Buscamos el perno de varias formas para no fallar
    const textoPerno = p["Tipo Perno"] || p.perno || p.Perno || p.PERNO || "--";
    const textoEstandar = p.stdtuerca || p["Acero Tuerca"] || p.estandar || "--";
    const textoTorque = p["Par apriete (N.m) (Torque)"] || p.torque || p.Torque || "0";

    // Textos en HTML
    document.getElementById("pieza-titulo").innerText = "PIEZA: " + (p["Pieza individual"] || "--");
    document.getElementById("dato-perno").innerText = textoPerno;
    document.getElementById("dato-acero-tuerca").innerText = textoEstandar;
    document.getElementById("dato-torque").innerText = textoTorque;
    
    // Cantidades
    document.getElementById("cant-pernos").innerText = p["Cantidad Pernos por pieza"] || 0;
    document.getElementById("cant-tuercas").innerText = p["Cantidad Tuercas por pieza"] || 0;
    document.getElementById("cant-golillas").innerText = p["Cantidad Golillas por pieza"] || 0;
    
    // Medidas
    document.getElementById("dato-largo").innerText = p["Largo (mm)"] || 0;
    document.getElementById("dato-ancho").innerText = p["Ancho (mm)"] || 0;
    document.getElementById("dato-alto").innerText = p["Alto (mm)"] || 0;

    // Imágenes (Lógica V5)
    const idPieza = String(p["Pieza individual"]).trim();
    const idMod = String(p.Modulo || p.modulo).trim();

    document.getElementById("img-mapa").src = `fotos/mod0${idMod}${idPieza}.jpg`;
    document.getElementById("img-visor").src = `fotos/${idPieza}.jpg`;

    // Contador
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
}

// 5. NAVEGACIÓN
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

