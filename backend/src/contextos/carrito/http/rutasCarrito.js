const express = require("express");
const { responderCasoDeUso } = require("../../../compartido/http/responderCasoDeUso");

const crearRutasCarrito = ({ carritoService }) => {
    const rutas = express.Router();

    rutas.get("/carrito", responderCasoDeUso((req) => carritoService.obtenerCarrito(req.query.id_cliente)));
    rutas.post("/carrito/agregar", responderCasoDeUso((req) => {
        const { id_cliente, id_producto, cantidad } = req.body;
        return carritoService.agregarProducto(id_cliente, id_producto, cantidad);
    }));
    rutas.put("/carrito/actualizar", responderCasoDeUso((req) => {
        const { id_cliente, id_producto, cantidad } = req.body;
        return carritoService.actualizarCantidad(id_cliente, id_producto, cantidad);
    }));
    rutas.delete("/carrito/eliminar-item", responderCasoDeUso((req) => {
        const { id_cliente, id_producto } = req.body;
        return carritoService.eliminarProducto(id_cliente, id_producto);
    }));
    rutas.delete("/carrito/vaciar", responderCasoDeUso((req) => carritoService.vaciar(req.body.id_cliente)));
    rutas.get("/carrito/total", responderCasoDeUso((req) => carritoService.calcularTotal(req.query.id_cliente)));

    return rutas;
};

module.exports = crearRutasCarrito;
