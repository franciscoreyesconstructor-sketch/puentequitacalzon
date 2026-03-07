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

    // --- MAPEO EXACTO DE TUS COLUMNAS ---
    // Usamos el nombre exacto que tienes en el JSON: "Tipo Perno"
    const valorPerno = p["Tipo Perno"] || p.perno || p.Perno || "--";
    
    // Ajustamos también el Torque por si acaso
    const valorTorque = p["Par apriete (N.m) (Torque)"] || p.Torque || p.torque || "0";

    // 1. Título de la Pieza
    document.getElementById("pieza-titulo").innerText = "PIEZA: " + (p["Pieza individual"] || "--");

    // 2. Insertar los datos en el HTML
    document.getElementById("dato-perno").innerText = valorPerno;
    document.getElementById("dato-torque").innerText = valorTorque;
    
    // 3. Estándar / Acero (Ajusta este nombre si tampoco se ve)
    document.getElementById("dato-acero-tuerca").innerText = p.stdtuerca || p["Acero Tuerca"] || "--";
    
    // 4. Cantidades (Nombres largos del Excel)
    document.getElementById("cant-pernos").innerText = p["Cantidad Pernos por pieza"] || 0;
    document.getElementById("cant-tuercas").innerText = p["Cantidad Tuercas por pieza"] || 0;
    document.getElementById("cant-golillas").innerText = p["Cantidad Golillas por pieza"] || 0;
    
    // 5. Medidas
    document.getElementById("dato-largo").innerText = p["Largo (mm)"] || 0;
    document.getElementById("dato-ancho").innerText = p["Ancho (mm)"] || 0;
    document.getElementById("dato-alto").innerText = p["Alto (mm)"] || 0;

    // --- IMÁGENES (Lógica V5 estable) ---
    const idPieza = String(p["Pieza individual"] || "").trim();
    const idMod = String(p.Modulo || p.modulo || "").trim();

    if (idPieza) {
        document.getElementById("img-mapa").src = `fotos/mod0${idMod}${idPieza}.jpg`;
        document.getElementById("img-visor").src = `fotos/${idPieza}.jpg`;
    }

    // 6. Contador
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


