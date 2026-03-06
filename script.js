// VARIABLES GLOBALES
let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

// 1. CARGA INICIAL DE DATOS
async function cargarDatos() {
    try {
        // El parámetro v=1.1 evita que el navegador use una versión vieja del JSON
        const res = await fetch('datos_visor.json?v=1.1');
        datosOriginales = await res.json();
        
        console.log("Datos cargados correctamente. Total filas: " + datosOriginales.length);
        
        poblarSelectModulo();
        aplicarFiltros();
    } catch (error) {
        console.error("Error crítico al cargar el JSON: ", error);
        alert("No se pudo cargar la base de datos. Revisa el archivo datos_visor.json");
    }
}

// 2. LLENAR EL SELECTOR DE MÓDULOS
function poblarSelectModulo() {
    const selectMod = document.getElementById("filtro-modulo");
    // Extraemos módulos únicos y los ordenamos
    const modulos = [...new Set(datosOriginales.map(p => String(p.Modulo || p.modulo).trim()))].sort((a, b) => a - b);
    
    selectMod.innerHTML = '<option value="todos">📦 Módulo (Todos)</option>';
    modulos.forEach(m => {
        if (m && m !== "undefined") {
            selectMod.innerHTML += `<option value="${m}">Módulo ${m}</option>`;
        }
    });
    
    selectMod.onchange = aplicarFiltros;
}

// 3. FILTRADO Y ORDENAMIENTO (SECUENCIA CRECIENTE)
function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    
    // Filtrar por módulo seleccionado
    let temporal = (modVal === "todos") 
        ? [...datosOriginales] 
        : datosOriginales.filter(p => String(p.Modulo || p.modulo).trim() === modVal);
    
    // ORDENAR POR PASO (De menor a mayor)
    // Usamos parseFloat para que 0.9 sea menor que 1.0 y 21.1
    temporal.sort((a, b) => {
        let pasoA = parseFloat(a.Paso || a.paso || a.PASO) || 0;
        let pasoB = parseFloat(b.Paso || b.paso || b.PASO) || 0;
        return pasoA - pasoB;
    });

    datosFiltrados = temporal;
    posicionActual = 0;
    actualizarInterfaz();
}

// 4. ACTUALIZAR LA PANTALLA (INTERFAZ)
function actualizarInterfaz() {
    if (datosFiltrados.length === 0) {
        console.warn("No hay datos para mostrar con este filtro.");
        return;
    }

    const p = datosFiltrados[posicionActual];
    
    // --- LLENADO DE TEXTOS ---
    // Buscamos el Paso en cualquier variante de nombre (Paso, paso, PASO)
    const numPaso = p.Paso || p.paso || p.PASO || "--";
    document.getElementById("dato-secuencia").innerText = "SECUENCIA DE MONTAJE: PASO " + numPaso;
    
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

    // Foto de la pieza (Nombre exacto de la pieza)
    imgVisor.src = `fotos/${piezaID}.jpg`;

    // Plano de ubicación (Construcción: mod + numero + pieza)
    // Ejemplo: fotos/mod160IC15W.jpg
    const rutaPlano = `fotos/mod${modID}${piezaID}.jpg`;
    imgMapa.src = rutaPlano;

    // Si el plano no existe con ese nombre, intentamos buscarlo solo con el ID de la pieza
    imgMapa.onerror = () => {
        if (!imgMapa.src.includes('placeholder')) {
            console.log("Plano mod... no encontrado. Intentando con nombre de pieza simple.");
            imgMapa.src = `fotos/${piezaID}.jpg`; 
        }
    };

    // Actualizar el contador de posición (1 / 224)
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
}

// 5. FUNCIÓN DEL BOTÓN "VER SECUENCIA"
function togglePaso() {
    const capaPaso = document.getElementById("contenedor-paso");
    
    // Si está oculto o no tiene estilo definido, lo mostramos
    if (capaPaso.style.display === "none" || capaPaso.style.display === "") {
        capaPaso.style.display = "block";
        console.log("Mostrando secuencia de montaje.");
    } else {
        capaPaso.style.display = "none";
        console.log("Ocultando secuencia de montaje.");
    }
}

// 6. NAVEGACIÓN (BOTONES ANTERIOR / SIGUIENTE)
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

// INICIAR LA APP
cargarDatos();
