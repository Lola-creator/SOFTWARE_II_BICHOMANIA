const { rateLimit } = require("express-rate-limit");

const UN_MINUTO = 60 * 1000;
const MENSAJE_LIMITE = "Demasiados intentos de inicio de sesión. Intenta de nuevo en un minuto";

const limitarIntentos = ({ maximo = 5, ventanaMs = UN_MINUTO, mensaje = MENSAJE_LIMITE } = {}) =>
    rateLimit({
        windowMs: ventanaMs,
        limit: maximo,
        message: mensaje,
        standardHeaders: "draft-8",
        legacyHeaders: false,
    });

module.exports = limitarIntentos;
