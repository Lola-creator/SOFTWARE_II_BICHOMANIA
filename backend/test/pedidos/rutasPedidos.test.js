const express = require("express");
const crearRutasPedidos = require("../../src/contextos/pedidos/http/rutasPedidos");
const { ErrorNoAutorizado } = require("../../src/compartido/dominio/errores");

const USUARIO = { id: 8, rol: "cliente" };

const levantarServidor = (pedidoService) => new Promise((resolver) => {
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
        req.usuario = USUARIO;
        next();
    });
    app.use(crearRutasPedidos({ pedidoService, generadorBoleta: {} }));
    const servidor = app.listen(0, "127.0.0.1", () => {
        resolver({ servidor, url: `http://127.0.0.1:${servidor.address().port}` });
    });
});

describe("rutasPedidos anular pedido", () => {
    let pedidoService;
    let servidor;
    let url;

    beforeEach(async () => {
        pedidoService = { anular: jest.fn() };
        ({ servidor, url } = await levantarServidor(pedidoService));
    });

    afterEach(() => new Promise((resolver) => servidor.close(resolver)));

    test("pasa el usuario autenticado al servicio", async () => {
        pedidoService.anular.mockResolvedValue({ ok: true, mensaje: "Pedido eliminado correctamente", devuelto_al_saldo: 0 });

        const respuesta = await fetch(`${url}/pedido/eliminar/4`, { method: "DELETE" });

        expect(respuesta.status).toBe(200);
        expect(pedidoService.anular).toHaveBeenCalledWith("4", USUARIO);
    });

    test("responde 403 si el pedido es de otro cliente", async () => {
        pedidoService.anular.mockRejectedValue(new ErrorNoAutorizado("No puedes anular un pedido de otro cliente"));

        const respuesta = await fetch(`${url}/pedido/eliminar/4`, { method: "DELETE" });

        expect(respuesta.status).toBe(403);
        expect(await respuesta.json()).toEqual({ error: "No puedes anular un pedido de otro cliente" });
    });
});
