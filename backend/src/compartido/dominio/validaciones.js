const { ErrorValidacion } = require("./errores");

const PATRON_IDENTIFICADOR_TEXTO = /^[1-9]\d*$/;

const esIdentificadorValido = (valor) => {
    if (typeof valor === "number") {
        return Number.isInteger(valor) && valor > 0;
    }
    if (typeof valor === "string") {
        return PATRON_IDENTIFICADOR_TEXTO.test(valor);
    }
    return false;
};

const validarIdentificador = (valor, entidad) => {
    if (!esIdentificadorValido(valor)) {
        throw new ErrorValidacion(`El identificador de ${entidad} no es válido`);
    }
};

const validarCantidadPositiva = (cantidad) => {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
        throw new ErrorValidacion("La cantidad debe ser un número entero mayor que cero");
    }
};

const validarCantidadNoNegativa = (cantidad) => {
    if (cantidad < 0) {
        throw new ErrorValidacion("La cantidad no puede ser negativa");
    }
    if (!Number.isInteger(cantidad)) {
        throw new ErrorValidacion("La cantidad debe ser un número entero");
    }
};

const redondearMonto = (monto) => Math.round(monto * 100) / 100;

module.exports = {
    validarIdentificador,
    validarCantidadPositiva,
    validarCantidadNoNegativa,
    redondearMonto
};

// Utilidades adicionales compartidas por varios contextos
const textoObligatorio = (valor, mensaje) => {
    if (valor === undefined || valor === null || String(valor).trim() === "") {
        throw new ErrorValidacion(mensaje);
    }
    return String(valor).trim();
};

const textoOpcional = (valor) =>
    valor === undefined || valor === null || String(valor).trim() === ""
        ? null
        : String(valor).trim();

const montoPositivo = (valor, mensaje = "El monto debe ser mayor que 0") => {
    const numero = Number(valor);
    if (valor === null || valor === undefined || valor === "" || !Number.isFinite(numero) || numero <= 0) {
        throw new ErrorValidacion(mensaje);
    }
    return redondearMonto(numero);
};

module.exports.textoObligatorio = textoObligatorio;
module.exports.textoOpcional = textoOpcional;
module.exports.montoPositivo = montoPositivo;
