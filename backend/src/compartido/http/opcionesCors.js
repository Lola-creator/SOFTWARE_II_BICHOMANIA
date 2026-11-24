const ORIGEN_LOCAL = "http://localhost:3000";

function crearOpcionesCors(env = process.env) {
    const permitidos = (env.CORS_ORIGINS || ORIGEN_LOCAL)
        .split(",")
        .map((origen) => origen.trim())
        .filter(Boolean);

    return {
        origin(origen, callback) {
          
            if (!origen) return callback(null, true);
            callback(null, permitidos.includes(origen));
        },
    };
}

module.exports = { crearOpcionesCors };
