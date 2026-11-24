const express = require("express");
const { responderCasoDeUso } = require("../../../compartido/http/responderCasoDeUso");
const { idClienteAutenticado } = require("../../../compartido/http/usuarioAutenticado");

const crearRutasCarrito = ({ carritoService }) => {
    const rutas = express.Router();

    rutas.get("/carrito", responderCasoDeUso((req) => carritoService.obtenerCarrito(idClienteAutenticado(req)))); // ←
    rutas.post("/carrito/agregar", responderCasoDeUso((req) => {
        const { id_producto, cantidad } = req.body;
        return carritoService.agregarProducto(idClienteAutenticado(req), id_producto, cantidad); // ←
    }));
    rutas.put("/carrito/actualizar", responderCasoDeUso((req) => {
        const { id_producto, cantidad } = req.body;
        return carritoService.actualizarCantidad(idClienteAutenticado(req), id_producto, cantidad); // ←
    }));
    rutas.delete("/carrito/eliminar-item", responderCasoDeUso((req) =>
        carritoService.eliminarProducto(idClienteAutenticado(req), req.body.id_producto))); // ←
    rutas.delete("/carrito/vaciar", responderCasoDeUso((req) => carritoService.vaciar(idClienteAutenticado(req)))); // ←
    rutas.get("/carrito/total", responderCasoDeUso((req) => carritoService.calcularTotal(idClienteAutenticado(req))));

    return rutas;
};

module.exports = crearRutasCarrito;