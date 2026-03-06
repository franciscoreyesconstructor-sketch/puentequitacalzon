// --- LÓGICA DE IMÁGENES (FOTO Y PLANO) ---
    const piezaID = String(p["Pieza individual"]).trim();
    const modID = String(p.Modulo || p.modulo).trim();
    
    const imgMapa = document.getElementById("img-mapa");
    const imgVisor = document.getElementById("img-visor");

    // 1. Foto de la pieza (Muestra la pieza sola)
    imgVisor.src = `fotos/${piezaID}.jpg`;

    // 2. Plano de ubicación (Debe ser un archivo distinto)
    // Intentamos cargar: fotos/mod160IC15W.jpg (por ejemplo)
    const rutaPlano = `fotos/mod${modID}${piezaID}.jpg`;
    imgMapa.src = rutaPlano;

    // Si el plano NO existe, mostramos un aviso visual en lugar de repetir la foto
    imgMapa.onerror = () => {
        console.warn("No se encontró el plano específico: " + rutaPlano);
        imgMapa.src = "https://via.placeholder.com/400x300?text=Plano+No+Disponible";
    };
