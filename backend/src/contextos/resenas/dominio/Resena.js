const { ErrorValidacion, ErrorNoAutorizado } = require("../../../compartido/dominio/errores");
const { validarIdentificador, textoOpcional } = require("../../../compartido/dominio/validaciones");
const { fechaLocalISO } = require("../../../compartido/dominio/fechas");

const validarPuntuacion = (puntuacion) => {
    const valor = Number(puntuacion);
    if (!Number.isInteger(valor) || valor < 1 || valor > 5) {
        throw new ErrorValidacion("La puntuación debe ser un número entero entre 1 y 5");
    }
    return valor;
};

// Agregado raíz: reseña que un cliente deja sobre un producto.
// `calificacion` es el comentario escrito; `puntuacion`, las estrellas (1-5).
class Resena {
    constructor({ id = null, calificacion, puntuacion, fecha, idCliente, idProducto }) {
        validarIdentificador(idCliente, "cliente");
        validarIdentificador(idProducto, "producto");
        this.id = id;
        this.calificacion = textoOpcional(calificacion);
        this.puntuacion = validarPuntuacion(puntuacion);
        this.fecha = fecha;
        this.idCliente = idCliente;
        this.idProducto = idProducto;
    }

    static escribir({ calificacion, puntuacion, idCliente, idProducto, hoy = new Date() }) {
        return new Resena({ calificacion, puntuacion, idCliente, idProducto, fecha: fechaLocalISO(hoy) });
    }

    // Regla: solo el autor puede editar o eliminar su reseña
    verificarAutor(idCliente, accion) {
        if (String(this.idCliente) !== String(idCliente)) {
            throw new ErrorNoAutorizado(`No puedes ${accion} una reseña que no es tuya`);
        }
    }

    editar(idCliente, { calificacion, puntuacion }) {
        this.verificarAutor(idCliente, "editar");
        this.calificacion = textoOpcional(calificacion);
        this.puntuacion = validarPuntuacion(puntuacion);
    }
}

module.exports = Resena;
