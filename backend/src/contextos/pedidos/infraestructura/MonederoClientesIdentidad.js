const { MonederoClientes } = require("../dominio/puertos");

// Adaptador hacia el contexto Identidad: usa su servicio de aplicación, no sus tablas
class MonederoClientesIdentidad extends MonederoClientes {
    constructor(identidadService) {
        super();
        this.identidadService = identidadService;
    }

    abonar(idCliente, monto) {
        return this.identidadService.abonarSaldo(idCliente, monto);
    }
}

module.exports = MonederoClientesIdentidad;
