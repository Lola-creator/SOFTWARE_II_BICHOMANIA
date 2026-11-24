// Tarea 2 – Las rutas del carrito usan el cliente del token (prueba de integración HTTP)
const express = require("express");
const crearRutasCarrito = require("../../src/contextos/carrito/http/rutasCarrito");

describe("rutasCarrito (IDOR)", () => {
    let servidor, url, carritoService;

    beforeEach(async () => {
        carritoService = {
            obtenerCarrito: jest.fn().mockResolvedValue({ productos: [] }),
            agregarProducto: jest.fn().mockResolvedValue({ mensaje: "ok" }),
        };
        const app = express();
        app.use(express.json());
        // Simula el middleware de autenticación (tarea 1): el token pertenece al cliente 7
        app.use((req, res, next) => { req.usuario = { id: 7, rol: "cliente" }; next(); });
        app.use(crearRutasCarrito({ carritoService }));
        await new Promise((listo) => { servidor = app.listen(0, listo); });
        url = `http://localhost:${servidor.address().port}`;
    });

    afterEach(() => new Promise((listo) => servidor.close(listo)));

    test("GET /carrito ignora el id_cliente de la URL", async () => {
        // Act: el atacante pide el carrito del cliente 99
        await fetch(`${url}/carrito?id_cliente=99`);
        // Assert: se consulta el carrito del cliente del token
        expect(carritoService.obtenerCarrito).toHaveBeenCalledWith(7);
    });

    test("POST /carrito/agregar ignora el id_cliente del body", async () => {
        await fetch(`${url}/carrito/agregar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_cliente: 99, id_producto: 3, cantidad: 1 }),
        });
        expect(carritoService.agregarProducto).toHaveBeenCalledWith(7, 3, 1);
    });
});
