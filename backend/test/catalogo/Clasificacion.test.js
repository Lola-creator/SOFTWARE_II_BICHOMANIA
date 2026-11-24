const Clasificacion = require("../../src/contextos/catalogo/dominio/Clasificacion");
const ClasificacionService = require("../../src/contextos/catalogo/aplicacion/ClasificacionService");
const { ErrorNoEncontrado } = require("../../src/compartido/dominio/errores");

describe("Clasificacion", () => {
    test("marcas y equipos exigen país", () => {
        expect(() => new Clasificacion({ tipo: "marcas", nombre: "Nike" })).toThrow("Falta nombre o país.");
        expect(new Clasificacion({ tipo: "equipos", nombre: "Alianza", pais: "Perú" }).pais).toBe("Perú");
    });

    test("categorías no guardan país", () => {
        expect(new Clasificacion({ tipo: "categorias", nombre: "Camisetas", pais: "X" }).pais).toBeNull();
        expect(() => new Clasificacion({ tipo: "categorias", nombre: " " })).toThrow("Falta el nombre.");
    });

    test("tipo desconocido", () => {
        expect(() => new Clasificacion({ tipo: "colores", nombre: "Rojo" })).toThrow("desconocido");
    });
});

describe("ClasificacionService", () => {
    let repo, servicio;
    beforeEach(() => {
        repo = { listar: jest.fn(), agregar: jest.fn(), eliminar: jest.fn() };
        servicio = new ClasificacionService(repo);
    });

    test("listarTodas agrupa las cuatro listas", async () => {
        repo.listar.mockImplementation(async (tipo) => [{ tipo }]);
        const listas = await servicio.listarTodas();
        expect(Object.keys(listas).sort()).toEqual(["categorias", "competencias", "equipos", "marcas"]);
        expect(listas.marcas).toEqual([{ tipo: "marcas" }]);
    });

    test("agregar devuelve el mensaje del tipo", async () => {
        repo.agregar.mockResolvedValue(4);
        await expect(servicio.agregar("equipos", { nombre: "U", pais: "Perú" })).resolves.toEqual({ message: "Equipo agregado", id: 4 });
    });

    test("eliminar algo inexistente → ErrorNoEncontrado con el mensaje del tipo", async () => {
        repo.eliminar.mockResolvedValue(0);
        await expect(servicio.eliminar("marcas", "3")).rejects.toThrow(ErrorNoEncontrado);
        await expect(servicio.eliminar("marcas", "3")).rejects.toThrow("Marca no encontrada");
    });
});
