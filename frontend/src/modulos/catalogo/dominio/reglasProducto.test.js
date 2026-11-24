// Tarea 15 – Reducir complejidad de EditarProducto.js (SonarQube S3776)
// Los mensajes son los mismos que muestra hoy EditarProducto.js (los verifican las pruebas Selenium)
import { validarProducto, construirFormularioProducto, MAX_NOMBRE, PRECIO_MAX } from "./reglasProducto";

const valido = { nombre: "Balón Adidas", precio: "120" };

describe("validarProducto", () => {
  test("un producto válido no tiene errores", () => {
    expect(validarProducto(valido)).toBeNull();
  });

  test.each([
    [{ nombre: "" }, "Falta llenar campos obligatorios"],
    [{ precio: "" }, "Falta llenar campos obligatorios"],
    [{ nombre: "    " }, "El nombre no puede contener solo espacios"],
    [{ nombre: "x".repeat(MAX_NOMBRE + 1) }, `El nombre no puede superar ${MAX_NOMBRE} caracteres`],
    [{ precio: "abc" }, "El precio debe ser mayor que 0"],
    [{ precio: "0" }, "El precio debe ser mayor que 0"],
    [{ precio: String(PRECIO_MAX + 1) }, `El precio no puede superar ${PRECIO_MAX}`],
    [{ nuevaImagen: { type: "application/pdf" } }, "El archivo debe ser una imagen"],
  ])("rechaza %p", (cambio, mensaje) => {
    expect(validarProducto({ ...valido, ...cambio })).toBe(mensaje);
  });

  test("acepta una imagen nueva válida", () => {
    expect(validarProducto({ ...valido, nuevaImagen: { type: "image/png" } })).toBeNull();
  });
});

describe("construirFormularioProducto", () => {
  test("envía el nombre sin espacios y solo los campos con valor", () => {
    // Arrange
    const producto = { nombre: "  Balón  ", precio: "120", caracteristica: "  ", id_categoria: 2, id_marca: "" };
    // Act
    const form = construirFormularioProducto(producto);
    // Assert
    expect(form.get("nombre")).toBe("Balón");
    expect(form.get("precio")).toBe("120");
    expect(form.get("id_categoria")).toBe("2");
    expect(form.has("caracteristica")).toBe(false);
    expect(form.has("id_marca")).toBe(false);
    expect(form.has("imagen")).toBe(false);
  });
});