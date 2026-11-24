const { redondearMonto } = require("../../../compartido/dominio/validaciones");

/**
 * Objeto de valor con el contenido de la boleta de un pedido.
 * Se arma a partir de líneas "planas" (producto × pago) y elimina duplicados.
 */
class Boleta {
    constructor({ idPedido, fechaPedido, fechaEmision, productos, pagos }) {
        this.idPedido = idPedido;
        this.fechaPedido = fechaPedido;
        this.fechaEmision = fechaEmision;
        this.productos = productos;
        this.pagos = pagos;
        this.total = redondearMonto(productos.reduce((suma, p) => suma + Number(p.precio) * p.cantidad, 0));
        Object.freeze(this);
    }

    static desdeLineas(idPedido, lineas, fechaEmision = new Date()) {
        const unicos = (filas, clave) => {
            const vistos = new Set();
            return filas.filter((fila) => {
                const k = clave(fila);
                if (vistos.has(k)) return false;
                vistos.add(k);
                return true;
            });
        };

        const productos = unicos(lineas, (l) => `${l.producto_nombre}-${l.cantidad}`).map((l) => ({
            nombre: l.producto_nombre,
            caracteristica: l.caracteristica,
            precio: l.precio,
            cantidad: l.cantidad,
            categoria: l.categoria,
            competencia: l.competencia,
            equipo: l.equipo,
            paisEquipo: l.pais_equipo,
        }));

        const pagos = unicos(lineas.filter((l) => l.metodo_pago), (l) => `${l.metodo_pago}-${l.fecha_pago}-${l.pago_monto}`)
            .map((l) => ({ metodo: l.metodo_pago, fecha: l.fecha_pago, monto: l.pago_monto }));

        return new Boleta({ idPedido, fechaPedido: lineas[0]?.fecha_pedido, fechaEmision, productos, pagos });
    }
}

module.exports = Boleta;
