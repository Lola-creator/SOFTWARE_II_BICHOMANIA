const { PedidoRepositoryMemoria } = require("../../src/contextos/pedidos/infraestructura/memoria/PedidosMemoria");
const { BaseDatosMemoria } = require("../../src/compartido/infraestructura/memoria/BaseDatosMemoria");
const Pedido = require("../../src/contextos/pedidos/dominio/Pedido");
const { ESTADOS_CARRITO } = require("../../src/contextos/carrito/dominio/EstadosCarrito");

describe("PedidoRepositoryMemoria.guardarYCerrarCarrito", () => {
    let bd;
    let repositorio;
    let pedido;

    beforeEach(() => {
        bd = new BaseDatosMemoria();
        bd.insertar("carritos", "id_carrito", { fecha_creacion: "2026-11-20", id_cliente: 4, id_estado: ESTADOS_CARRITO.ACTIVO });
        repositorio = new PedidoRepositoryMemoria(bd);
        pedido = Pedido.crear({ idCarrito: 1, idDireccion: 2, fechaPedido: "2026-11-23" });
    });

    test("guarda el pedido, cierra el carrito y abre uno nuevo para el cliente", async () => {
        const resultado = await repositorio.guardarYCerrarCarrito(pedido, "2026-11-23");

        expect(resultado).toEqual({ idPedido: 1, idNuevoCarrito: 2 });
        expect(bd.tabla("pedidos")).toEqual([
            { id_pedido: 1, id_carrito: 1, id_direccion: 2, fecha_pedido: "2026-11-23", id_estado: pedido.idEstado },
        ]);
        expect(bd.tabla("carritos")).toEqual([
            { id_carrito: 1, fecha_creacion: "2026-11-20", id_cliente: 4, id_estado: ESTADOS_CARRITO.CERRADO },
            { id_carrito: 2, fecha_creacion: "2026-11-23", id_cliente: 4, id_estado: ESTADOS_CARRITO.ACTIVO },
        ]);
    });

    test("si falla abrir el carrito nuevo no queda el pedido ni el carrito cerrado", async () => {
        const insertarOriginal = bd.insertar.bind(bd);
        jest.spyOn(bd, "insertar").mockImplementation((nombre, columnaId, fila) => {
            if (nombre === "carritos") throw new Error("Sin espacio");
            return insertarOriginal(nombre, columnaId, fila);
        });

        const resultado = repositorio.guardarYCerrarCarrito(pedido, "2026-11-23");

        await expect(resultado).rejects.toThrow("Sin espacio");
        expect(bd.tabla("pedidos")).toEqual([]);
        expect(bd.primero("carritos", (c) => c.id_carrito === 1).id_estado).toBe(ESTADOS_CARRITO.ACTIVO);
    });

    test("despues de un fallo los ids siguen la secuencia sin saltos", async () => {
        const insertarOriginal = bd.insertar.bind(bd);
        const espia = jest.spyOn(bd, "insertar").mockImplementation((nombre, columnaId, fila) => {
            if (nombre === "carritos") throw new Error("Sin espacio");
            return insertarOriginal(nombre, columnaId, fila);
        });
        await expect(repositorio.guardarYCerrarCarrito(pedido, "2026-11-23")).rejects.toThrow();
        espia.mockRestore();

        const resultado = await repositorio.guardarYCerrarCarrito(pedido, "2026-11-23");

        expect(resultado).toEqual({ idPedido: 1, idNuevoCarrito: 2 });
    });
});
