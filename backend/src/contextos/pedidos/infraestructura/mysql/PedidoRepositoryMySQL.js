const { RepositorioPedidos } = require("../../dominio/puertos");
const Pedido = require("../../dominio/Pedido");
const enTransaccion = require("../../../../compartido/infraestructura/mysql/enTransaccion");
const GestorCarritosMySQL = require("./GestorCarritosMySQL");

const TOTAL_PEDIDO = `
    SELECT COALESCE(SUM(ic.cantidad * p.precio), 0)
    FROM items_carrito ic JOIN productos p ON ic.id_producto = p.id_producto
    WHERE ic.id_carrito = pe.id_carrito`;

class PedidoRepositoryMySQL extends RepositorioPedidos {
    constructor(conexion) {
        super();
        this.conexion = conexion;
    }

    guardar(pedido) {
        return PedidoRepositoryMySQL.#insertarPedido(this.conexion, pedido);
    }

    guardarYCerrarCarrito(pedido, fechaNuevoCarrito) {
        return enTransaccion(this.conexion, async (tx) => {
            const idPedido = await PedidoRepositoryMySQL.#insertarPedido(tx, pedido);
            const idNuevoCarrito = await GestorCarritosMySQL.cerrarYAbrirNuevoEn(tx, pedido.idCarrito, fechaNuevoCarrito);
            return { idPedido, idNuevoCarrito };
        });
    }

    static async #insertarPedido(conexion, pedido) {
        const [r] = await conexion.execute(
            `INSERT INTO pedidos (id_carrito, id_direccion, fecha_pedido, id_estado) VALUES (?, ?, ?, ?)`,
            [pedido.idCarrito, pedido.idDireccion, pedido.fechaPedido, pedido.idEstado]);
        return r.insertId;
    }

    async obtenerPorId(idPedido) {
        const [filas] = await this.conexion.execute(`
            SELECT pe.id_pedido, pe.id_carrito, pe.id_direccion, pe.fecha_pedido, pe.id_estado,
                   c.id_cliente, (${TOTAL_PEDIDO}) AS total
            FROM pedidos pe
            JOIN carritos c ON pe.id_carrito = c.id_carrito
            WHERE pe.id_pedido = ?`, [idPedido]);
        if (!filas.length) return null;
        const [pagos] = await this.conexion.execute(
            "SELECT id_pago, metodo_pago, monto, fecha_pago FROM pagos WHERE id_pedido = ?", [idPedido]);
        const f = filas[0];
        return new Pedido({
            id: f.id_pedido, idCarrito: f.id_carrito, idDireccion: f.id_direccion, idCliente: f.id_cliente,
            fechaPedido: f.fecha_pedido, idEstado: f.id_estado, total: f.total,
            pagos: pagos.map((p) => ({ id: p.id_pago, metodoPago: p.metodo_pago, monto: p.monto, fecha: p.fecha_pago })),
        });
    }

    async guardarPago(pedido, pago) {
        await enTransaccion(this.conexion, async (tx) => {
            await tx.execute(
                "INSERT INTO pagos (metodo_pago, fecha_pago, monto, id_pedido) VALUES (?, ?, ?, ?)",
                [pago.metodoPago, pago.fecha, pago.monto, pedido.id]);
            await tx.execute("UPDATE pedidos SET id_estado = ? WHERE id_pedido = ?", [pedido.idEstado, pedido.id]);
        });
    }

    async eliminar(idPedido) {
        await this.conexion.execute("DELETE FROM pedidos WHERE id_pedido = ?", [idPedido]);
    }

    async calcularTotalCarrito(idCarrito) {
        const [filas] = await this.conexion.execute(`
            SELECT IFNULL(SUM(ic.cantidad * p.precio), 0) AS total
            FROM items_carrito ic
            LEFT JOIN productos p ON ic.id_producto = p.id_producto
            WHERE ic.id_carrito = ?`, [idCarrito]);
        return filas[0]?.total ?? 0;
    }

    async listarResumenPorCliente(idCliente, idEstado) {
        const [filas] = await this.conexion.execute(`
            SELECT pe.id_carrito, pe.id_pedido, pe.fecha_pedido, pe.id_estado,
                   COALESCE(SUM(ic.cantidad * p.precio), 0) AS total,
                   COALESCE((SELECT SUM(monto) FROM pagos WHERE id_pedido = pe.id_pedido), 0) AS pagado,
                   COALESCE(SUM(ic.cantidad * p.precio), 0)
                     - COALESCE((SELECT SUM(monto) FROM pagos WHERE id_pedido = pe.id_pedido), 0) AS deuda
            FROM pedidos pe
            JOIN carritos c ON pe.id_carrito = c.id_carrito
            JOIN items_carrito ic ON c.id_carrito = ic.id_carrito
            JOIN productos p ON ic.id_producto = p.id_producto
            WHERE c.id_cliente = ? AND pe.id_estado = ?
            GROUP BY pe.id_pedido
            ORDER BY pe.fecha_pedido DESC`, [idCliente, idEstado]);
        return filas;
    }

    async listarPagos(idPedido) {
        const [filas] = await this.conexion.execute(`
            SELECT id_pago, metodo_pago, monto, fecha_pago FROM pagos
            WHERE id_pedido = ? ORDER BY fecha_pago ASC`, [idPedido]);
        return filas;
    }

    async obtenerLineasBoleta(idPedido) {
        // Nota: el JOIN de equipos ahora usa equipos_productos (antes comparaba con id_competencia por error)
        const [filas] = await this.conexion.execute(`
            SELECT pe.id_pedido, pe.fecha_pedido,
                   pr.nombre AS producto_nombre, pr.caracteristica, pr.precio, ic.cantidad,
                   c.nombre AS categoria, co.nombre AS competencia,
                   e.nombre AS equipo, e.pais AS pais_equipo,
                   p.metodo_pago, p.fecha_pago, p.monto AS pago_monto
            FROM pedidos pe
            JOIN carritos ca ON pe.id_carrito = ca.id_carrito
            JOIN items_carrito ic ON ca.id_carrito = ic.id_carrito
            JOIN productos pr ON ic.id_producto = pr.id_producto
            LEFT JOIN categoria c ON pr.id_categoria = c.id_categoria
            LEFT JOIN competencias co ON pr.id_competencia = co.id_competencia
            LEFT JOIN equipos_productos ep ON ep.id_producto = pr.id_producto
            LEFT JOIN equipos e ON e.id_equipo = ep.id_equipo
            LEFT JOIN pagos p ON pe.id_pedido = p.id_pedido
            WHERE pe.id_pedido = ?`, [idPedido]);
        return filas;
    }
}

module.exports = PedidoRepositoryMySQL;
