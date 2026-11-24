const crypto = require("crypto");
const { ErrorValidacion } = require("../../../../compartido/dominio/errores");

// Solo estos tipos de imagen son válidos; la extensión sale de aquí, nunca del nombre original.
const EXTENSIONES_PERMITIDAS = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
};

function esImagenPermitida(mimetype) {
    return Object.prototype.hasOwnProperty.call(EXTENSIONES_PERMITIDAS, mimetype);
}

function generarNombreImagen(mimetype, generarId = () => crypto.randomUUID()) {
    if (!esImagenPermitida(mimetype)) {
        throw new ErrorValidacion("Tipo de imagen no permitido");
    }
    return `${generarId()}.${EXTENSIONES_PERMITIDAS[mimetype]}`;
}

module.exports = { generarNombreImagen, esImagenPermitida };
