const express = require("express");
const { responderCasoDeUso } = require("../../../compartido/http/responderCasoDeUso");

const crearRutasEncuestas = ({ encuestaService }) => {
    const rutas = express.Router();

    rutas.post("/crear_encuesta", responderCasoDeUso((req) => encuestaService.crearEncuesta(req.body)));
    rutas.delete("/eliminar_encuesta/:id", responderCasoDeUso((req) => encuestaService.eliminarEncuesta(req.params.id)));
    rutas.put("/cerrar_encuesta/:id", responderCasoDeUso((req) => encuestaService.cerrarEncuesta(req.params.id)));
    rutas.get("/encuestas-activas", responderCasoDeUso(() => encuestaService.listarActivas()));
    rutas.get("/encuestas", responderCasoDeUso((req) => encuestaService.listarPorEmpleado(req.query.id_empleado)));
    rutas.post("/votar", responderCasoDeUso((req) => {
        const { idCliente, idEncuesta, idDetalle } = req.body;
        return encuestaService.votar(idCliente, idEncuesta, idDetalle);
    }));
    rutas.get("/ya-voto/:idCliente/:idEncuesta", responderCasoDeUso(
        (req) => encuestaService.yaVoto(req.params.idCliente, req.params.idEncuesta)));
    rutas.get("/detalles-encuesta/:id", responderCasoDeUso((req) => encuestaService.obtenerDetalles(req.params.id)));
    rutas.get("/encuesta_ganadora/:id_encuesta", responderCasoDeUso(
        (req) => encuestaService.obtenerGanadora(req.params.id_encuesta)));

    return rutas;
};

module.exports = crearRutasEncuestas;
