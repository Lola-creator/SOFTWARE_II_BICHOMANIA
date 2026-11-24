// Tarea 2 – Tomar el id del cliente desde el token (IDOR)
// Supone que el middleware de la tarea 1 (autenticación) deja req.usuario = { id, rol }
const { idClienteAutenticado } = require("../../src/compartido/http/usuarioAutenticado");
const { ErrorCredenciales, ErrorNoAutorizado } = require("../../src/compartido/dominio/errores");

describe("idClienteAutenticado", () => {
    test("devuelve el id del usuario del token, no el que viene en la petición", () => {
        // Arrange
        const req = { usuario: { id: 7, rol: "cliente" }, query: { id_cliente: "99" }, body: { id_cliente: 99 } };
        // Act
        const id = idClienteAutenticado(req);
        // Assert
        expect(id).toBe(7);
    });

    test("sin sesión lanza ErrorCredenciales (401)", () => {
        expect(() => idClienteAutenticado({ query: { id_cliente: "7" } })).toThrow(ErrorCredenciales);
    });

    test("un empleado no puede usar rutas de cliente (403)", () => {
        expect(() => idClienteAutenticado({ usuario: { id: 1, rol: "empleado" } })).toThrow(ErrorNoAutorizado);
    });
});
