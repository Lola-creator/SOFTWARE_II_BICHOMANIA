const { crearPoliticaAcceso } = require("../../src/compartido/http/politicaAcceso");
const { ErrorCredenciales } = require("../../src/compartido/dominio/errores");

describe("politicaAcceso (middleware de autenticación con token)", () => {
    let verificadorTokens;
    let politica;
    let res;
    let next;

    const peticion = (method, path, token) => ({
        method,
        path,
        headers: token ? { authorization: `Bearer ${token}` } : {},
    });

    beforeEach(() => {
        verificadorTokens = {
            verificar: jest.fn((token) => {
                if (token === "token-cliente") return { id: 5, rol: "cliente" };
                if (token === "token-empleado") return { id: 1, rol: "empleado" };
                throw new ErrorCredenciales("Token inválido o expirado");
            }),
        };
        politica = crearPoliticaAcceso({
            verificadorTokens,
            publicas: ["POST /login/user", "GET /productos", "GET /producto/:id"],
            soloEmpleados: ["DELETE /productos/eliminar/:id", "GET /clientes"],
        });
        res = { status: jest.fn(), json: jest.fn() };
        res.status.mockReturnValue(res);
        next = jest.fn();
    });

    test("deja pasar una ruta pública sin token", () => {
        politica(peticion("GET", "/producto/7"), res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    test("responde 401 en una ruta privada sin cabecera Authorization", () => {
        politica(peticion("GET", "/carrito"), res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Token requerido" });
        expect(next).not.toHaveBeenCalled();
    });

    test("responde 401 si el token es inválido o expiró", () => {
        politica(peticion("GET", "/carrito", "token-falso"), res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Token inválido o expirado" });
        expect(next).not.toHaveBeenCalled();
    });

    test("con token válido deja pasar y expone el usuario en req.usuario", () => {
        const req = peticion("GET", "/carrito", "token-cliente");

        politica(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.usuario).toEqual({ id: 5, rol: "cliente" });
    });

    test("responde 403 si un cliente intenta una ruta solo para empleados", () => {
        politica(peticion("DELETE", "/productos/eliminar/3", "token-cliente"), res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: "Acceso solo para empleados" });
        expect(next).not.toHaveBeenCalled();
    });

    test("un empleado sí puede usar una ruta solo para empleados", () => {
        politica(peticion("DELETE", "/productos/eliminar/3", "token-empleado"), res, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    test("el método HTTP forma parte de la regla (POST /productos no es pública)", () => {
        politica(peticion("POST", "/productos"), res, next);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    test("los parámetros :id no aceptan barras (no se puede saltar a otra ruta)", () => {
        politica(peticion("GET", "/producto/7/../../clientes"), res, next);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    test("deja pasar las peticiones OPTIONS (preflight de CORS)", () => {
        politica(peticion("OPTIONS", "/carrito"), res, next);

        expect(next).toHaveBeenCalledTimes(1);
    });
});
