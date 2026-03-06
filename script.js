let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

async function cargarDatos() {
    try {
        const res = await fetch('datos_visor.json');
        const rawData = await res.json();
        
        datosOriginales = rawData.map(item => {
            let nuevoItem = {};
            for (let key in item) { 
                let claveLimpia = key.trim();
                let valor = item[key];
                // Limpiamos errores de Excel #N/A que aparecen en tu captura
                if (valor === "#N/A" || valor === "#VALUE!" || valor === null) valor = "---";
                nuevoItem[claveLimpia] = valor; 
            }
            return nuevoItem;
        });

        poblarSelectModulo();
        actualizarSelectPiezas(); 
        actualizarInterfaz();
    } catch (e) { console.error("Error cargando JSON", e); }
}

function poblarSelectModulo() {
    const selectMod = document.getElementById("filtro-modulo");
    const modulos = [...new Set(datosOriginales.map(p => String(p["Modulo"] || "").trim()))]
                    .filter(m => m !== "" && m !== "---").sort((a,b) => a - b);
    selectMod.innerHTML = '<option value="todos">📦 Módulo (Todos)</option>';
    modulos.forEach(m => { selectMod.innerHTML += `<option value="${m}">Módulo ${m}</option>`; });
    selectMod.onchange = () => { actualizarSelectPiezas(); aplicarFiltros(); };
}

function actualizarSelectPiezas() {
    const modSeleccionado = document.getElementById("filtro-modulo").value;
    const selectPieza = document.getElementById("filtro-pieza");
    selectPieza.innerHTML = '<option value="todos">🔍 Seleccionar Pieza</option>';
    
    const piezasModulo = (modSeleccionado === "todos") 
        ? datosOriginales 
        : datosOriginales.filter(p => String(p["Modulo"] || "").trim() === modSeleccionado);
    
    piezasModulo.forEach(p => { 
        let cod = String(p["Pieza individual"] || "").trim();
        let perno = String(p["perno"] || "").trim();
        if(cod && cod !== "---") {
            // Esto separa las dos entradas de la 60TS01W que tienes en tu JSON
            selectPieza.innerHTML += `<option value="${cod}|${perno}">${cod} (${perno})</option>`; 
        }
    });
    selectPieza.onchange = aplicarFiltros;
}

function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    const piezaCombo = document.getElementById("filtro-pieza").value;
    datosFiltrados = datosOriginales.filter(p => (modVal === "todos" || String(p["Modulo"] || "").trim() === modVal));
    if (piezaCombo !== "todos") {
        const [piezaVal, pernoVal] = piezaCombo.split('|');
        const index = datosFiltrados.findIndex(p => 
            String(p["Pieza individual"] || "").trim() === piezaVal && 
            String(p["perno"] || "").trim() === pernoVal
        );
        posicionActual = (index !== -1) ? index : 0;
    } else {
        posicionActual = 0;
    }
    actualizarInterfaz();
}

function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];
    const id = String(p["Pieza individual"] || "").trim();
    const mod = String(p["Modulo"] || "").trim();

    // Actualizar Textos y ocultar #N/A
    document.getElementById("pieza-titulo").innerText = "PIEZA: " + id;
    document.getElementById("dato-perno").innerText = p["perno"] || "---";
    document.getElementById("dato-acero-tuerca").innerText = p["stdtuerca"] || "---";
    document.getElementById("dato-torque").innerText = (p["Par apriete (N.m) (Torque)"] || "0") + " N.m";
    document.getElementById("cant-pernos").innerText = p["Cantidad Pernos por pieza"] || "0";
    document.getElementById("cant-tuercas").innerText = p["Cantidad Tuercas por pieza"] || "0";
    document.getElementById("cant-golillas").innerText = p["Cantidad Golillas por pieza"] || "0";
    document.getElementById("dato-largo").innerText = p["Largo (mm)"] || "---";
    document.getElementById("dato-ancho").innerText = p["Ancho (mm)"] || "---";
    document.getElementById("dato-alto").innerText = p["Alto (mm)"] || "---";

    const imgMapa = document.getElementById("img-mapa");
    const imgVisor = document.getElementById("img-visor");
    let prefijo = (mod === "11") ? "mod11" : "mod01";
    
    // RASTREADOR DE FOTOS: Prueba todas las combinaciones posibles para evitar el error 404
    const intentarCargar = (elemento, nombreBase) => {
        const extensiones = ['.jpg', '.JPG', '.jpeg', '.JPEG'];
        const variantes = [nombreBase, nombreBase.toLowerCase(), nombreBase.toUpperCase()];
        let rutas = [];
        variantes.forEach(v => { extensiones.forEach(ext => rutas.push(`fotos/${v}${ext}`)); });

        let i = 0;
        const probar = () => {
            if (i < rutas.length) {
                elemento.src = rutas[i];
                i++;
            } else {
                elemento.src = "https://via.placeholder.com/400x300?text=Foto+no+encontrada";
                elemento.onerror = null;
            }
        };
        elemento.onerror = probar;
        probar();
    };

    intentarCargar(imgMapa, prefijo + id);
    intentarCargar(imgVisor, id);

    document.querySelectorAll(".etiqueta-mod").forEach(el => el.innerText = "MOD: " + mod);
    document.querySelectorAll(".etiqueta-nombre").forEach(el => el.innerText = id);
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
}

document.getElementById("btn-siguiente").onclick = () => { if(posicionActual < datosFiltrados.length-1) { posicionActual++; actualizarInterfaz(); } };
document.getElementById("btn-atras").onclick = () => { if(posicionActual > 0) { posicionActual--; actualizarInterfaz(); } };

cargarDatos();
