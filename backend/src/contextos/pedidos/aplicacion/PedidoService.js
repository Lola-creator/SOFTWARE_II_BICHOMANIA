const Pedido = require("../dominio/Pedido");
const Boleta = require("../dominio/Boleta");
const { ESTADOS_PEDIDO } = require("../dominio/EstadosPedido");
const { ErrorValidacion, ErrorNoEncontrado } = require("../../../compartido/dominio/errores");
const { validarIdentificador } = require("../../../compartido/dominio/validaciones");
const ejecutar = require("../../../compartido/aplicacion/ejecutarPersistencia");

const { fechaLocalISO: hoyISO } = require("../../../compartido/dominio/fechas");

class PedidoService {
    constructor({ repositorioPedidos, gestorCarritos, monederoClientes, obtenerFechaActual = () => new Date() }) {
        this.pedidos = repositorioPedidos;
        this.carritos = gestorCarritos;
        this.monedero = monederoClientes;
        this.obtenerFechaActual = obtenerFechaActual;
    }

    // Convierte el carrito activo en un pedido pendiente de pago y abre un carrito nuevo
    async crearDesdeCarrito({ id_carrito, id_direccion, fecha_pedido } = {}) {
        const hoy = this.obtenerFechaActual();
        const pedido = Pedido.crear({
            idCarrito: id_carrito,
            idDireccion: id_direccion,
            fechaPedido: fecha_pedido || hoyISO(hoy),
        });
        const idPedido = await ejecutar(() => this.pedidos.guardar(pedido), "No se pudo crear el pedido");
        const idNuevoCarrito = await ejecutar(
            () => this.carritos.cerrarYAbrirNuevo(pedido.idCarrito, hoyISO(hoy)),
            "No se pudo crear el pedido",
        );
        return { ok: true, id_pedido: idPedido, nuevo_carrito: idNuevoCarrito };
    }

    async deudaDeCarrito(idCarrito) {
        if (!idCarrito) throw new ErrorValidacion("Falta id_carrito");
        const total = await ejecutar(() => this.pedidos.calcularTotalCarrito(idCarrito), "Error al calcular deuda");
        return { deuda: total };
    }

    async deudaDePedido(idPedido) {
        const pedido = await this.#obtener(idPedido, "Error obteniendo deuda");
        return { deuda: pedido.deuda };
    }

    async registrarPago({ id_pedido, metodo_pago, monto } = {}) {
        if (!id_pedido || !monto || !metodo_pago) throw new ErrorValidacion("Faltan datos");
        const pedido = await this.#obtener(id_pedido, "Error al registrar pago");
        const pago = pedido.registrarPago({ metodoPago: metodo_pago, monto, fecha: hoyISO(this.obtenerFechaActual()) });
        await ejecutar(() => this.pedidos.guardarPago(pedido, pago), "Error al registrar pago");
        return { ok: true, deudaRestante: pedido.deuda };
    }

    listarDeudas(idCliente) {
        return this.#listarResumen(idCliente, ESTADOS_PEDIDO.PENDIENTE_DE_PAGO);
    }

    listarCompras(idCliente) {
        return this.#listarResumen(idCliente, ESTADOS_PEDIDO.PAGADO);
    }

    listarPagos(idPedido) {
        return ejecutar(() => this.pedidos.listarPagos(idPedido), "Error listando pagos");
    }

    // Elimina el pedido y devuelve al saldo del cliente lo que ya había pagado
    async anular(idPedido) {
        const pedido = await this.#obtener(idPedido, "Error eliminando pedido");
        const devolver = pedido.montoADevolverAlAnular();
        await ejecutar(() => this.pedidos.eliminar(pedido.id), "Error eliminando pedido");
        if (devolver > 0) {
            await ejecutar(() => this.monedero.abonar(pedido.idCliente, devolver), "Error eliminando pedido");
        }
        return { ok: true, mensaje: "Pedido eliminado correctamente", devuelto_al_saldo: devolver };
    }

    async obtenerBoleta(idPedido) {
        validarIdentificador(idPedido, "pedido");
        const lineas = await ejecutar(() => this.pedidos.obtenerLineasBoleta(idPedido), "Error generando boleta");
        if (!lineas.length) throw new ErrorNoEncontrado("Pedido no encontrado");
        return Boleta.desdeLineas(idPedido, lineas, this.obtenerFechaActual());
    }

    async #listarResumen(idCliente, idEstado) {
        try {
            return (await this.pedidos.listarResumenPorCliente(idCliente, idEstado)) || [];
        } catch (error) {
            console.error("ERROR listando pedidos:", error);
            return []; // la pantalla muestra lista vacía en vez de fallar (comportamiento original)
        }
    }

    async #obtener(idPedido, mensajeError) {
        validarIdentificador(idPedido, "pedido");
        const pedido = await ejecutar(() => this.pedidos.obtenerPorId(idPedido), mensajeError);
        if (!pedido) throw new ErrorNoEncontrado("Pedido no encontrado");
        return pedido;
    }
}

module.exports = PedidoService;
