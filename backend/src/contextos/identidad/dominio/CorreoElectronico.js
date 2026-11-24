const { ErrorValidacion } = require("../../../compartido/dominio/errores");

const LONGITUD_MAXIMA = 254; // RFC 5321
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Objeto de valor: un correo siempre normalizado (minúsculas, sin espacios) y con formato válido
class CorreoElectronico {
    constructor(valor) {
        const normalizado = String(valor ?? "").trim().toLowerCase();
        if (normalizado.length > LONGITUD_MAXIMA || !PATRON_CORREO.test(normalizado)) {
            throw new ErrorValidacion("El correo electrónico no es válido");
        }
        this.valor = normalizado;
        Object.freeze(this);
    }

    // Rehidratación desde la BD: no se vuelve a validar (datos antiguos podrían no cumplir el formato)
    static desdePersistencia(valor) {
        const correo = Object.create(CorreoElectronico.prototype);
        correo.valor = String(valor ?? "").trim().toLowerCase();
        return Object.freeze(correo);
    }

    equals(otro) {
        return otro instanceof CorreoElectronico && otro.valor === this.valor;
    }

    toString() {
        return this.valor;
    }
}

module.exports = CorreoElectronico;
