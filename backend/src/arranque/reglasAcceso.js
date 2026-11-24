const CLASIFICACIONES = ["categorias", "marcas", "equipos", "competencias"];

const RUTAS_PUBLICAS = [
    "GET /",
    "POST /registrar",
    "POST /login/user",
    "POST /login/employee",
    "GET /productos",
    "GET /producto/:id",
    "GET /listas",
    ...CLASIFICACIONES.map((tipo) => `GET /${tipo}`),
    "GET /paises",
    "GET /ciudades",
    "GET /resenas/:id_producto",
    "GET /encuestas-activas",
    "GET /detalles-encuesta/:id",
    "GET /encuesta_ganadora/:id_encuesta",
];

const RUTAS_SOLO_EMPLEADOS = [
    "POST /productos/agregar",
    "PUT /productos/editar/:id",
    "DELETE /productos/eliminar/:id",
    ...CLASIFICACIONES.flatMap((tipo) => [`POST /${tipo}`, `DELETE /${tipo}/:id`]),
    "POST /crear_encuesta",
    "DELETE /eliminar_encuesta/:id",
    "PUT /cerrar_encuesta/:id",
    "GET /encuestas",
    "GET /clientes",
    "POST /paises",
    "PUT /paises/:id",
    "POST /ciudades",
    "PUT /ciudades/:id",
];

module.exports = { RUTAS_PUBLICAS, RUTAS_SOLO_EMPLEADOS };
