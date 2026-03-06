let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

async function cargarDatos() {
    try {
        const res = await fetch('datos_visor.json');
        datosOriginales = await res.json();
        
        poblarSelectModulo();
        aplicarFiltros();
    } catch (e) {
        console.error("Error cargando JSON:", e);
    }
}

function poblarSelectModulo() {
    const selectMod = document.getElementById("filtro-modulo");
    const modulos = [...new Set(datosOriginales.map(p => String(p.Modulo).trim()))].sort((a,b) => a - b);
    selectMod.innerHTML = '<option value="todos">📦 Módulo (Todos)</option>';
    modulos.forEach(m => {
        if(m !== "" && m !== "undefined") {
            selectMod.innerHTML += `<option value="${m}">Módulo ${m}</option>`;
        }
    });
    selectMod.onchange = aplicarFiltros;
}

function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    
    // Filtramos y ordenamos automáticamente por el número de PASO
    datosFiltrados = (modVal === "todos") 
        ? [...datosOriginales] 
        : datosOriginales.filter(p => String(p.Modulo).trim() === modVal);
    
    // Ordenar por paso (numérico)
    datosFiltrados.sort((a, b) => parseFloat(a.Paso) - parseFloat(b.Paso));
    
    posicionActual = 0;
    actualizarInterfaz();
}

function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];
    const piezaID = String(p["Pieza individual"]).trim();
    const moduloID = String(p["Modulo"]).trim();

    // Llenado de textos
    document.getElementById("dato-secuencia").innerText = "PASO DE MONTAJE: " + (p.Paso || "--");
    document.getElementById("pieza-titulo").innerText = "PIEZA: " + piezaID;
    document.getElementById("dato-perno").innerText = p.perno || "VER PLANO";
    document.getElementById("dato-acero-tuerca").innerText = p.stdtuerca || "--";
    document.getElementById("dato-torque").innerText = p["Par apriete (N.m) (Torque)"] || "0";
    document.getElementById("cant-pernos").innerText = p["Cantidad Pernos por pieza"] || "0";
    document.getElementById("cant-tuercas").innerText = p["Cantidad Tuercas por pieza"] || "0";
    document.getElementById("cant-golillas").innerText = p["Cantidad Golillas por pieza"] || "0";
    document.getElementById("dato-largo").innerText = p["Largo (mm)"] || "0";
    document.getElementById("dato-ancho").innerText = p["Ancho (mm)"] || "0";
    document.getElementById("dato-alto").innerText = p["Alto (mm)"] || "0";

    // Manejo de Imágenes (Buscador Inteligente)
    const imgMapa = document.getElementById("img-mapa");
    const imgVisor = document.getElementById("img-visor");
    
    // Prefijo para planos: mod01, mod02...
    const prefijoPlano = "mod0" + moduloID;
    
    imgMapa.src = `fotos/${prefijoPlano}${piezaID}.jpg`;
    imgVisor.src = `fotos/${piezaID}.jpg`;

    // Si la imagen falla, ponemos un aviso
    imgMapa.onerror = () => { imgMapa.src = "https://via.placeholder.com/400x300?text=Plano+No+Encontrado"; };
    imgVisor.onerror = () => { imgVisor.src = "https://via.placeholder.com/400x300?text=Foto+No+Encontrada"; };

    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
}

// Botones
document.getElementById("btn-siguiente").onclick = () => { if(posicionActual < datosFiltrados.length-1) { posicionActual++; actualizarInterfaz(); } };
document.getElementById("btn-atras").onclick = () => { if(posicionActual > 0) { posicionActual--; actualizarInterfaz(); } };

cargarDatos();