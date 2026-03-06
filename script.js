let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

// 1. CARGA DE DATOS
async function cargarDatos() {
    try {
        const respuesta = await fetch('datos_visor.json');
        datosOriginales = await respuesta.json();
        
        poblarSelectModulo();
        aplicarFiltros();
    } catch (error) {
        console.error("Error al cargar el JSON:", error);
    }
}

// 2. POBLAR EL SELECTOR
function poblarSelectModulo() {
    const selectMod = document.getElementById("filtro-modulo");
    // Obtenemos módulos únicos y los ordenamos alfabéticamente
    const modulos = [...new Set(datosOriginales.map(p => String(p.Modulo).trim()))].sort();
    
    selectMod.innerHTML = '<option value="todos">📦 Módulo (Todos)</option>';
    modulos.forEach(m => {
        if(m) {
            selectMod.innerHTML += `<option value="${m}">Módulo ${m}</option>`;
        }
    });
    
    selectMod.onchange = aplicarFiltros;
}

// 3. FILTRAR LOS DATOS
function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    
    datosFiltrados = (modVal === "todos") 
        ? [...datosOriginales] 
        : datosOriginales.filter(p => String(p.Modulo).trim() === modVal);
    
    posicionActual = 0;
    actualizarInterfaz();
}

// 4. ACTUALIZAR LA PANTALLA
function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];

    // --- LOGICA DE BUSQUEDA FLEXIBLE PARA DATOS ---
    // Esto evita errores si en el Excel la columna se llama "Perno" o "perno"
    const valorPerno = p.Perno || p.perno || p.PERNO || "--";
    const valorTorque = p["Par apriete (N.m) (Torque)"] || p.Torque || p.torque || "0";
    const valorEstandar = p.stdtuerca || p.Estandar || p.estandar || "--";

    // Actualizar Textos en el HTML
    document.getElementById("pieza-titulo").innerText = "PIEZA: " + (p["Pieza individual"] || p.pieza || "--");
    document.getElementById("dato-perno").innerText = valorPerno;
    document.getElementById("dato-acero-tuerca").innerText = valorEstandar;
    document.getElementById("dato-torque").innerText = valorTorque;
    
    // Cantidades
    document.getElementById("cant-pernos").innerText = p["Cantidad Pernos por pieza"] || p.cant_pernos || "0";
    document.getElementById("cant-tuercas").innerText = p["Cantidad Tuercas por pieza"] || p.cant_tuercas || "0";
    document.getElementById("cant-golillas").innerText = p["Cantidad Golillas por pieza"] || p.cant_golillas || "0";
    
    // Medidas
    document.getElementById("dato-largo").innerText = p["Largo (mm)"] || p.largo || "0";
    document.getElementById("dato-ancho").innerText = p["Ancho (mm)"] || p.ancho || "0";
    document.getElementById("dato-alto").innerText = p["Alto (mm)"] || p.alto || "0";

    // Actualizar Imágenes
    const idPieza = String(p["Pieza individual"] || p.pieza || "").trim();
    const idMod = String(p.Modulo || p.modulo || "").trim();

    if (idPieza) {
        document.getElementById("img-mapa").src = `fotos/mod0${idMod}${idPieza}.jpg`;
        document.getElementById("img-visor").src = `fotos/${idPieza}.jpg`;
    }

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

// Iniciar aplicación
cargarDatos();

