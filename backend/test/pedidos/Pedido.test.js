const Pedido = require("../../src/contextos/pedidos/dominio/Pedido");
const Boleta = require("../../src/contextos/pedidos/dominio/Boleta");
const { ESTADOS_PEDIDO } = require("../../src/contextos/pedidos/dominio/EstadosPedido");
const { ErrorValidacion, ErrorNoAutorizado } = require("../../src/compartido/dominio/errores");

describe("Pedido", () => {
    const pedido = (extra = {}) => new Pedido({ id: 1, idCarrito: 3, total: 100, ...extra });

    test("un pedido nuevo nace pendiente de pago", () => {
        const nuevo = Pedido.crear({ idCarrito: 3, idDireccion: 2, fechaPedido: "2026-11-23" });
        expect(nuevo.idEstado).toBe(ESTADOS_PEDIDO.PENDIENTE_DE_PAGO);
    });

    test("crear exige carrito y dirección", () => {
        expect(() => Pedido.crear({ idCarrito: 3 })).toThrow(ErrorValidacion);
    });

    test("la deuda es el total menos lo pagado", () => {
        const p = pedido({ pagos: [{ metodoPago: "yape", monto: 30.1 }] });
        expect(p.pagado).toBe(30.1);
        expect(p.deuda).toBe(69.9);
    });

    test("un pago parcial mantiene el pedido pendiente", () => {
        const p = pedido();
        p.registrarPago({ metodoPago: "tarjeta", monto: 40 });
        expect(p.deuda).toBe(60);
        expect(p.estaPagado()).toBe(false);
    });

    test("pagar toda la deuda marca el pedido como pagado", () => {
        const p = pedido({ pagos: [{ metodoPago: "yape", monto: 40 }] });
        p.registrarPago({ metodoPago: "tarjeta", monto: 60 });
        expect(p.estaPagado()).toBe(true);
        expect(p.idEstado).toBe(ESTADOS_PEDIDO.PAGADO);
    });

    test("no se puede pagar más de la deuda", () => {
        expect(() => pedido().registrarPago({ metodoPago: "yape", monto: 100.01 })).toThrow("No puedes pagar más de la deuda");
    });

    test.each([0, -5, "abc", null])("rechaza montos inválidos (%p)", (monto) => {
        expect(() => pedido().registrarPago({ metodoPago: "yape", monto })).toThrow(ErrorValidacion);
    });

    test("al anular devuelve lo pagado", () => {
        expect(pedido({ pagos: [{ metodoPago: "yape", monto: 25 }] }).montoADevolverAlAnular()).toBe(25);
    });

    test("verificarPropietario acepta al cliente dueño del pedido", () => {
        const p = pedido({ idCliente: 8 });

        const verificar = () => p.verificarPropietario(8);

        expect(verificar).not.toThrow();
    });

    test("verificarPropietario acepta el id del cliente aunque llegue como texto", () => {
        const p = pedido({ idCliente: 8 });

        const verificar = () => p.verificarPropietario("8");

        expect(verificar).not.toThrow();
    });

    test("verificarPropietario rechaza a otro cliente con ErrorNoAutorizado", () => {
        const p = pedido({ idCliente: 8 });

        const verificar = () => p.verificarPropietario(9);

        expect(verificar).toThrow(ErrorNoAutorizado);
        expect(verificar).toThrow("No puedes anular un pedido de otro cliente");
    });

    test.each([undefined, null, ""])("verificarPropietario rechaza si no hay cliente (%p)", (idCliente) => {
        const p = pedido({ idCliente: 8 });

        const verificar = () => p.verificarPropietario(idCliente);

        expect(verificar).toThrow(ErrorNoAutorizado);
    });
});

describe("Boleta", () => {
    const linea = (extra) => ({
        fecha_pedido: new Date("2026-11-01"), producto_nombre: "Camiseta", caracteristica: "M",
        precio: 50, cantidad: 2, metodo_pago: "yape", fecha_pago: "2026-11-02", pago_monto: 60, ...extra,
    });

    test("elimina productos y pagos repetidos por el JOIN y calcula el total", () => {
        const boleta = Boleta.desdeLineas(7, [
            linea(),
            linea({ pago_monto: 40, fecha_pago: "2026-11-03" }),
            linea({ producto_nombre: "Short", precio: 30, cantidad: 1 }),
            linea({ producto_nombre: "Short", precio: 30, cantidad: 1, pago_monto: 40, fecha_pago: "2026-11-03" }),
        ]);
        expect(boleta.productos).toHaveLength(2);
        expect(boleta.pagos).toHaveLength(2);
        expect(boleta.total).toBe(130);
    });

    test("un pedido sin pagos no lista pagos", () => {
        expect(Boleta.desdeLineas(1, [linea({ metodo_pago: null })]).pagos).toEqual([]);
    });
});
