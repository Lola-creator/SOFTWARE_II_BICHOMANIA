
const { crearContenedor } = require("../../src/arranque/contenedor");
const { crearPersistenciaMemoria, sembrarDatosDemo } = require("../../src/arranque/persistenciaMemoria");

const hasheadorFalso = { hashear: async (t) => `h:${t}`, comparar: async (t, h) => h === `h:${t}` };

describe("Flujo de compra con persistencia en memoria", () => {
    let c;
    beforeEach(async () => {
        const persistencia = crearPersistenciaMemoria();
        await sembrarDatosDemo(persistencia.bd, hasheadorFalso);
        c = crearContenedor({ persistencia, hasheador: hasheadorFalso });
    });

    test("registro → login → carrito → pedido → pagos → anulación", async () => {
        const { id_cliente } = await c.identidadService.registrarCliente({
            nombre: "Ana", apellido_paterno: "Pérez", telefono: "987654321",
            correo_electronico: "ana@gmail.com", dni: "12345678", contrasena: "Secreta123",
        });
        const { usuario } = await c.identidadService.iniciarSesionCliente({ correo: "ana@gmail.com", password: "Secreta123" });
        expect(usuario.id).toBe(id_cliente);

        await c.carritoService.agregarProducto(String(id_cliente), 1, 2);
        const carrito = await c.carritoService.obtenerCarrito(String(id_cliente));
        expect(carrito.productos).toEqual([{ id_producto: 1, cantidad: 2, nombre: "Camiseta Alianza Lima 2026", precio: 199.9 }]);

        const { id_direccion } = await c.ubicacionService.agregarDireccion({
            distrito: "Miraflores", calle: "Av. Larco 1", referencia: "Parque", codigo_postal: "15074", id_cliente, id_ciudad: 1,
        });
        await expect(c.pedidoService.deudaDeCarrito(carrito.id_carrito)).resolves.toEqual({ deuda: 399.8 });

        const { id_pedido, nuevo_carrito } = await c.pedidoService.crearDesdeCarrito({ id_carrito: carrito.id_carrito, id_direccion });
        expect(nuevo_carrito).not.toBe(carrito.id_carrito);

        await c.pedidoService.registrarPago({ id_pedido, metodo_pago: "yape", monto: 100 });
        expect(await c.pedidoService.listarDeudas(id_cliente)).toMatchObject([{ id_pedido, total: 399.8, pagado: 100 }]);

        const anulado = await c.pedidoService.anular(id_pedido);
        expect(anulado.devuelto_al_saldo).toBe(100);
        await expect(c.identidadService.obtenerPerfil(String(id_cliente))).resolves.toMatchObject({ saldo: 100 });
    });

    test("pagar todo convierte el pedido en compra y genera boleta", async () => {
        await c.carritoService.agregarProducto("1", 1, 1);
        const { id_carrito } = await c.carritoService.obtenerCarrito("1");
        const { id_pedido } = await c.pedidoService.crearDesdeCarrito({ id_carrito, id_direccion: 1 });
        const r = await c.pedidoService.registrarPago({ id_pedido, metodo_pago: "tarjeta", monto: 199.9 });
        expect(r.deudaRestante).toBe(0);
        expect(await c.pedidoService.listarCompras(1)).toHaveLength(1);
        const boleta = await c.pedidoService.obtenerBoleta(id_pedido);
        expect(boleta.total).toBe(199.9);
        expect(boleta.productos[0].equipo).toBe("Alianza Lima");
    });

    test("encuesta: crear, votar una sola vez y ver ganadora", async () => {
        await c.encuestaService.crearEncuesta({
            fecha_inicio: "2026-11-01", fecha_fin: "2026-11-30", descripcion: "¿Qué camiseta traemos?", id_empleado: 1,
            opciones: [{ opcion_equipo: "Alianza Lima" }, { opcion_equipo: "Real Madrid" }],
        });
        const [encuesta] = await c.encuestaService.listarActivas();
        const opciones = await c.encuestaService.obtenerDetalles(encuesta.id_encuesta);
        await c.encuestaService.votar(1, encuesta.id_encuesta, opciones[1].id_detalle);
        await expect(c.encuestaService.votar(1, encuesta.id_encuesta, opciones[0].id_detalle)).rejects.toThrow("Ya votaste");
        await expect(c.encuestaService.obtenerGanadora(encuesta.id_encuesta)).resolves.toEqual({ opcion: "Real Madrid", votos: 1 });
        expect(await c.encuestaService.listarPorEmpleado("1")).toMatchObject([{ estado: "Activa" }]);
    });

    test("catálogo: filtros por categoría y detalle con nombres", async () => {
        const productos = await c.productoService.listar({ categoria: "1" });
        expect(productos).toMatchObject([{ nombre_producto: "Camiseta Alianza Lima 2026", categoria: "Camisetas", marca: "Nike" }]);
        expect(await c.productoService.listar({ categoria: "2" })).toEqual([]);
    });
});
