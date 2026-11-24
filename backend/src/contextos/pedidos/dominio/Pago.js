const { textoObligatorio, montoPositivo } = require("../../../compartido/dominio/validaciones");

// Objeto de valor: un pago (parcial o total) hecho sobre un pedido
class Pago {
    constructor({ id = null, metodoPago, monto, fecha }) {
        this.id = id;
        this.metodoPago = textoObligatorio(metodoPago, "Faltan datos");
        this.monto = montoPositivo(monto, "El monto debe ser mayor que 0");
        this.fecha = fecha;
        Object.freeze(this);
    }
}

module.exports = Pago;
