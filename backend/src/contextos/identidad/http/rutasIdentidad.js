const express = require("express");
const { responderCasoDeUso } = require("../../../compartido/http/responderCasoDeUso");
const { idClienteAutenticado } = require("../../../compartido/http/usuarioAutenticado"); 
const limitarIntentos = require("../../../compartido/http/limitarIntentos");
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
        (req) => identidadService.obtenerPerfil(idClienteAutenticado(req)), // ←
    ));
    rutas.get("/clientes", responderCasoDeUso(() => identidadService.listarClientes()));

    return rutas;
};

module.exports = crearRutasIdentidad;