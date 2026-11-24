const Resena = require("../../src/contextos/resenas/dominio/Resena");
const ResenaService = require("../../src/contextos/resenas/aplicacion/ResenaService");
const { ErrorValidacion, ErrorNoAutorizado, ErrorNoEncontrado } = require("../../src/compartido/dominio/errores");

describe("Resena", () => {
    const base = { calificacion: "Buena", puntuacion: 4, idCliente: 1, idProducto: 2 };

    test("escribir fija la fecha del día", () => {
        expect(Resena.escribir({ ...base, hoy: new Date(2026, 10, 23, 22, 0) }).fecha).toBe("2026-11-23");
    });

    test.each([0, 6, 3.5, "x"])("rechaza puntuación %p", (puntuacion) => {
        expect(() => new Resena({ ...base, puntuacion })).toThrow(ErrorValidacion);
    });

    test("solo el autor puede editar", () => {
        const r = new Resena(base);
        expect(() => r.editar(2, { calificacion: "x", puntuacion: 1 })).toThrow("No puedes editar una reseña que no es tuya");
        r.editar("1", { calificacion: "Mejor", puntuacion: 5 });
        expect(r.puntuacion).toBe(5);
    });
});

describe("ResenaService", () => {
    let repo, servicio;
    beforeEach(() => {
        repo = { guardar: jest.fn(), actualizar: jest.fn(), buscarPorId: jest.fn(), eliminar: jest.fn(), listarPorProducto: jest.fn() };
        servicio = new ResenaService(repo, () => new Date(2026, 10, 23, 22, 0));
    });

    test("crear guarda la reseña", async () => {
        repo.guardar.mockResolvedValue(5);
        await expect(servicio.crear({ calificacion: "ok", puntuacion: 3, id_cliente: 1, id_producto: 2 }))
            .resolves.toEqual({ mensaje: "Reseña creada", id_resena: 5 });
    });

    test("eliminar una reseña ajena → ErrorNoAutorizado", async () => {
        repo.buscarPorId.mockResolvedValue(new Resena({ id: 1, puntuacion: 3, idCliente: 1, idProducto: 2 }));
        await expect(servicio.eliminar(1, 99)).rejects.toThrow(ErrorNoAutorizado);
        expect(repo.eliminar).not.toHaveBeenCalled();
    });

    test("editar una reseña inexistente → ErrorNoEncontrado", async () => {
        repo.buscarPorId.mockResolvedValue(null);
        await expect(servicio.editar(1, { id_cliente: 1, puntuacion: 3 })).rejects.toThrow(ErrorNoEncontrado);
    });
});
