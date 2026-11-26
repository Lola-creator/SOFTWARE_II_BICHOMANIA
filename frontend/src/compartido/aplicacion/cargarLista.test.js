import { cargarLista } from "./cargarLista";

describe("cargarLista (no ocultar errores de carga)", () => {
  test("devuelve los datos y ningún error cuando la carga funciona", async () => {
    const obtener = jest.fn().mockResolvedValue([{ id_ciudad: 1 }]);

    const resultado = await cargarLista(obtener, "No se pudieron cargar las ciudades");

    expect(resultado).toEqual({ datos: [{ id_ciudad: 1 }], error: null });
  });

  test("si el backend no devuelve una lista, entrega una lista vacía", async () => {
    const resultado = await cargarLista(jest.fn().mockResolvedValue({ mensaje: "raro" }), "x");

    expect(resultado.datos).toEqual([]);
  });

  test("si la carga falla, devuelve un mensaje de error visible con la causa", async () => {
    const obtener = jest.fn().mockRejectedValue(new Error("Error 500"));

    const resultado = await cargarLista(obtener, "No se pudieron cargar las ciudades");

    expect(resultado.datos).toEqual([]);
    expect(resultado.error).toBe("No se pudieron cargar las ciudades (Error 500)");
  });

  test("no se traga el error: siempre informa algo aunque la causa no tenga mensaje", async () => {
    const resultado = await cargarLista(jest.fn().mockRejectedValue(new Error("")), "No se pudieron cargar los países");

    expect(resultado.error).toBe("No se pudieron cargar los países");
  });
});
