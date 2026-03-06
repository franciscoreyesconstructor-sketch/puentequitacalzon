let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

// Cargar el archivo JSON
async function cargarDatos() {
    try {
        // El v=9 evita que el navegador use datos viejos
        const respuesta = await fetch('datos_visor.json?v=9');
        datosOriginales = await respuesta.json();
        
        poblarSelectModulo();
        aplicarFiltros();
    } catch (error) {
        console.error("Error cargando el JSON:", error);
    }
}

// Llenar el selector de módulos
function poblarSelectModulo() {
    const selectMod = document.getElementById("filtro-modulo");
    const modulos = [...new Set(datosOriginales.map(p => String(p.Modulo).trim()))].sort((a,b) => a - b);
    
    selectMod.innerHTML = '<option value="todos">📦 Módulo (Todos)</option>';
    modulos.forEach(m => {
        if(m) selectMod.innerHTML += `<option value="${m}">Módulo ${m}</option>`;
    });
    
    selectMod.onchange = aplicarFiltros;
}

// Filtrar y Ordenar por Secuencia de Montaje
function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    
    // 1. Filtrar por módulo
    let temporal = (modVal === "todos") 
        ? [...datosOriginales] 
        : datosOriginales.filter(p => String(p.Modulo).trim() === modVal);
    
    // 2. ORDENAR POR PASO (Numéricamente)
    temporal.sort((a, b) => {
        let pasoA = parseFloat(a.Paso) || 0;
        let pasoB = parseFloat(b.Paso) || 0;
        return pasoA - pasoB;
    });

    datosFiltrados = temporal;
    posicionActual = 0;
    actualizarInterfaz();
}

// Mostrar los datos en pantalla
function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];

    // Nuevo: Mostrar el número del Paso
    document.getElementById("dato-paso").innerText = "PASO DE MONTAJE: " + (p.Paso || "--");
    
    // Textos de la pieza
    document.getElementById("pieza-titulo").innerText = "PIEZA: " + p["Pieza individual"];
    document.getElementById("dato-perno").innerText = p.perno || "--";
    document.getElementById("dato-acero-tuerca").innerText = p.stdtuerca || "--";
    document.getElementById("dato-torque").innerText = p["Par apriete (N.m) (Torque)"] || "0";
    document.getElementById("cant-pernos").innerText = p["Cantidad Pernos por pieza"] || "0";
    document.getElementById("cant-tuercas").innerText = p["Cantidad Tuercas por pieza"] || "0";
    document.getElementById("cant-golillas").innerText = p["Cantidad Golillas por pieza"] || "0";
    document.getElementById("dato-largo").innerText = p["Largo (mm)"] || "0";
    document.getElementById("dato-ancho").innerText = p["Ancho (mm)"] || "0";
    document.getElementById("dato-alto").innerText = p["Alto (mm)"] || "0";

    // Imágenes (Buscador inteligente de planos)
    const piezaID = String(p["Pieza individual"]).trim();
    const modID = String(p.Modulo).trim();

    document.getElementById("img-mapa").src = `fotos/mod0${modID}${piezaID}.jpg`;
    document.getElementById("img-visor").src = `fotos/${piezaID}.jpg`;

    // Si el plano no existe, mostramos un aviso limpio
    document.getElementById("img-mapa").onerror = function() {
        this.src = "https://via.placeholder.com/400x300?text=Plano+No+Disponible";
    };

    // Contador
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
}

// Botones de navegación
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
