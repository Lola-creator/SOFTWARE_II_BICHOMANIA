const express = require("express");
const { responderCasoDeUso } = require("../../../compartido/http/responderCasoDeUso");

const crearRutasUbicaciones = ({ ubicacionService }) => {
    const rutas = express.Router();
    const json = { formatoError: "json", respuesta: "json" };

    rutas.get("/paises", responderCasoDeUso(() => ubicacionService.listarPaises(), { respuesta: "json" }));
    rutas.post("/paises", responderCasoDeUso((req) => ubicacionService.agregarPais(req.body), json));
    rutas.put("/paises/:id", responderCasoDeUso((req) => ubicacionService.actualizarPais(req.params.id, req.body), json));

    rutas.get("/ciudades", responderCasoDeUso((req) => ubicacionService.listarCiudades(req.query.id_pais), { respuesta: "json" }));
    rutas.post("/ciudades", responderCasoDeUso((req) => ubicacionService.agregarCiudad(req.body), json));
    rutas.put("/ciudades/:id", responderCasoDeUso((req) => ubicacionService.actualizarCiudad(req.params.id, req.body), json));

    rutas.get("/direccion", responderCasoDeUso((req) => ubicacionService.listarDirecciones(req.query.id_cliente)));
    rutas.post("/direccionAgregar", responderCasoDeUso((req) => ubicacionService.agregarDireccion(req.body), json));

    return rutas;
};

module.exports = crearRutasUbicaciones;
