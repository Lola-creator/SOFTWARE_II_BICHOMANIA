const PedidoService = require("../../src/contextos/pedidos/aplicacion/PedidoService");
const Pedido = require("../../src/contextos/pedidos/dominio/Pedido");
const { ESTADOS_PEDIDO } = require("../../src/contextos/pedidos/dominio/EstadosPedido");
const { ErrorValidacion, ErrorNoEncontrado } = require("../../src/compartido/dominio/errores");
const ErrorPersistencia = require("../../src/compartido/aplicacion/ErrorPersistencia");

describe("PedidoService", () => {
    let pedidos, carritos, monedero, servicio;
    const HOY = new Date(2026, 10, 23, 21, 30); // 9:30 p. m. local: sigue siendo 23

    beforeEach(() => {
        pedidos = {
            guardar: jest.fn(), guardarYCerrarCarrito: jest.fn(), obtenerPorId: jest.fn(), guardarPago: jest.fn(), eliminar: jest.fn(),
            calcularTotalCarrito: jest.fn(), listarResumenPorCliente: jest.fn(), listarPagos: jest.fn(), obtenerLineasBoleta: jest.fn(),
        };
        carritos = { cerrarYAbrirNuevo: jest.fn() };
        monedero = { abonar: jest.fn() };
        servicio = new PedidoService({ repositorioPedidos: pedidos, gestorCarritos: carritos, monederoClientes: monedero, obtenerFechaActual: () => HOY });
    });

    test("crearDesdeCarrito guarda un pedido pendiente y abre un carrito nuevo en una sola operacion", async () => {
        pedidos.guardarYCerrarCarrito.mockResolvedValue({ idPedido: 11, idNuevoCarrito: 21 });

        const r = await servicio.crearDesdeCarrito({ id_carrito: 5, id_direccion: 2, id_estado: 5 });

        const [pedido, fechaNuevoCarrito] = pedidos.guardarYCerrarCarrito.mock.calls[0];
        expect(r).toEqual({ ok: true, id_pedido: 11, nuevo_carrito: 21 });
        expect(pedidos.guardarYCerrarCarrito).toHaveBeenCalledTimes(1);
        expect(pedido.idCarrito).toBe(5);
        expect(pedido.idEstado).toBe(ESTADOS_PEDIDO.PENDIENTE_DE_PAGO);
        expect(pedido.fechaPedido).toBe("2026-11-23");
        expect(fechaNuevoCarrito).toBe("2026-11-23");
    });

    test("crearDesdeCarrito no guarda el pedido por separado del cierre del carrito", async () => {
        pedidos.guardarYCerrarCarrito.mockResolvedValue({ idPedido: 11, idNuevoCarrito: 21 });

        await servicio.crearDesdeCarrito({ id_carrito: 5, id_direccion: 2 });

        expect(pedidos.guardar).not.toHaveBeenCalled();
        expect(carritos.cerrarYAbrirNuevo).not.toHaveBeenCalled();
    });

    test("crearDesdeCarrito informa el error si la operacion atomica falla", async () => {
        pedidos.guardarYCerrarCarrito.mockRejectedValue(new Error("Deadlock"));

        const resultado = servicio.crearDesdeCarrito({ id_carrito: 5, id_direccion: 2 });

        await expect(resultado).rejects.toThrow(ErrorPersistencia);
        await expect(resultado).rejects.toThrow("No se pudo crear el pedido");
    });

    test("registrarPago persiste el pago y devuelve la deuda restante", async () => {
        pedidos.obtenerPorId.mockResolvedValue(new Pedido({ id: 1, idCarrito: 3, total: 100 }));
        const r = await servicio.registrarPago({ id_pedido: 1, metodo_pago: "yape", monto: 100 });
        expect(r).toEqual({ ok: true, deudaRestante: 0 });
        const [pedido, pago] = pedidos.guardarPago.mock.calls[0];
        expect(pedido.estaPagado()).toBe(true);
        expect(pago.fecha).toBe("2026-11-23");
    });

    test("registrarPago sin datos → ErrorValidacion", async () => {
        await expect(servicio.registrarPago({ id_pedido: 1 })).rejects.toThrow("Faltan datos");
    });

    test("registrarPago de un pedido inexistente → ErrorNoEncontrado", async () => {
        pedidos.obtenerPorId.mockResolvedValue(null);
        await expect(servicio.registrarPago({ id_pedido: 1, metodo_pago: "yape", monto: 1 })).rejects.toThrow(ErrorNoEncontrado);
    });

    test("anular elimina el pedido y devuelve lo pagado al saldo del cliente", async () => {
        pedidos.obtenerPorId.mockResolvedValue(new Pedido({ id: 1, idCarrito: 3, idCliente: 8, total: 100, pagos: [{ metodoPago: "yape", monto: 30 }] }));
        const r = await servicio.anular("1");
        expect(r).toEqual({ ok: true, mensaje: "Pedido eliminado correctamente", devuelto_al_saldo: 30 });
        expect(pedidos.eliminar).toHaveBeenCalledWith(1);
        expect(monedero.abonar).toHaveBeenCalledWith(8, 30);
    });

    test("anular un pedido sin pagos no toca el saldo", async () => {
        pedidos.obtenerPorId.mockResolvedValue(new Pedido({ id: 1, idCarrito: 3, idCliente: 8, total: 100 }));
        await servicio.anular(1);
        expect(monedero.abonar).not.toHaveBeenCalled();
    });

    test("deudaDeCarrito exige id_carrito", async () => {
        await expect(servicio.deudaDeCarrito()).rejects.toThrow(ErrorValidacion);
    });

    test("listarDeudas devuelve [] si la consulta falla", async () => {
        jest.spyOn(console, "error").mockImplementation(() => {});
        pedidos.listarResumenPorCliente.mockRejectedValue(new Error("SQL"));
        await expect(servicio.listarDeudas(1)).resolves.toEqual([]);
        jest.restoreAllMocks();
    });

    test("obtenerBoleta de un pedido sin líneas → ErrorNoEncontrado", async () => {
        pedidos.obtenerLineasBoleta.mockResolvedValue([]);
        await expect(servicio.obtenerBoleta(4)).rejects.toThrow("Pedido no encontrado");
    });
});
