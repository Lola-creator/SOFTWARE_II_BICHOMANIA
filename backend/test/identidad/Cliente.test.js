const Cliente = require("../../src/contextos/identidad/dominio/Cliente");
const CorreoElectronico = require("../../src/contextos/identidad/dominio/CorreoElectronico");
const { validarContrasenaNueva } = require("../../src/contextos/identidad/dominio/PoliticaContrasena");
const { ErrorValidacion } = require("../../src/compartido/dominio/errores");

const datosValidos = (extra = {}) => ({
    nombre: "Ana", apellidoPaterno: "Pérez", telefono: "987654321",
    correo: "ana@gmail.com", dni: "12345678", contrasenaHash: "hash", ...extra,
});

describe("CorreoElectronico", () => {
    test("normaliza a minúsculas y sin espacios", () => {
        expect(new CorreoElectronico("  Ana@Gmail.COM ").valor).toBe("ana@gmail.com");
    });

    test.each(["", "ana", "ana@", "@gmail.com", "ana gmail.com"])("rechaza '%s'", (correo) => {
        expect(() => new CorreoElectronico(correo)).toThrow(ErrorValidacion);
    });

    test("dos correos con el mismo valor son iguales", () => {
        expect(new CorreoElectronico("a@b.com").equals(new CorreoElectronico("A@B.com"))).toBe(true);
    });
});

describe("PoliticaContrasena", () => {
    test.each(["Abcdefgh", "Clave12345"])("acepta '%s'", (clave) => {
        expect(() => validarContrasenaNueva(clave)).not.toThrow();
    });

    test.each(["corta1A", "sinmayusculas", "MuyLargaDemasiado1", undefined])("rechaza %p", (clave) => {
        expect(() => validarContrasenaNueva(clave)).toThrow(ErrorValidacion);
    });
});

describe("Cliente.registrar", () => {
    test("crea un cliente válido con saldo 0", () => {
        const cliente = Cliente.registrar(datosValidos());
        expect(cliente.saldo).toBe(0);
        expect(cliente.correo.valor).toBe("ana@gmail.com");
    });

    test.each([
        [{ dni: "1234567" }, "DNI"],
        [{ dni: "12345abc" }, "DNI"],
        [{ telefono: "12345" }, "teléfono"],
        [{ nombre: "   " }, "nombre"],
        [{ apellidoPaterno: "" }, "apellido"],
        [{ correo: "no-es-correo" }, "correo"],
    ])("rechaza datos inválidos %p", (extra, mensaje) => {
        expect(() => Cliente.registrar(datosValidos(extra))).toThrow(mensaje);
    });

    test("la sesión no expone el hash de la contraseña", () => {
        const sesion = new Cliente({ id: 3, ...datosValidos() }).sesion();
        expect(sesion).toEqual({ id: 3, nombre: "Ana", correo: "ana@gmail.com", rol: "cliente" });
    });

    test("abonarSaldo suma y redondea", () => {
        const cliente = new Cliente({ ...datosValidos(), saldo: "10.10" });
        cliente.abonarSaldo(0.2);
        expect(cliente.saldo).toBe(10.3);
        expect(() => cliente.abonarSaldo(-1)).toThrow(ErrorValidacion);
    });
});
