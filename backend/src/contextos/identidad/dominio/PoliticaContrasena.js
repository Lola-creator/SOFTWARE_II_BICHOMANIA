const { ErrorValidacion } = require("../../../compartido/dominio/errores");

// Regla de negocio: entre 8 y 12 caracteres y al menos una mayúscula
const PATRON = /^(?=.*[A-Z]).{8,12}$/;

const validarContrasenaNueva = (contrasena) => {
    if (typeof contrasena !== "string" || !PATRON.test(contrasena)) {
        throw new ErrorValidacion(
            "La contraseña debe tener entre 8 y 12 caracteres y al menos una mayúscula",
        );
    }
};

module.exports = { validarContrasenaNueva };
