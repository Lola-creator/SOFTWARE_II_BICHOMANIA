const { RepositorioPedidos } = require("../../src/contextos/pedidos/dominio/puertos");

describe("RepositorioPedidos", () => {
    test("el contrato exige implementar guardarYCerrarCarrito", async () => {
        const repositorio = new RepositorioPedidos();

        const resultado = repositorio.guardarYCerrarCarrito();

        await expect(resultado).rejects.toThrow("Método no implementado: guardarYCerrarCarrito");
    });
});
