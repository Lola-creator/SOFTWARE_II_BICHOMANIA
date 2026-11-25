const express = require("express");
const multer = require("multer");
const path = require("node:path");
const { responderCasoDeUso } = require("../../../compartido/http/responderCasoDeUso");
const { ErrorValidacion } = require("../../../compartido/dominio/errores");

const crearSubidaImagenes = (directorio) => multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, directorio),
        filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            req.archivoInvalido = true;
            return cb(null, false);
        }
        cb(null, true);
    },
});

// Traduce el formulario (snake_case) al lenguaje del dominio (camelCase)
const datosProducto = (body) => ({
    nombre: body.nombre,
    caracteristica: body.caracteristica,
    precio: body.precio,
    idCategoria: body.id_categoria,
    idCompetencia: body.id_competencia,
    idMarca: body.id_marca,
    idEquipo: body.id_equipo,
});

const rutaSubida = (req) => (req.file ? `/uploads/${req.file.filename}` : null);

const exigirImagenValida = (req) => {
    if (req.archivoInvalido) throw new ErrorValidacion("El archivo debe ser una imagen");
};

const crearRutasCatalogo = ({ productoService, clasificacionService, directorioImagenes }) => {
    const rutas = express.Router();
    const subida = crearSubidaImagenes(directorioImagenes);

    // --- Productos ---
    rutas.post("/productos/agregar", subida.single("imagen"), responderCasoDeUso((req) => {
        exigirImagenValida(req);
        return productoService.agregar({ ...datosProducto(req.body), imagen: rutaSubida(req) });
    }));
    rutas.put("/productos/editar/:id", subida.single("imagen"), responderCasoDeUso((req) => {
        exigirImagenValida(req);
        return productoService.editar(req.params.id, datosProducto(req.body), rutaSubida(req));
    }));
    rutas.delete("/productos/eliminar/:id", responderCasoDeUso((req) => productoService.eliminar(req.params.id)));
    rutas.get("/productos", responderCasoDeUso((req) => productoService.listar(req.query)));
    rutas.get("/producto/:id", responderCasoDeUso((req) => productoService.obtenerDetalle(req.params.id)));

    // --- Clasificaciones (categorías, marcas, equipos, competencias) ---
    rutas.get("/listas", responderCasoDeUso(() => clasificacionService.listarTodas(), { respuesta: "json" }));
    for (const tipo of ["categorias", "marcas", "equipos", "competencias"]) {
        rutas.get(`/${tipo}`, responderCasoDeUso(() => clasificacionService.listar(tipo), { respuesta: "json" }));
        rutas.post(`/${tipo}`, responderCasoDeUso((req) => clasificacionService.agregar(tipo, req.body), { respuesta: "json" }));
        rutas.delete(`/${tipo}/:id`, responderCasoDeUso((req) => clasificacionService.eliminar(tipo, req.params.id), { respuesta: "json" }));
    }

    return rutas;
};

module.exports = crearRutasCatalogo;
