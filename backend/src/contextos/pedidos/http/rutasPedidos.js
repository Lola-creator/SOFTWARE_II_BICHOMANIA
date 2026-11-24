const express = require("express");
const { responderCasoDeUso } = require("../../../compartido/http/responderCasoDeUso");
const { idClienteAutenticado } = require("../../../compartido/http/usuarioAutenticado"); // ←

const crearRutasPedidos = ({ pedidoService, generadorBoleta }) => {
    const rutas = express.Router();
    const json = { formatoError: "json", respuesta: "json" };

    rutas.post("/pedido/crear", responderCasoDeUso((req) => pedidoService.crearDesdeCarrito(req.body), json));
    rutas.delete("/pedido/eliminar/:id_pedido", responderCasoDeUso((req) => pedidoService.anular(req.params.id_pedido), json));

    rutas.get("/deuda", responderCasoDeUso((req) => pedidoService.deudaDeCarrito(req.query.id_carrito), json));
    rutas.get("/deudas/:id_cliente", responderCasoDeUso((req) => pedidoService.listarDeudas(idClienteAutenticado(req)), json)); // ←
    rutas.get("/compras/:id_cliente", responderCasoDeUso((req) => pedidoService.listarCompras(idClienteAutenticado(req)), json)); // ←

    rutas.post("/pagos/registrar", responderCasoDeUso((req) => pedidoService.registrarPago(req.body), json));
    rutas.get("/pagos/deuda/:id_pedido", responderCasoDeUso((req) => pedidoService.deudaDePedido(req.params.id_pedido), json));
    rutas.get("/pagos/:id_pedido", responderCasoDeUso((req) => pedidoService.listarPagos(req.params.id_pedido), json));

    rutas.get("/boleta/:id_pedido", responderCasoDeUso(async (req, res) => {
        const boleta = await pedidoService.obtenerBoleta(req.params.id_pedido);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=boleta_${boleta.idPedido}.pdf`);
        generadorBoleta.generar(boleta, res);
    }));

    return rutas;
};

module.exports = crearRutasPedidos;