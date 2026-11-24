const express = require("express");
const crearRutasIdentidad = require("../../src/contextos/identidad/http/rutasIdentidad");
const { ErrorCredenciales } = require("../../src/compartido/dominio/errores");

const MENSAJE_LIMITE = "Demasiados intentos de inicio de sesión. Intenta de nuevo en un minuto";

const levantarServidor = (identidadService) => new Promise((resolver) => {
    const app = express();
    app.use(express.json());
    app.use(crearRutasIdentidad({ identidadService }));
    const servidor = app.listen(0, "127.0.0.1", () => {
        resolver({ servidor, url: `http://127.0.0.1:${servidor.address().port}` });
    });
});

const enviarLogin = (url, ruta) => fetch(`${url}${ruta}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo: "ana@gmail.com", password: "Incorrecta1" }),
});

const repetir = async (veces, accion) => {
    const respuestas = [];
    for (let intento = 0; intento < veces; intento++) {
        respuestas.push(await accion());
    }
    return respuestas;
};

describe("rutasIdentidad limite de intentos de login", () => {
    let identidadService;
    let servidor;
    let url;

    beforeEach(async () => {
        identidadService = {
            iniciarSesionCliente: jest.fn().mockRejectedValue(new ErrorCredenciales("Credenciales incorrectas")),
            iniciarSesionEmpleado: jest.fn().mockRejectedValue(new ErrorCredenciales("Credenciales incorrectas")),
            listarClientes: jest.fn().mockResolvedValue([]),
        };
        ({ servidor, url } = await levantarServidor(identidadService));
    });

    afterEach(async () => {
        await new Promise((resolver) => servidor.close(resolver));
    });

    test("permite 5 intentos de login de cliente por minuto", async () => {
        const respuestas = await repetir(5, () => enviarLogin(url, "/login/user"));

        expect(respuestas.map((respuesta) => respuesta.status)).toEqual([401, 401, 401, 401, 401]);
    });

    test("el sexto intento de login de cliente responde 429 con un mensaje claro", async () => {
        await repetir(5, () => enviarLogin(url, "/login/user"));

        const respuesta = await enviarLogin(url, "/login/user");

        expect(respuesta.status).toBe(429);
        expect(await respuesta.text()).toBe(MENSAJE_LIMITE);
    });

    test("un intento bloqueado no llega al servicio", async () => {
        await repetir(7, () => enviarLogin(url, "/login/user"));

        const llamadas = identidadService.iniciarSesionCliente.mock.calls.length;

        expect(llamadas).toBe(5);
    });

    test("el sexto intento de login de empleado responde 429", async () => {
        await repetir(5, () => enviarLogin(url, "/login/employee"));

        const respuesta = await enviarLogin(url, "/login/employee");

        expect(respuesta.status).toBe(429);
        expect(await respuesta.text()).toBe(MENSAJE_LIMITE);
    });

    test("las demas rutas de identidad no tienen limite", async () => {
        const respuestas = await repetir(8, () => fetch(`${url}/clientes`));

        expect(respuestas.every((respuesta) => respuesta.status === 200)).toBe(true);
    });
});
