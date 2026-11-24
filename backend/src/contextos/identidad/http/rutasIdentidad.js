const express = require("express");
const { responderCasoDeUso } = require("../../../compartido/http/responderCasoDeUso");
const limitarIntentos = require("../../../compartido/http/limitarIntentos");

// Controladores HTTP del contexto Identidad (clientes y empleados)
const crearRutasIdentidad = ({ identidadService }) => {
    const rutas = express.Router();
    const limitarLogin = limitarIntentos();

    rutas.post("/registrar", responderCasoDeUso(
        (req) => identidadService.registrarCliente(req.body),
        { formatoError: "jsonMessage", respuesta: "json" },
    ));
    rutas.post("/login/user", limitarLogin, responderCasoDeUso(
        (req) => identidadService.iniciarSesionCliente(req.body), { respuesta: "json" },
    ));
    rutas.post("/login/employee", limitarLogin, responderCasoDeUso(
        (req) => identidadService.iniciarSesionEmpleado(req.body),
    ));
    rutas.get("/profile", responderCasoDeUso(
        (req) => identidadService.obtenerPerfil(req.query.id_cliente),
    ));
    rutas.get("/clientes", responderCasoDeUso(() => identidadService.listarClientes()));

    return rutas;
};

module.exports = crearRutasIdentidad;
