function cargarDatos() {
    try {
        // Verificar si la variable global existe
        if (typeof datosTecnicos === 'undefined') {
            throw new Error("Variable 'datosTecnicos' no encontrada");
        }
        
        // Verificar que sea un array
        if (!Array.isArray(datosTecnicos)) {
            throw new Error("'datosTecnicos' no es un array válido");
        }
        
        // Verificar que tenga datos
        if (datosTecnicos.length === 0) {
            throw new Error("El array de datos técnicos está vacío");
        }
        
        datosOriginales = datosTecnicos;
        console.log("✅ Sistema cargado: " + datosOriginales.length + " registros");
        
        poblarSelectModulo();
        aplicarFiltros();
        inicializarZoomsMiniaturas();
        
    } catch (error) {
        console.error("❌ ERROR:", error.message);
        
        // Mostrar error amigable en la pantalla
        document.body.innerHTML = `
            <div style="
                background: #b30000;
                color: white;
                padding: 30px;
                margin: 20px;
                border-radius: 15px;
                text-align: center;
                font-family: sans-serif;
            ">
                <h2 style="margin-bottom: 15px;">⚠️ Error de Carga</h2>
                <p style="margin-bottom: 10px;">${error.message}</p>
                <p style="font-size: 14px; opacity: 0.9;">
                    Verifique que el archivo <strong>datos_visor.js</strong> 
                    esté en la misma carpeta que index.html
                </p>
                <button onclick="location.reload()" style="
                    margin-top: 20px;
                    padding: 12px 30px;
                    background: #ffcc00;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    font-size: 16px;
                ">REINTENTAR</button>
            </div>
        `;
        
        // También mostrar alerta para depuración
        alert("ERROR: Los datos técnicos no están disponibles.\n\n" + 
              "Causa: " + error.message + "\n\n" +
              "Asegúrese de que datos_visor.js esté en la carpeta raíz.");
    }
}
