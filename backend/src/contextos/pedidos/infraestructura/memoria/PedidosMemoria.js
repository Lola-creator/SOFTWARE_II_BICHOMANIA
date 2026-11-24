const { RepositorioPedidos, GestorCarritos } = require("../../dominio/puertos");
const Pedido = require("../../dominio/Pedido");
const { ESTADOS_CARRITO } = require("../../../carrito/dominio/EstadosCarrito");
const { redondearMonto } = require("../../../../compartido/dominio/validaciones");
const { mismoId } = require("../../../../compartido/infraestructura/memoria/BaseDatosMemoria");

class PedidoRepositoryMemoria extends RepositorioPedidos {
    constructor(bd) { super(); this.bd = bd; }

    async guardar(p) {
        return this.bd.insertar("pedidos", "id_pedido", {
            id_carrito: Number(p.idCarrito), id_direccion: Number(p.idDireccion),
            fecha_pedido: p.fechaPedido, id_estado: p.idEstado,
        });
    }

    async obtenerPorId(id) {
        const f = this.bd.primero("pedidos", (pe) => mismoId(pe.id_pedido, id));
        if (!f) return null;
        const carrito = this.bd.primero("carritos", (c) => mismoId(c.id_carrito, f.id_carrito)) || {};
        return new Pedido({
            id: f.id_pedido, idCarrito: f.id_carrito, idDireccion: f.id_direccion, idCliente: carrito.id_cliente,
            fechaPedido: f.fecha_pedido, idEstado: f.id_estado, total: await this.calcularTotalCarrito(f.id_carrito),
            pagos: this.#pagos(f.id_pedido).map((p) => ({ id: p.id_pago, metodoPago: p.metodo_pago, monto: p.monto, fecha: p.fecha_pago })),
        });
    }

    async guardarPago(pedido, pago) {
        this.bd.insertar("pagos", "id_pago", {
            metodo_pago: pago.metodoPago, fecha_pago: pago.fecha, monto: pago.monto, id_pedido: Number(pedido.id),
        });
        this.bd.actualizar("pedidos", (pe) => mismoId(pe.id_pedido, pedido.id), { id_estado: pedido.idEstado });
    }

    async eliminar(id) {
        this.bd.eliminar("pedidos", (pe) => mismoId(pe.id_pedido, id));
    }

    async calcularTotalCarrito(idCarrito) {
        return redondearMonto(this.#lineas(idCarrito).reduce((t, l) => t + l.cantidad * Number(l.producto.precio || 0), 0));
    }

    async listarResumenPorCliente(idCliente, idEstado) {
        const resultado = [];
        for (const pe of this.bd.buscar("pedidos", (p) => p.id_estado === idEstado)) {
            const carrito = this.bd.primero("carritos", (c) => mismoId(c.id_carrito, pe.id_carrito));
            if (!carrito || !mismoId(carrito.id_cliente, idCliente)) continue;
            const total = await this.calcularTotalCarrito(pe.id_carrito);
            const pagado = this.#pagos(pe.id_pedido).reduce((s, p) => s + Number(p.monto), 0);
            resultado.push({ ...pe, total, pagado, deuda: redondearMonto(total - pagado) });
        }
        return resultado.sort((a, b) => String(b.fecha_pedido).localeCompare(String(a.fecha_pedido)));
    }

    async listarPagos(idPedido) {
        return this.#pagos(idPedido).map(({ id_pago, metodo_pago, monto, fecha_pago }) => ({ id_pago, metodo_pago, monto, fecha_pago }));
    }

    async obtenerLineasBoleta(idPedido) {
        const pe = this.bd.primero("pedidos", (p) => mismoId(p.id_pedido, idPedido));
        if (!pe) return [];
        const pagos = this.#pagos(pe.id_pedido);
        const nombre = (tabla, col, id) => this.bd.primero(tabla, (f) => mismoId(f[col], id)) || {};
        return this.#lineas(pe.id_carrito).flatMap(({ producto, cantidad }) => {
            const equipo = nombre("equipos", "id_equipo", producto.id_equipo);
            const base = {
                id_pedido: pe.id_pedido, fecha_pedido: pe.fecha_pedido,
                producto_nombre: producto.nombre, caracteristica: producto.caracteristica, precio: producto.precio, cantidad,
                categoria: nombre("categoria", "id_categoria", producto.id_categoria).nombre,
                competencia: nombre("competencias", "id_competencia", producto.id_competencia).nombre,
                equipo: equipo.nombre, pais_equipo: equipo.pais,
            };
            return pagos.length
                ? pagos.map((p) => ({ ...base, metodo_pago: p.metodo_pago, fecha_pago: p.fecha_pago, pago_monto: p.monto }))
                : [{ ...base, metodo_pago: null, fecha_pago: null, pago_monto: null }];
        });
    }

    #pagos(idPedido) {
        return this.bd.buscar("pagos", (p) => mismoId(p.id_pedido, idPedido));
    }

    #lineas(idCarrito) {
        return this.bd.buscar("items_carrito", (i) => mismoId(i.id_carrito, idCarrito)).map((i) => ({
            cantidad: i.cantidad,
            producto: this.bd.primero("productos", (p) => mismoId(p.id_producto, i.id_producto)) || {},
        }));
    }
}

class GestorCarritosMemoria extends GestorCarritos {
    constructor(bd) { super(); this.bd = bd; }

    async cerrarYAbrirNuevo(idCarrito, fecha) {
        const carrito = this.bd.primero("carritos", (c) => mismoId(c.id_carrito, idCarrito));
        if (!carrito) return null;
        carrito.id_estado = ESTADOS_CARRITO.CERRADO;
        return this.bd.insertar("carritos", "id_carrito", {
            fecha_creacion: fecha, id_cliente: carrito.id_cliente, id_estado: ESTADOS_CARRITO.ACTIVO,
        });
    }
}

module.exports = { PedidoRepositoryMemoria, GestorCarritosMemoria };
