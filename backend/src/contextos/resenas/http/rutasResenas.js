const express = require("express");
const { responderCasoDeUso } = require("../../../compartido/http/responderCasoDeUso");

const crearRutasResenas = ({ resenaService }) => {
    const rutas = express.Router();
    const json = { respuesta: "json" };

    rutas.post("/resenas", responderCasoDeUso((req) => resenaService.crear(req.body), json));
    rutas.get("/resenas/:id_producto", responderCasoDeUso((req) => resenaService.listarPorProducto(req.params.id_producto), json));
    rutas.put("/resenas/:id_resena", responderCasoDeUso((req) => resenaService.editar(req.params.id_resena, req.body), json));
    rutas.delete("/resenas/:id_resena", responderCasoDeUso(
        (req) => resenaService.eliminar(req.params.id_resena, req.body?.id_cliente), json));

    return rutas;
};

module.exports = crearRutasResenas;
