let datosOriginales = [];
let datosFiltrados = [];
let posicionActual = 0;

async function cargarDatos() {
    try {
        const res = await fetch('datos_visor.json');
        const rawData = await res.json();
        // Limpieza profunda de los nombres de columnas y datos
        datosOriginales = rawData.map(item => {
            let nuevoItem = {};
            for (let key in item) { 
                let claveLimpia = key.trim();
                nuevoItem[claveLimpia] = item[key]; 
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
                    .filter(m => m !== "" && m !== "undefined").sort((a,b) => a - b);
    selectMod.innerHTML = '<option value="todos">📦 Módulo (Todos)</option>';
    modulos.forEach(m => { selectMod.innerHTML += `<option value="${m}">Módulo ${m}</option>`; });
    selectMod.onchange = () => { actualizarSelectPiezas(); aplicarFiltros(); };
}

function actualizarSelectPiezas() {
    const modSeleccionado = document.getElementById("filtro-modulo").value;
    const selectPieza = document.getElementById("filtro-pieza");
    selectPieza.innerHTML = '<option value="todos">🔍 Seleccionar Pieza</option>';
    const piezas = (modSeleccionado === "todos") ? datosOriginales : datosOriginales.filter(p => String(p["Modulo"] || "").trim() === modSeleccionado);
    piezas.forEach(p => { 
        let cod = String(p["Pieza individual"] || "").trim();
        if(cod) selectPieza.innerHTML += `<option value="${cod}">${cod}</option>`; 
    });
    selectPieza.onchange = aplicarFiltros;
}

function aplicarFiltros() {
    const modVal = document.getElementById("filtro-modulo").value;
    const piezaVal = document.getElementById("filtro-pieza").value;
    datosFiltrados = datosOriginales.filter(p => (modVal === "todos" || String(p["Modulo"] || "").trim() === modVal));
    posicionActual = (piezaVal !== "todos") ? datosFiltrados.findIndex(p => String(p["Pieza individual"] || "").trim() === piezaVal) : 0;
    if (posicionActual === -1) posicionActual = 0;
    actualizarInterfaz();
}

function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];
    // Limpiamos el ID de cualquier espacio o caracter invisible
    const id = String(p["Pieza individual"] || "").trim();
    const mod = String(p["Modulo"] || "").trim();

    document.getElementById("pieza-titulo").innerText = "PIEZA: " + id;
    document.getElementById("dato-perno").innerText = p["perno"] || "---";
    document.getElementById("dato-torque").innerText = (p["Par apriete (N.m) (Torque)"] || "0") + " N.m";

    const imgMapa = document.getElementById("img-mapa");
    const imgVisor = document.getElementById("img-visor");

    // Lógica de prefijo para planos
    let prefijo = (mod === "11") ? "mod11" : "mod01";
    
    // 1. Intentamos cargar normal (.jpg minúscula)
    imgMapa.src = `fotos/${prefijo}${id}.jpg`;
    imgVisor.src = `fotos/${id}.jpg`;

    // 2. Si falla el mapa, probamos con .JPG (mayúscula)
    imgMapa.onerror = function() {
        if (this.src.endsWith(".jpg")) {
            this.src = this.src.replace(".jpg", ".JPG");
        } else if (this.src.endsWith(".JPG")) {
            // Si también falla, probamos con prefijo en mayúsculas MOD11...
            let prefijoMayus = prefijo.toUpperCase();
            this.src = `fotos/${prefijoMayus}${id}.JPG`;
        }
    };

    // 3. Si falla la foto, probamos con .JPG (mayúscula)
    imgVisor.onerror = function() {
        if (this.src.endsWith(".jpg")) {
            this.src = this.src.replace(".jpg", ".JPG");
        }
    };

    document.querySelectorAll(".etiqueta-mod").forEach(el => el.innerText = "MOD: " + mod);
    document.querySelectorAll(".etiqueta-nombre").forEach(el => el.innerText = id);
    document.getElementById("indicador-indice").innerText = `${posicionActual + 1} / ${datosFiltrados.length}`;
}

document.getElementById("btn-siguiente").onclick = () => { if(posicionActual < datosFiltrados.length-1) { posicionActual++; actualizarInterfaz(); } };
document.getElementById("btn-atras").onclick = () => { if(posicionActual > 0) { posicionActual--; actualizarInterfaz(); } };

cargarDatos();