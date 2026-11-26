const { GestorCarritos } = require("../../dominio/puertos");
const { ESTADOS_CARRITO } = require("../../../carrito/dominio/EstadosCarrito");
const enTransaccion = require("../../../../compartido/infraestructura/mysql/enTransaccion");

// Adaptador hacia el contexto Carrito: cierra el carrito usado y crea uno nuevo para el mismo cliente
class GestorCarritosMySQL extends GestorCarritos {
    constructor(conexion) {
        super();
        this.conexion = conexion;
    }

    cerrarYAbrirNuevo(idCarrito, fecha) {
        return enTransaccion(this.conexion, (tx) => GestorCarritosMySQL.cerrarYAbrirNuevoEn(tx, idCarrito, fecha));
    }

    static async cerrarYAbrirNuevoEn(tx, idCarrito, fecha) {
        await tx.execute("UPDATE carritos SET id_estado = ? WHERE id_carrito = ?", [ESTADOS_CARRITO.CERRADO, idCarrito]);
        const [r] = await tx.execute(`
            INSERT INTO carritos (fecha_creacion, id_cliente, id_estado)
            SELECT ?, id_cliente, ? FROM carritos WHERE id_carrito = ?`,
            [fecha, ESTADOS_CARRITO.ACTIVO, idCarrito]);
        return r.insertId;
    }
}

module.exports = GestorCarritosMySQL;
