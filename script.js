// ==========================================
// VARIABLES GLOBALES DE LA APLICACIÓN
// ==========================================
let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

// 1. CARGA INICIAL: Lee el JSON y prepara la App
async function cargarDatos() {
    try {
        // Usamos ?v=1.2 para que el navegador no guarde versiones viejas en caché
        const res = await fetch('datos_visor.json?v=1.2');
        datosOriginales = await res.json();
        
        console.log("Base de datos cargada. Filas detectadas: " + datosOriginales.length);
        
        poblarSelectModulo();
        aplicarFiltros();
    } catch (error) {
        console.error("Error al cargar el archivo JSON: ", error);
        alert("Atención: No se pudo cargar el archivo datos_visor.json");
    }
}

// 2. SELECTOR DE MÓDULOS: Crea las opciones según el JSON
function poblarSelectModulo() {
    const selectMod = document.getElementById("filtro-modulo");
    // Extraemos los números de módulo, quitamos espacios y ordenamos de menor a mayor
    const modulos = [...new Set(datosOriginales.map(p => String(p.Modulo || p.modulo).trim()))].sort((a, b) => a - b);
    
    selectMod.innerHTML = '<option value="todos">📦 Módulo (Todos)</option>';
    modulos.forEach(m => {
        if (m && m !== "undefined") {
            selectMod.innerHTML += `<option value="${m}">Módulo ${m}</option>`;
        }
    });
    
    selectMod.onchange = aplicarFiltros;
}

// 3. FILTRADO Y ORDENAMIENTO: Organiza por la columna "Paso"
function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    
    // Filtramos los datos por el módulo seleccionado
    let temporal = (modVal === "todos") 
        ? [...datosOriginales] 
        : datosOriginales.filter(p => String(p.Modulo || p.modulo).trim() === modVal);
    
    // ORDEN CRECIENTE: Comparamos los pasos numéricamente (0.9 < 1.0 < 21.0)
    temporal.sort((a, b) => {
        let pasoA = parseFloat(a.Paso || a.paso || a.PASO) || 0;
        let pasoB = parseFloat(b.Paso || b.paso || b.PASO) || 0;
        return pasoA - pasoB;
    });

    datosFiltrados = temporal;
    posicionActual = 0;
    actualizarInterfaz();
}

// 4. ACTUALIZAR INTERFAZ: Dibuja los datos y fotos en pantalla
function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;

    const p = datosFiltrados[posicionActual];
    
    // --- DATOS DE TEXTO ---
    const numPaso = p.Paso || p.paso || p.PASO || "--";
    document.getElementById("id-secuencia").innerText = "SECUENCIA DE MONTAJE: PASO " + numPaso;
    
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

    // --- LÓGICA DE IMÁGENES (ESTRICTA) ---
    const piezaID = String(p["Pieza individual"]).trim();
    const modID = String(p.Modulo || p.modulo).trim();
    
    const imgMapa = document.getElementById("img-mapa");
    const imgVisor = document.getElementById("img-visor");

    // Foto Principal: Siempre busca el nombre de la pieza
    imgVisor.src = `fotos/${piezaID}.jpg`;

    // Plano de Ubicación: Busca el prefijo "mod" seguido del número y la pieza
    // Ejemplo: fotos/mod160IC15W.jpg
    const rutaPlano = `fotos/mod${modID}${piezaID}.jpg`;
    imgMapa.src = rutaPlano;

    // Si el PLANO no existe, mostramos error en lugar de repetir la foto de la pieza
    imgMapa.onerror = () => {
        console.warn("Falta archivo de plano para: " + piezaID);
        imgMapa.src = "https://via.placeholder.com/400x300?text=Plano+No+Encontrado";
    };
    
    // Si la FOTO no existe, mostramos aviso
    imgVisor.onerror = () => {
        imgVisor.src = "https://via.placeholder.com/400x300?text=Foto+No+Disponible";
    };

    // Actualizamos el contador inferior
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
}

// 5. FUNCIÓN DEL BOTÓN "VER SECUENCIA" (Muestra/Oculta la cinta amarilla)
function togglePaso() {
    const capaPaso = document.getElementById("contenedor-paso");
    
    if (capaPaso.style.display === "none" || capaPaso.style.display === "") {
        capaPaso.style.display = "block";
    } else {
        capaPaso.style.display = "none";
    }
}

// 6. NAVEGACIÓN ENTRE PIEZAS
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

// EJECUCIÓN AL CARGAR LA PÁGINA
cargarDatos();
