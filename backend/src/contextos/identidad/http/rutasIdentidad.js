const express = require("express");
const { responderCasoDeUso } = require("../../../compartido/http/responderCasoDeUso");

// Controladores HTTP del contexto Identidad (clientes y empleados)
const crearRutasIdentidad = ({ identidadService }) => {
    const rutas = express.Router();

    rutas.post("/registrar", responderCasoDeUso(
        (req) => identidadService.registrarCliente(req.body),
        { formatoError: "jsonMessage", respuesta: "json" },
    ));
    rutas.post("/login/user", responderCasoDeUso(
        (req) => identidadService.iniciarSesionCliente(req.body), { respuesta: "json" },
    ));
    rutas.post("/login/employee", responderCasoDeUso(
        (req) => identidadService.iniciarSesionEmpleado(req.body),
    ));
    rutas.get("/profile", responderCasoDeUso(
        (req) => identidadService.obtenerPerfil(req.query.id_cliente),
    ));
    rutas.get("/clientes", responderCasoDeUso(() => identidadService.listarClientes()));

    return rutas;
};

module.exports = crearRutasIdentidad;
