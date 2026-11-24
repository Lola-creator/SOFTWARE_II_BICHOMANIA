const { ErrorValidacion } = require("../../../compartido/dominio/errores");
const { textoOpcional, validarIdentificador } = require("../../../compartido/dominio/validaciones");

class Pais {
    constructor({ id = null, nombre }) {
        this.id = id;
        this.nombre = textoOpcional(nombre);
        if (!this.nombre) throw new ErrorValidacion("El nombre del país es obligatorio");
    }
}

class Ciudad {
    constructor({ id = null, nombre, idPais }) {
        this.id = id;
        this.nombre = textoOpcional(nombre);
        if (!this.nombre || !idPais) throw new ErrorValidacion("Nombre e id_pais son obligatorios");
        validarIdentificador(idPais, "país");
        this.idPais = idPais;
    }
}

// Dirección de envío de un cliente: todos los campos son obligatorios
class Direccion {
    constructor({ id = null, distrito, calle, referencia, codigoPostal, idCliente, idCiudad }) {
        const campos = [distrito, calle, referencia, codigoPostal, idCliente, idCiudad];
        if (campos.some((valor) => !textoOpcional(valor))) {
            throw new ErrorValidacion("Faltan datos para agregar dirección");
        }
        validarIdentificador(idCliente, "cliente");
        validarIdentificador(idCiudad, "ciudad");
        this.id = id;
        this.distrito = textoOpcional(distrito);
        this.calle = textoOpcional(calle);
        this.referencia = textoOpcional(referencia);
        this.codigoPostal = textoOpcional(codigoPostal);
        this.idCliente = idCliente;
        this.idCiudad = idCiudad;
    }
}

module.exports = { Pais, Ciudad, Direccion };
