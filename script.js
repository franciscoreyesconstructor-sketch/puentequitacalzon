// ==========================================
// VARIABLES GLOBALES
// ==========================================
let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

// 1. CARGA DE DATOS (JSON)
async function cargarDatos() {
    try {
        // El parámetro ?v=9 fuerza al navegador a no usar versiones viejas guardadas
        const respuesta = await fetch('datos_visor.json?v=9');
        
        if (!respuesta.ok) {
            throw new Error("No se pudo encontrar el archivo datos_visor.json");
        }

        datosOriginales = await respuesta.json();
        console.log("Datos cargados con éxito. Total filas: " + datosOriginales.length);
        
        poblarSelectModulo();
        aplicarFiltros();
    } catch (error) {
        console.error("Error crítico en cargarDatos:", error);
    }
}

// 2. LLENAR SELECTOR DE MÓDULOS
function poblarSelectModulo() {
    const selectMod = document.getElementById("filtro-modulo");
    
    // Obtenemos los módulos, quitamos espacios y ordenamos
    const modulos = [...new Set(datosOriginales.map(p => String(p.Modulo || p.modulo).trim()))].sort((a, b) => a - b);
    
    selectMod.innerHTML = '<option value="todos">📦 Módulo (Todos)</option>';
    modulos.forEach(m => {
        if (m && m !== "undefined") {
            selectMod.innerHTML += `<option value="${m}">Módulo ${m}</option>`;
        }
    });
    
    selectMod.onchange = aplicarFiltros;
}

// 3. FILTRADO Y ORDENAMIENTO POR PASO
function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    
    // Filtrar por módulo seleccionado
    let temporal = (modVal === "todos") 
        ? [...datosOriginales] 
        : datosOriginales.filter(p => String(p.Modulo || p.modulo).trim() === modVal);
    
    // ORDENAR POR PASO (Numéricamente: 0.9, 1.0, 1.1...)
    temporal.sort((a, b) => {
        let pasoA = parseFloat(a.Paso || a.paso) || 0;
        let pasoB = parseFloat(b.Paso || b.paso) || 0;
        return pasoA - pasoB;
    });

    datosFiltrados = temporal;
    posicionActual = 0;
    actualizarInterfaz();
}

// 4. ACTUALIZAR LA INTERFAZ (TEXTOS E IMÁGENES)
function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;

    const p = datosFiltrados[posicionActual];
    
    // --- LLENADO DE TEXTOS ---
    const valorPaso = p.Paso || p.paso || "--";
    document.getElementById("dato-paso").innerText = "PASO DE MONTAJE: " + valorPaso;
    
    document.getElementById("pieza-titulo").innerText = "PIEZA: " + (p["Pieza individual"] || "--");
    document.getElementById("dato-perno").innerText = p.perno || "VER PLANO";
    document.getElementById("dato-acero-tuerca").innerText = p.stdtuerca || "--";
    document.getElementById("dato-torque").innerText = p["Par apriete (N.m) (Torque)"] || "0";
    
    document.getElementById("cant-pernos").innerText = p["Cantidad Pernos por pieza"] || "0";
    document.getElementById("cant-tuercas").innerText = p["Cantidad Tuercas por pieza"] || "0";
    document.getElementById("cant-golillas").innerText = p["Cantidad Golillas por pieza"] || "0";
    
    document.getElementById("dato-largo").innerText = p["Largo (mm)"] || "0";
    document.getElementById("dato-ancho").innerText = p["Ancho (mm)"] || "0";
    document.getElementById("dato-alto").innerText = p["Alto (mm)"] || "0";

    // --- LÓGICA DE IMÁGENES (FOTO Y PLANO) ---
    const piezaID = String(p["Pieza individual"]).trim();
    const modID = String(p.Modulo || p.modulo).trim();
    
    const imgMapa = document.getElementById("img-mapa");
    const imgVisor = document.getElementById("img-visor");

    // Foto de la pieza (Normal)
    imgVisor.src = `fotos/${piezaID}.jpg`;

    // Plano de Ubicación (Lógica de búsqueda mejorada)
    // Intento 1: mod01 + NombrePieza (ej: mod0160IC15W.jpg)
    const nombrePlano = `mod0${modID}${piezaID}.jpg`;
    imgMapa.src = `fotos/${nombrePlano}`;

    // Si el plano no carga, intentamos un plan B o mostramos error claro
    imgMapa.onerror = function() {
        console.warn("No se encontró el archivo: " + nombrePlano);
        // Si falla, podrías intentar buscarlo solo por piezaID o dejar el aviso:
        this.src = "https://via.placeholder.com/400x300?text=Plano+No+Encontrado";
    };
    
    imgVisor.onerror = function() {
        this.src = "https://via.placeholder.com/400x300?text=Foto+No+Disponible";
    };

    // Actualizar el contador (1 / 224)
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
}

// 5. BOTONES DE NAVEGACIÓN
document.getElementById("btn-siguiente").onclick = () => {
    if (posicionActual < datosFiltrados.length - 1) {
        posicionActual++;
        actualizarInterfaz();
    }
};

document.getElementById("btn-atras").onclick = () => {
    if (posicionActual > 0) {
        posicionActual--;
        actualizarInterfaz();
    }
};

// INICIAR CARGA AL ABRIR LA PÁGINA
cargarDatos();
