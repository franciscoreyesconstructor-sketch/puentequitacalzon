// ==========================================
// CONFIGURACIÓN GLOBAL
// ==========================================
let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

// 1. FUNCIÓN DE CARGA (Con protección de caché y errores)
async function cargarDatos() {
    try {
        console.log("Intentando cargar datos_visor.json...");
        
        // El "?v=" + Date.now() fuerza al navegador a leer el archivo real, no el guardado
        const respuesta = await fetch('datos_visor.json?v=' + Date.now());
        
        if (!respuesta.ok) {
            throw new Error("No se encontró el archivo datos_visor.json. Revisa el nombre en GitHub.");
        }

        datosOriginales = await respuesta.json();
        console.log("Carga exitosa. Total de piezas: " + datosOriginales.length);
        
        poblarSelectModulo();
        aplicarFiltros();

    } catch (error) {
        console.error("Error detallado:", error);
        
        // Mensaje de auxilio visible en el celular si falla la carga
        const aviso = document.createElement("div");
        aviso.style = "position:fixed; top:0; background:red; color:white; padding:20px; z-index:9999; width:100%;";
        aviso.innerHTML = `<b>⚠️ ERROR DE CARGA:</b> ${error.message}<br><small>Revisa comas de más o el nombre del archivo.</small>`;
        document.body.appendChild(aviso);
    }
}

// 2. POBLAR SELECTOR DE MÓDULOS
function poblarSelectModulo() {
    const selectMod = document.getElementById("filtro-modulo");
    // Extraemos módulos únicos, limpiamos espacios y ordenamos
    const modulos = [...new Set(datosOriginales.map(p => String(p.Modulo || p.modulo).trim()))].sort((a, b) => a - b);
    
    selectMod.innerHTML = '<option value="todos">📦 Módulo (Todos)</option>';
    modulos.forEach(m => {
        if (m && m !== "undefined") {
            selectMod.innerHTML += `<option value="${m}">Módulo ${m}</option>`;
        }
    });
    
    selectMod.onchange = aplicarFiltros;
}

// 3. FILTRADO Y ORDENAMIENTO CRECIENTE
function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    
    // Filtrar
    let temporal = (modVal === "todos") 
        ? [...datosOriginales] 
        : datosOriginales.filter(p => String(p.Modulo || p.modulo).trim() === modVal);
    
    // Ordenar por "Paso" numéricamente (Ej: 0.9 antes que 1.0)
    temporal.sort((a, b) => {
        let pasoA = parseFloat(a.Paso || a.paso || a.PASO) || 0;
        let pasoB = parseFloat(b.Paso || b.paso || b.PASO) || 0;
        return pasoA - pasoB;
    });

    datosFiltrados = temporal;
    posicionActual = 0;
    actualizarInterfaz();
}

// 4. ACTUALIZAR PANTALLA
function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;

    const p = datosFiltrados[posicionActual];
    
    // Texto de Secuencia (El que se muestra/oculta con el botón)
    const numPaso = p.Paso || p.paso || p.PASO || "--";
    document.getElementById("dato-secuencia").innerText = "SECUENCIA DE MONTAJE: PASO " + numPaso;
    
    // Datos técnicos
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

    // Manejo de Imágenes
    const piezaID = String(p["Pieza individual"]).trim();
    const modID = String(p.Modulo || p.modulo).trim();
    
    const imgMapa = document.getElementById("img-mapa");
    const imgVisor = document.getElementById("img-visor");

    // Foto de la pieza
    imgVisor.src = `fotos/${piezaID}.jpg`;

    // Plano de ubicación (Prefijo mod + modulo + pieza)
    const rutaPlano = `fotos/mod${modID}${piezaID}.jpg`;
    imgMapa.src = rutaPlano;

    // Si el PLANO falla, ponemos aviso (No repetimos la foto de la pieza)
    imgMapa.onerror = () => {
        imgMapa.src = "https://via.placeholder.com/400x300?text=Plano+No+Encontrado";
    };
    
    imgVisor.onerror = () => {
        imgVisor.src = "https://via.placeholder.com/400x300?text=Foto+No+Encontrada";
    };

    // Contador
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
}

// 5. FUNCIÓN DEL BOTÓN "VER SECUENCIA"
function togglePaso() {
    const contenedor = document.getElementById("contenedor-paso");
    // Intercambia entre ocultar y mostrar
    if (contenedor.style.display === "none" || contenedor.style.display === "") {
        contenedor.style.display = "block";
    } else {
        contenedor.style.display = "none";
    }
}

// 6. NAVEGACIÓN
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

// Arrancar
cargarDatos();
