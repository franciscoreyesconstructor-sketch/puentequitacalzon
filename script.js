let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

// CARGAR DATOS
async function cargarDatos() {
    try {
        const res = await fetch('datos_visor.json');
        datosOriginales = await res.json();
        poblarSelectModulo();
        aplicarFiltros();
    } catch (e) { console.error(e); }
}

function poblarSelectModulo() {
    const selectMod = document.getElementById("filtro-modulo");
    const modulos = [...new Set(datosOriginales.map(p => String(p.Modulo).trim()))].sort();
    modulos.forEach(m => {
        if(m) selectMod.innerHTML += `<option value="${m}">Módulo ${m}</option>`;
    });
    selectMod.onchange = aplicarFiltros;
}

function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    datosFiltrados = (modVal === "todos") ? [...datosOriginales] : datosOriginales.filter(p => String(p.Modulo).trim() === modVal);
    
    // ORDENAR POR PASO (Para que la secuencia sea lógica)
    datosFiltrados.sort((a, b) => (parseFloat(a.Paso) || 0) - (parseFloat(b.Paso) || 0));
    
    posicionActual = 0;
    actualizarInterfaz();
}

function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];

    // Actualizar Textos e Imágenes (Lógica V5.9)
    document.getElementById("pieza-titulo").innerText = "PIEZA: " + p["Pieza individual"];
    document.getElementById("img-mapa").src = `fotos/mod0${p.Modulo}${p["Pieza individual"]}.jpg`;
    document.getElementById("img-visor").src = `fotos/${p["Pieza individual"]}.jpg`;
    
    // Guardar el paso para la pantalla gigante
    document.getElementById("valor-paso-grande").innerText = "PASO " + (p.Paso || "--");

    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
}

// FUNCIONES DE LA "SEGUNDA PANTALLA"
function abrirSecuencia() {
    document.getElementById("pantalla-paso").style.display = "block";
}

function cerrarSecuencia() {
    document.getElementById("pantalla-paso").style.display = "none";
}

// BOTONES NAVEGACIÓN
document.getElementById("btn-siguiente").onclick = () => { if(posicionActual < datosFiltrados.length - 1){ posicionActual++; actualizarInterfaz(); } };
document.getElementById("btn-atras").onclick = () => { if(posicionActual > 0){ posicionActual--; actualizarInterfaz(); } };

cargarDatos();
