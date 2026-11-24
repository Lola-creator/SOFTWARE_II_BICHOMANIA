const { ErrorValidacion, ErrorNoEncontrado, ErrorCredenciales, ErrorNoAutorizado } = require("../dominio/errores");
const ErrorPersistencia = require("../aplicacion/ErrorPersistencia");

const codigoHttpDeError = (error) => {
    if (error instanceof ErrorValidacion) return 400;
    if (error instanceof ErrorCredenciales) return 401;
    if (error instanceof ErrorNoAutorizado) return 403;
    if (error instanceof ErrorNoEncontrado) return 404;
    return 500;
};

const mensajeDeError = (error, codigoHttp) =>
    error instanceof ErrorPersistencia || codigoHttp !== 500
        ? error.message
        : "Error interno del servidor";

// Formatos de error que el frontend ya espera según el endpoint
const FORMATOS_ERROR = {
    texto: (mensaje) => mensaje,
    json: (mensaje) => ({ error: mensaje }),
    jsonMessage: (mensaje) => ({ message: mensaje }),
};

/**
 * Adaptador HTTP → caso de uso.
 * El controlador solo traduce la petición, llama a la capa de aplicación y
 * traduce el resultado/errores a HTTP.
 */
const responderCasoDeUso = (casoDeUso, { formatoError = "texto", respuesta = "send" } = {}) =>
    async (req, res) => {
        try {
            const resultado = await casoDeUso(req, res);
            if (res.headersSent) return;
            if (respuesta === "json") res.json(resultado);
            else res.send(resultado);
        } catch (error) {
            const codigoHttp = codigoHttpDeError(error);
            if (codigoHttp === 500) console.error(error.causa || error);
            if (res.headersSent) return res.end();
            const cuerpo = FORMATOS_ERROR[formatoError](mensajeDeError(error, codigoHttp));
            res.status(codigoHttp).send(cuerpo);
        }
    };

module.exports = { responderCasoDeUso, codigoHttpDeError };
