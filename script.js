let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

async function cargarDatos() {
    try {
        const res = await fetch('datos_visor.json');
        datosOriginales = await res.json();
        console.log("Datos cargados:", datosOriginales[0]); // Para revisar en consola
        poblarSelectModulo();
        aplicarFiltros();
    } catch (e) {
        console.error("Error cargando JSON:", e);
    }
}

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

function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    
    let temporal = (modVal === "todos") 
        ? [...datosOriginales] 
        : datosOriginales.filter(p => String(p.Modulo || p.modulo).trim() === modVal);
    
    // ORDENAR POR PASO (CRECIENTE)
    temporal.sort((a, b) => {
        let pasoA = parseFloat(a.Paso || a.paso || a.PASO) || 0;
        let pasoB = parseFloat(b.Paso || b.paso || b.PASO) || 0;
        return pasoA - pasoB;
    });

    datosFiltrados = temporal;
    posicionActual = 0;
    actualizarInterfaz();
}

function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];
    
    // 1. EXTRAER EL PASO (Buscamos en varias combinaciones por si el JSON varía)
    const valorPaso = p.Paso || p.paso || p.PASO || "--";
    document.getElementById("dato-secuencia").innerText = "SECUENCIA DE MONTAJE: PASO " + valorPaso;

    // 2. TEXTOS TÉCNICOS
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

    // 3. LÓGICA DE IMÁGENES (PLANO Y FOTO)
    const piezaID = String(p["Pieza individual"]).trim();
    const modID = String(p.Modulo || p.modulo).trim();
    
    const imgMapa = document.getElementById("img-mapa");
    const imgVisor = document.getElementById("img-visor");

    // Intentamos cargar la foto de la pieza
    imgVisor.src = `fotos/${piezaID}.jpg`;

    // Intentamos cargar el plano (Formato: mod + número + pieza)
    // Ejemplo: mod160IC15W.jpg
    const rutaPlano = `fotos/mod${modID}${piezaID}.jpg`;
    imgMapa.src = rutaPlano;

    // Si el plano falla, intentamos una ruta alternativa (solo la pieza con prefijo plano_)
    imgMapa.onerror = () => {
        if (!imgMapa.src.includes('placeholder')) {
            imgMapa.src = `fotos/plano_${piezaID}.jpg`;
        }
    };

    // Actualizar contador
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
}

// Botones de Navegación
document.getElementById("btn-siguiente").onclick = () => { if(posicionActual < datosFiltrados.length - 1) { posicionActual++; actualizarInterfaz(); } };
document.getElementById("btn-atras").onclick = () => { if(posicionActual > 0) { posicionActual--; actualizarInterfaz(); } };

cargarDatos();
