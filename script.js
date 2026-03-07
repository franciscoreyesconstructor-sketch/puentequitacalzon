let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

// 1. CARGA DE DATOS
async function cargarDatos() {
    try {
        // Usamos el timestamp (?v=) para forzar al navegador a descargar la versión más reciente
        const respuesta = await fetch('datos_visor.json?v=' + Date.now());
        datosOriginales = await respuesta.json();
        
        poblarSelectModulo();
        aplicarFiltros();
    } catch (error) {
        console.error("Error al cargar el JSON:", error);
    }
}

// 2. POBLAR EL SELECTOR DE MÓDULOS
function poblarSelectModulo() {
    const selectMod = document.getElementById("filtro-modulo");
    // Extraer módulos únicos y ordenarlos numéricamente
    const modulos = [...new Set(datosOriginales.map(p => String(p.Modulo || p.modulo).trim()))]
                    .sort((a, b) => a - b);
    
    selectMod.innerHTML = '<option value="todos">📦 Módulo (Todos)</option>';
    modulos.forEach(m => {
        if(m && m !== "undefined") {
            selectMod.innerHTML += `<option value="${m}">Módulo ${m}</option>`;
        }
    });
    
    selectMod.onchange = aplicarFiltros;
}

// 3. FILTRAR POR SELECCIÓN
function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    
    datosFiltrados = (modVal === "todos") 
        ? [...datosOriginales] 
        : datosOriginales.filter(p => String(p.Modulo || p.modulo).trim() === modVal);
    
    posicionActual = 0;
    actualizarInterfaz();
}

// 4. ACTUALIZAR INTERFAZ (DATOS E IMÁGENES)
function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];

    // --- PROCESAMIENTO DE VARIABLES ---
    const idPieza = String(p["Pieza individual"] || "").trim();
    const numModRaw = String(p.Modulo || p.modulo || "").trim();
    
    // LÓGICA DE MÓDULO: Agrega el "0" si es de un solo dígito (1 -> 01, 11 -> 11)
    const modFormateado = numModRaw.padStart(2, '0');

    // Nombres de columna exactos según tu archivo
    const valorPerno = p["Tipo Perno"] || p.perno || "--";
    const valorTorque = p["Par apriete (N.m) (Torque)"] || p.torque || "0";

    // --- ACTUALIZAR TEXTOS ---
    document.getElementById("pieza-titulo").innerText = "PIEZA: " + idPieza;
    document.getElementById("dato-modulo-linea").innerText = "MÓDULO " + modFormateado;
    
    document.getElementById("dato-perno").innerText = valorPerno;
    document.getElementById("dato-acero-tuerca").innerText = p.stdtuerca || p["Acero Tuerca"] || "--";
    document.getElementById("dato-torque").innerText = valorTorque;
    
    // Cantidades
    document.getElementById("cant-pernos").innerText = p["Cantidad Pernos por pieza"] || 0;
    document.getElementById("cant-tuercas").innerText = p["Cantidad Tuercas por pieza"] || 0;
    document.getElementById("cant-golillas").innerText = p["Cantidad Golillas por pieza"] || 0;
    
    // Medidas
    document.getElementById("dato-largo").innerText = p["Largo (mm)"] || 0;
    document.getElementById("dato-ancho").innerText = p["Ancho (mm)"] || 0;
    document.getElementById("dato-alto").innerText = p["Alto (mm)"] || 0;

    // --- ACTUALIZAR IMÁGENES ---
    if (idPieza) {
        // Plano: fotos/mod + (01..21) + pieza.jpg
        document.getElementById("img-mapa").src = `fotos/mod${modFormateado}${idPieza}.jpg`;
        
        // Foto: fotos/pieza.jpg
        document.getElementById("img-visor").src = `fotos/${idPieza}.jpg`;
    }

    // --- NAVEGACIÓN Y ZOOM ---
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
    
    // Reiniciar Medium Zoom para las nuevas imágenes cargadas
    if (typeof mediumZoom !== 'undefined') {
        mediumZoom('.zoom', {
            margin: 20,
            background: '#000',
            scrollOffset: 0
        });
    }
}

// 5. EVENTOS DE BOTONES
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

// INICIAR APP
cargarDatos();
