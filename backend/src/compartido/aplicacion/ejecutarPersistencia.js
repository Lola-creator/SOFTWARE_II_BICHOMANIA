const ErrorPersistencia = require("./ErrorPersistencia");
const { ErrorDominio } = require("../dominio/errores");

// Envuelve una llamada a un puerto de persistencia: los errores técnicos
// se traducen a ErrorPersistencia con un mensaje legible; los de dominio pasan tal cual.
const ejecutarPersistencia = async (operacion, mensajeError) => {
    try {
        return await operacion();
    } catch (error) {
        if (error instanceof ErrorDominio || error instanceof ErrorPersistencia) throw error;
        throw new ErrorPersistencia(mensajeError, error);
    }
};

module.exports = ejecutarPersistencia;
