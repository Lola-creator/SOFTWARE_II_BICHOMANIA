const PedidoRepositoryMySQL = require("../../src/contextos/pedidos/infraestructura/mysql/PedidoRepositoryMySQL");
const Pedido = require("../../src/contextos/pedidos/dominio/Pedido");
const { RepositorioPedidos } = require("../../src/contextos/pedidos/dominio/puertos");
const { ESTADOS_CARRITO } = require("../../src/contextos/carrito/dominio/EstadosCarrito");

const normalizarSql = (sql) => sql.replace(/\s+/g, " ").trim();

describe("PedidoRepositoryMySQL", () => {
    let transaccion;
    let pool;
    let repositorio;
    let pedido;

    beforeEach(() => {
        transaccion = {
            beginTransaction: jest.fn(),
            execute: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
            release: jest.fn(),
        };
        pool = { getConnection: jest.fn().mockResolvedValue(transaccion), execute: jest.fn() };
        repositorio = new PedidoRepositoryMySQL(pool);
        pedido = Pedido.crear({ idCarrito: 5, idDireccion: 2, fechaPedido: "2026-11-23" });
    });

    test("implementa el contrato RepositorioPedidos del dominio", () => {
        expect(repositorio).toBeInstanceOf(RepositorioPedidos);
    });

    describe("guardarYCerrarCarrito", () => {
        test("guarda el pedido y cambia el carrito dentro de la misma transaccion", async () => {
            transaccion.execute
                .mockResolvedValueOnce([{ insertId: 11 }])
                .mockResolvedValueOnce([{ affectedRows: 1 }])
                .mockResolvedValueOnce([{ insertId: 21 }]);

            const resultado = await repositorio.guardarYCerrarCarrito(pedido, "2026-11-23");

            const sentencias = transaccion.execute.mock.calls.map(([sql, parametros]) => [normalizarSql(sql).split(" (")[0], parametros]);
            expect(resultado).toEqual({ idPedido: 11, idNuevoCarrito: 21 });
            expect(sentencias).toEqual([
                ["INSERT INTO pedidos", [5, 2, "2026-11-23", pedido.idEstado]],
                ["UPDATE carritos SET id_estado = ? WHERE id_carrito = ?", [ESTADOS_CARRITO.CERRADO, 5]],
                ["INSERT INTO carritos", ["2026-11-23", ESTADOS_CARRITO.ACTIVO, 5]],
            ]);
            expect(pool.execute).not.toHaveBeenCalled();
        });

        test("confirma la transaccion una sola vez y libera la conexion", async () => {
            transaccion.execute
                .mockResolvedValueOnce([{ insertId: 11 }])
                .mockResolvedValueOnce([{ affectedRows: 1 }])
                .mockResolvedValueOnce([{ insertId: 21 }]);

            await repositorio.guardarYCerrarCarrito(pedido, "2026-11-23");

            expect(transaccion.beginTransaction).toHaveBeenCalledTimes(1);
            expect(transaccion.commit).toHaveBeenCalledTimes(1);
            expect(transaccion.rollback).not.toHaveBeenCalled();
            expect(transaccion.release).toHaveBeenCalledTimes(1);
        });

        test("si falla el cierre del carrito deshace el pedido", async () => {
            const errorBaseDeDatos = new Error("Conexion perdida");
            transaccion.execute
                .mockResolvedValueOnce([{ insertId: 11 }])
                .mockRejectedValueOnce(errorBaseDeDatos);

            const resultado = repositorio.guardarYCerrarCarrito(pedido, "2026-11-23");

            await expect(resultado).rejects.toBe(errorBaseDeDatos);
            expect(transaccion.rollback).toHaveBeenCalledTimes(1);
            expect(transaccion.commit).not.toHaveBeenCalled();
            expect(transaccion.release).toHaveBeenCalledTimes(1);
        });
    });
});
