const { crearPoliticaAcceso } = require("../../src/compartido/http/politicaAcceso");
const { RUTAS_PUBLICAS, RUTAS_SOLO_EMPLEADOS } = require("../../src/arranque/reglasAcceso");

// Verifica la tabla real de reglas que usa la aplicación
describe("reglasAcceso de Bichomanía", () => {
    let politica;

    const resultado = (method, path, token) => {
        const res = { codigo: null, status(c) { this.codigo = c; return this; }, json() { return this; } };
        let paso = false;
        politica({ method, path, headers: token ? { authorization: `Bearer ${token}` } : {} }, res, () => { paso = true; });
        return paso ? "pasa" : res.codigo;
    };

    beforeEach(() => {
        politica = crearPoliticaAcceso({
            verificadorTokens: { verificar: (t) => ({ rol: t }) },
            publicas: RUTAS_PUBLICAS,
            soloEmpleados: RUTAS_SOLO_EMPLEADOS,
        });
    });

    // Casos representativos de cada grupo (rutas exactas y con :parametro)
    test.each([
        ["POST", "/login/user"],
        ["GET", "/productos"],
        ["GET", "/producto/3"],
    ])("%s %s es pública", (metodo, ruta) => {
        expect(resultado(metodo, ruta)).toBe("pasa");
    });

    test.each([
        ["GET", "/carrito"],
        ["POST", "/pedido/crear"],
        ["GET", "/boleta/4"],
    ])("%s %s exige token", (metodo, ruta) => {
        expect(resultado(metodo, ruta)).toBe(401);
        expect(resultado(metodo, ruta, "cliente")).toBe("pasa");
    });

    test.each([
        ["DELETE", "/productos/eliminar/3"],
        ["POST", "/marcas"],
        ["GET", "/clientes"],
    ])("%s %s es solo para empleados", (metodo, ruta) => {
        expect(resultado(metodo, ruta, "cliente")).toBe(403);
        expect(resultado(metodo, ruta, "empleado")).toBe("pasa");
    });
});
