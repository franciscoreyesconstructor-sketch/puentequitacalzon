let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

// 1. CARGA DE DATOS DESDE EL JSON
async function cargarDatos() {
    try {
        // Agregamos un timestamp (?v=) para que el celular no guarde versiones viejas
        const respuesta = await fetch('datos_visor.json?v=' + Date.now());
        datosOriginales = await respuesta.json();
        
        poblarSelectModulo();
        aplicarFiltros();
    } catch (error) {
        console.error("Error al cargar la base de datos:", error);
    }
}

// 2. LLENAR EL SELECTOR DE MÓDULOS
function poblarSelectModulo() {
    const selectMod = document.getElementById("filtro-modulo");
    // Obtenemos módulos únicos y los ordenamos numéricamente
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

// 3. FILTRAR LOS DATOS SEGÚN EL MÓDULO SELECCIONADO
function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    
    datosFiltrados = (modVal === "todos") 
        ? [...datosOriginales] 
        : datosOriginales.filter(p => String(p.Modulo || p.modulo).trim() === modVal);
    
    posicionActual = 0;
    actualizarInterfaz();
}

// 4. ACTUALIZAR TODA LA INFORMACIÓN EN PANTALLA
function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];

    // --- PROCESAMIENTO DE DATOS ---
    const idPieza = String(p["Pieza individual"] || "").trim();
    const numModRaw = String(p.Modulo || p.modulo || "").trim();
    
    // LÓGICA INTELIGENTE: Convierte "1" en "01", pero deja "11" como "11"
    const modFormateado = numModRaw.padStart(2, '0');

    // Mapeo de columnas con nombres exactos de tu Excel
    const valorPerno = p["Tipo Perno"] || p.perno || "--";
    const valorTorque = p["Par apriete (N.m) (Torque)"] || p.torque || "0";

    // --- INYECCIÓN EN EL HTML ---
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

    // --- CARGA DE IMÁGENES ---
    if (idPieza) {
        // Plano Ubicación: fotos/mod + (01 a 21) + pieza.jpg
        document.getElementById("img-mapa").src = `fotos/mod${modFormateado}${idPieza}.jpg`;
        
        // Foto Real: fotos/pieza.jpg
        document.getElementById("img-visor").src = `fotos/${idPieza}.jpg`;
    }

    // --- NAVEGACIÓN Y ZOOM ---
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
    
    // Reiniciar el Zoom cada vez que cambiamos de pieza
    if (typeof mediumZoom !== 'undefined') {
        mediumZoom('.zoom', {
            margin: 20,
            background: '#000',
            scrollOffset: 0
        });
    }
}

// 5. CONTROL DE BOTONES ANTERIOR / SIGUIENTE
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

// INICIO AUTOMÁTICO
cargarDatos();
