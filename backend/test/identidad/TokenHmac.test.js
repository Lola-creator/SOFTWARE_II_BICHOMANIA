const TokenHmac = require("../../src/contextos/identidad/infraestructura/TokenHmac");
const { EmisorTokens } = require("../../src/contextos/identidad/dominio/puertos");
const { ErrorCredenciales } = require("../../src/compartido/dominio/errores");

describe("TokenHmac", () => {
    const SECRETO = "secreto-de-prueba-suficientemente-largo";
    const AHORA = Date.parse("2026-11-24T15:00:00Z");
    const sesionCliente = { id: 5, nombre: "Ana", correo: "ana@gmail.com", rol: "cliente" };
    let reloj;
    let tokens;

    beforeEach(() => {
        reloj = jest.fn(() => AHORA);
        tokens = new TokenHmac({ secreto: SECRETO, duracionSegundos: 3600, reloj });
    });

    test("implementa el puerto EmisorTokens del dominio", () => {
        expect(tokens).toBeInstanceOf(EmisorTokens);
    });

    test("emite un token con formato cabecera.carga.firma", () => {
        const token = tokens.emitir(sesionCliente);

        expect(token.split(".")).toHaveLength(3);
    });

    test("verificar devuelve los datos de la sesión emitida", () => {
        const token = tokens.emitir(sesionCliente);

        const datos = tokens.verificar(token);

        expect(datos).toMatchObject({ id: 5, rol: "cliente", correo: "ana@gmail.com" });
    });

    test("rechaza un token cuya carga fue modificada (p. ej. cambiar el rol)", () => {
        const [cabecera, , firma] = tokens.emitir(sesionCliente).split(".");
        const cargaFalsa = Buffer.from(JSON.stringify({ ...sesionCliente, rol: "empleado", exp: 9e9 })).toString("base64url");

        expect(() => tokens.verificar(`${cabecera}.${cargaFalsa}.${firma}`)).toThrow(ErrorCredenciales);
    });

    test("rechaza un token firmado con otro secreto", () => {
        const otro = new TokenHmac({ secreto: "otro-secreto-distinto-tambien-largo", reloj });

        expect(() => tokens.verificar(otro.emitir(sesionCliente))).toThrow(ErrorCredenciales);
    });

    test("rechaza un token expirado", () => {
        const token = tokens.emitir(sesionCliente);
        reloj.mockReturnValue(AHORA + 3601 * 1000);

        expect(() => tokens.verificar(token)).toThrow("Token inválido o expirado");
    });

    test.each([undefined, "", "abc", "a.b", "a.b.c.d"])("rechaza el valor mal formado %p", (valor) => {
        expect(() => tokens.verificar(valor)).toThrow(ErrorCredenciales);
    });

    test("exige un secreto de al menos 32 caracteres", () => {
        expect(() => new TokenHmac({ secreto: "corto" })).toThrow("secreto");
    });
});
