let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

async function cargarDatos() {
    try {
        const res = await fetch('datos_visor.json');
        const rawData = await res.json();
        datosOriginales = rawData.map(item => {
            let nuevoItem = {};
            for (let key in item) { nuevoItem[key.trim()] = item[key]; }
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
                    .filter(m => m !== "" && m !== "undefined").sort((a,b) => a - b);
    selectMod.innerHTML = '<option value="todos">📦 Módulo (Todos)</option>';
    modulos.forEach(m => { selectMod.innerHTML += `<option value="${m}">Módulo ${m}</option>`; });
    selectMod.onchange = () => { actualizarSelectPiezas(); aplicarFiltros(); };
}

function actualizarSelectPiezas() {
    const modSeleccionado = document.getElementById("filtro-modulo").value;
    const selectPieza = document.getElementById("filtro-pieza");
    selectPieza.innerHTML = '<option value="todos">🔍 Seleccionar Pieza</option>';
    const piezasModulo = (modSeleccionado === "todos") ? datosOriginales : datosOriginales.filter(p => String(p["Modulo"] || "").trim() === modSeleccionado);
    
    piezasModulo.forEach(p => { 
        let cod = String(p["Pieza individual"] || "").trim();
        let perno = String(p["perno"] || "").trim();
        if(cod) {
            // Guardamos la combinación Pieza|Perno
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
    const idOriginal = String(p["Pieza individual"] || "").trim();
    const idLimpio = idOriginal.toLowerCase(); // Para búsqueda más flexible
    const mod = String(p["Modulo"] || "").trim();

    document.getElementById("pieza-titulo").innerText = "PIEZA: " + idOriginal;
    document.getElementById("dato-perno").innerText = p["perno"] || "---";
    document.getElementById("dato-torque").innerText = (p["Par apriete (N.m) (Torque)"] || "0") + " N.m";
    
    const imgMapa = document.getElementById("img-mapa");
    const imgVisor = document.getElementById("img-visor");

    let prefijo = (mod === "11") ? "mod11" : "mod01";
    
    // Función de carga con reintentos para mayúsculas/minúsculas
    const cargarImagen = (elemento, nombre) => {
        const intentos = [
            `fotos/${nombre}.jpg`,
            `fotos/${nombre}.JPG`,
            `fotos/${nombre.toLowerCase()}.jpg`,
            `fotos/${nombre.toUpperCase()}.JPG`
        ];
        let actual = 0;
        
        const probarSiguiente = () => {
            if (actual < intentos.length) {
                elemento.src = intentos[actual];
                actual++;
            } else {
                elemento.src = "https://via.placeholder.com/400x300?text=Foto+No+Encontrada";
                elemento.onerror = null;
            }
        };
        
        elemento.onerror = probarSiguiente;
        probarSiguiente();
    };

    cargarImagen(imgMapa, prefijo + idOriginal);
    cargarImagen(imgVisor, idOriginal);

    document.querySelectorAll(".etiqueta-mod").forEach(el => el.innerText = "MOD: " + mod);
    document.querySelectorAll(".etiqueta-nombre").forEach(el => el.innerText = idOriginal);
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
}

document.getElementById("btn-siguiente").onclick = () => { if(posicionActual < datosFiltrados.length-1) { posicionActual++; actualizarInterfaz(); } };
document.getElementById("btn-atras").onclick = () => { if(posicionActual > 0) { posicionActual--; actualizarInterfaz(); } };

cargarDatos();
