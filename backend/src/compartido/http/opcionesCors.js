const ORIGEN_LOCAL = "http://localhost:3000";

// Construye las opciones de CORS a partir de CORS_ORIGINS (lista separada por comas).
// Sin CORS_ORIGINS solo se permite el frontend local.
function crearOpcionesCors(env = process.env) {
    const permitidos = (env.CORS_ORIGINS || ORIGEN_LOCAL)
        .split(",")
        .map((origen) => origen.trim())
        .filter(Boolean);

    return {
        origin(origen, callback) {
            // Sin origen (Postman, pruebas, servidor a servidor) se permite
            if (!origen) return callback(null, true);
            callback(null, permitidos.includes(origen));
        },
    };
}

module.exports = { crearOpcionesCors };
