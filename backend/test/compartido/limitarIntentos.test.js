const express = require("express");
const limitarIntentos = require("../../src/compartido/http/limitarIntentos");

const esperar = (milisegundos) => new Promise((resolver) => setTimeout(resolver, milisegundos));

const levantarServidor = (middleware) => new Promise((resolver) => {
    const app = express();
    app.post("/login", middleware, (req, res) => res.send("ok"));
    const servidor = app.listen(0, "127.0.0.1", () => {
        resolver({ servidor, url: `http://127.0.0.1:${servidor.address().port}/login` });
    });
});

describe("limitarIntentos", () => {
    let servidor;

    afterEach(async () => {
        await new Promise((resolver) => servidor.close(resolver));
    });

    test("por defecto permite 5 intentos y bloquea el sexto", async () => {
        let url;
        ({ servidor, url } = await levantarServidor(limitarIntentos()));
        const estados = [];

        for (let intento = 0; intento < 6; intento++) {
            estados.push((await fetch(url, { method: "POST" })).status);
        }

        expect(estados).toEqual([200, 200, 200, 200, 200, 429]);
    });

    test("vuelve a permitir intentos cuando pasa la ventana de tiempo", async () => {
        let url;
        ({ servidor, url } = await levantarServidor(limitarIntentos({ maximo: 2, ventanaMs: 200 })));
        await fetch(url, { method: "POST" });
        await fetch(url, { method: "POST" });
        const bloqueado = await fetch(url, { method: "POST" });

        await esperar(300);
        const permitido = await fetch(url, { method: "POST" });

        expect(bloqueado.status).toBe(429);
        expect(permitido.status).toBe(200);
    });
});
