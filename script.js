function actualizarInterfaz() {
    if (datosFiltrados.length === 0) return;
    const p = datosFiltrados[posicionActual];
    
    // ... (resto de los textos se mantienen igual) ...

    // --- CORRECCIÓN DE IMÁGENES ---
    const piezaID = String(p["Pieza individual"]).trim();
    const modID = String(p["Modulo"]).trim();
    
    // 1. Foto de la pieza (Normal)
    const imgVisor = document.getElementById("img-visor");
    imgVisor.src = `fotos/${piezaID}.jpg`;

    // 2. Plano de ubicación (Construcción flexible)
    const imgMapa = document.getElementById("img-mapa");
    
    // Intentamos el formato que mencionaste: prefijo "mod" + modulo + pieza
    // Si modulo es 1, esto genera "mod160IC15W.jpg"
    // Si prefieres que siempre lleve un cero (mod01), usa: "mod0" + modID
    const nombrePlano = `mod${modID}${piezaID}.jpg`;
    
    console.log("Buscando plano en: fotos/" + nombrePlano); // Esto te dirá el error en la consola
    imgMapa.src = `fotos/${nombrePlano}`;

    // Si el plano falla, intentamos buscarlo solo por el ID de pieza (por si no tiene el prefijo mod)
    imgMapa.onerror = () => {
        if (imgMapa.src.includes('mod')) {
            console.warn("Plano con prefijo 'mod' no encontrado, reintentando solo con ID.");
            imgMapa.src = `fotos/plano_${piezaID}.jpg`; // Otra variante común
        } else {
            imgMapa.src = "https://via.placeholder.com/400x300?text=Plano+No+Encontrado";
        }
    };

    // ... (resto del código) ...
}
