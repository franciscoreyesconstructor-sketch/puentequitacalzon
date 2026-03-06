let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

// Cargar el archivo JSON
async function cargarDatos() {
    try {
        const respuesta = await fetch('datos_visor.json');
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
    const modulos = [...new Set(datosOriginales.map(p => String(p.Modulo).trim()))].sort();
    
    selectMod.innerHTML = '<option value="todos">📦 Módulo (Todos)</option>';
    modulos.forEach(m => {
        if(m) selectMod.innerHTML += `<option value="${m}">Módulo ${m}</option>`;
    });
    
    selectMod.onchange = aplicarFiltros;
}

// Filtrar datos
function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    
    datosFiltrados = (modVal === "todos") 
        ? [...datosOriginales] 
        : datosOriginales.filter(p => String(p.Modulo).trim() === modVal);
    
    posicionActual = 0;
    actualizarInterfaz();
}

// Mostrar los datos en pantalla
function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];

    // Textos
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

    // Imágenes
    const piezaID = String(p["Pieza individual"]).trim();
    const modID = String(p.Modulo).trim();

    // El plano busca con prefijo mod01, mod02...
    document.getElementById("img-mapa").src = `fotos/mod0${modID}${piezaID}.jpg`;
    document.getElementById("img-visor").src = `fotos/${piezaID}.jpg`;

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

// Iniciar carga
cargarDatos();
