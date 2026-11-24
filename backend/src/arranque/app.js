const express = require("express");
const cors = require("cors");
const crearRutasIdentidad = require("../contextos/identidad/http/rutasIdentidad");
const crearRutasCatalogo = require("../contextos/catalogo/http/rutasCatalogo");
const crearRutasCarrito = require("../contextos/carrito/http/rutasCarrito");
const crearRutasUbicaciones = require("../contextos/ubicaciones/http/rutasUbicaciones");
const crearRutasResenas = require("../contextos/resenas/http/rutasResenas");
const crearRutasPedidos = require("../contextos/pedidos/http/rutasPedidos");
const crearRutasEncuestas = require("../contextos/encuestas/http/rutasEncuestas");

// Arma la aplicación Express a partir del contenedor (sin abrir el puerto: útil para pruebas)
const crearApp = (contenedor) => {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use("/uploads", express.static(contenedor.directorioImagenes));

    app.get("/", (req, res) => res.send("Servidor funcionando."));
    app.get("/test-db", async (req, res) => {
        try {
            res.json(await contenedor.persistencia.probarConexion());
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.use(crearRutasIdentidad(contenedor));
    app.use(crearRutasCatalogo(contenedor));
    app.use(crearRutasCarrito(contenedor));
    app.use(crearRutasUbicaciones(contenedor));
    app.use(crearRutasResenas(contenedor));
    app.use(crearRutasPedidos(contenedor));
    app.use(crearRutasEncuestas(contenedor));

    return app;
};

module.exports = crearApp;
