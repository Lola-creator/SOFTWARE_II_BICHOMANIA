const Pago = require("./Pago");
const { ESTADOS_PEDIDO } = require("./EstadosPedido");
const { ErrorValidacion, ErrorNoAutorizado } = require("../../../compartido/dominio/errores");
const { validarIdentificador, redondearMonto } = require("../../../compartido/dominio/validaciones");

/**
 * Agregado raíz: Pedido generado a partir de un carrito.
 * Su total es la suma de los productos del carrito; la deuda baja con cada pago
 * y el pedido pasa a PAGADO cuando la deuda llega a 0.
 */
class Pedido {
    #pagos = [];

    constructor({
        id = null, idCarrito, idDireccion = null, idCliente = null, fechaPedido,
        idEstado = ESTADOS_PEDIDO.PENDIENTE_DE_PAGO, total = 0, pagos = [],
    }) {
        validarIdentificador(idCarrito, "carrito");
        this.id = id;
        this.idCarrito = idCarrito;
        this.idDireccion = idDireccion;
        this.idCliente = idCliente;
        this.fechaPedido = fechaPedido;
        this.idEstado = Number(idEstado);
        this.total = redondearMonto(Number(total) || 0);
        pagos.forEach((pago) => this.#pagos.push(pago instanceof Pago ? pago : new Pago(pago)));
    }

    // Fábrica: todo pedido nuevo nace pendiente de pago
    static crear({ idCarrito, idDireccion, fechaPedido }) {
        if (!idCarrito || !idDireccion) throw new ErrorValidacion("Faltan datos del pedido");
        validarIdentificador(idDireccion, "dirección");
        return new Pedido({ idCarrito, idDireccion, fechaPedido, idEstado: ESTADOS_PEDIDO.PENDIENTE_DE_PAGO });
    }

    get pagos() {
        return [...this.#pagos];
    }

    get pagado() {
        return redondearMonto(this.#pagos.reduce((suma, pago) => suma + pago.monto, 0));
    }

    get deuda() {
        return redondearMonto(this.total - this.pagado);
    }

    estaPagado() {
        return this.idEstado === ESTADOS_PEDIDO.PAGADO;
    }

    // Regla: no se puede pagar más de lo que se debe
    registrarPago({ metodoPago, monto, fecha }) {
        const pago = new Pago({ metodoPago, monto, fecha });
        if (pago.monto > this.deuda) {
            throw new ErrorValidacion("No puedes pagar más de la deuda");
        }
        this.#pagos.push(pago);
        if (this.deuda <= 0) this.idEstado = ESTADOS_PEDIDO.PAGADO;
        return pago;
    }

    // Al anular un pedido se devuelve al cliente todo lo que ya pagó
    montoADevolverAlAnular() {
        return this.pagado;
    }

    verificarPropietario(idCliente) {
        const sinCliente = idCliente === undefined || idCliente === null || idCliente === "";
        if (sinCliente || String(idCliente) !== String(this.idCliente)) {
            throw new ErrorNoAutorizado("No puedes anular un pedido de otro cliente");
        }
    }
}

module.exports = Pedido;
