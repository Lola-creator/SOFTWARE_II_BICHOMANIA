const RepositorioCarrito = require("../../dominio/RepositorioCarrito");
const Carrito = require("../../dominio/Carrito");
const ItemCarrito = require("../../dominio/ItemCarrito");
const { ESTADOS_CARRITO } = require("../../dominio/EstadosCarrito");
const { mismoId } = require("../../../../compartido/infraestructura/memoria/BaseDatosMemoria");

class CarritoRepositoryMemoria extends RepositorioCarrito {
    constructor(bd) { super(); this.bd = bd; }

    async buscarActivoPorCliente(idCliente) {
        const f = this.bd.primero("carritos", (c) => mismoId(c.id_cliente, idCliente) && c.id_estado === ESTADOS_CARRITO.ACTIVO);
        return f ? new Carrito({ id: f.id_carrito, idCliente }) : null;
    }

    async crear(carrito) {
        const id = this.bd.insertar("carritos", "id_carrito", {
            fecha_creacion: carrito.fechaCreacion.toISOString().slice(0, 10),
            id_cliente: Number(carrito.idCliente),
            id_estado: ESTADOS_CARRITO.ACTIVO,
        });
        return new Carrito({ id, idCliente: carrito.idCliente, fechaCreacion: carrito.fechaCreacion });
    }

    async listarProductos(idCarrito) {
        return this.#items(idCarrito).map((i) => {
            const p = this.bd.primero("productos", (prod) => mismoId(prod.id_producto, i.id_producto)) || {};
            return new ItemCarrito({ idProducto: i.id_producto, cantidad: i.cantidad, nombre: p.nombre, precio: p.precio });
        });
    }

    async buscarItem(idCarrito, idProducto) {
        const i = this.#items(idCarrito).find((it) => mismoId(it.id_producto, idProducto));
        return i ? new ItemCarrito({ idProducto, cantidad: i.cantidad }) : null;
    }

    async agregarItem(idCarrito, item) {
        this.bd.tabla("items_carrito").push({ id_carrito: Number(idCarrito), id_producto: Number(item.idProducto), cantidad: item.cantidad });
    }

    async actualizarCantidadItem(idCarrito, item) {
        return this.bd.actualizar("items_carrito",
            (i) => mismoId(i.id_carrito, idCarrito) && mismoId(i.id_producto, item.idProducto),
            { cantidad: item.cantidad });
    }

    async eliminarItem(idCarrito, idProducto) {
        return this.bd.eliminar("items_carrito", (i) => mismoId(i.id_carrito, idCarrito) && mismoId(i.id_producto, idProducto));
    }

    async vaciar(idCarrito) {
        this.bd.eliminar("items_carrito", (i) => mismoId(i.id_carrito, idCarrito));
    }

    async calcularTotalPorCliente(idCliente) {
        const carrito = await this.buscarActivoPorCliente(idCliente);
        if (!carrito) return null;
        const items = await this.listarProductos(carrito.id);
        return items.length ? items.reduce((t, i) => t + i.cantidad * Number(i.precio), 0) : null;
    }

    #items(idCarrito) {
        return this.bd.buscar("items_carrito", (i) => mismoId(i.id_carrito, idCarrito));
    }
}

module.exports = CarritoRepositoryMemoria;
