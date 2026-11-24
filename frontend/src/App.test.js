// Pruebas de las reglas de dominio del frontend (se corren con `npm test`)
import { validarRegistro } from "./modulos/identidad/dominio/reglasRegistro";
import { consulta } from "./compartido/infraestructura/clienteHttp";

jest.mock("./compartido/infraestructura/supabaseClient", () => ({
  supabase: { storage: { from: () => ({ getPublicUrl: (ruta) => ({ data: { publicUrl: `https://supabase/${ruta}` } }) }) } },
}));
const { urlImagenProducto, IMAGEN_POR_DEFECTO } = require("./modulos/catalogo/dominio/imagenProducto");

const registroValido = { correo_electronico: "ana@gmail.com", dni: "12345678", telefono: "987654321", contrasena: "Secreta123" };

test("un registro válido no tiene errores", () => {
  expect(validarRegistro(registroValido)).toBeNull();
});

test.each([
  [{ correo_electronico: "ana@hotmail.com" }, "@gmail.com"],
  [{ dni: "123" }, "DNI"],
  [{ telefono: "12" }, "teléfono"],
  [{ contrasena: "sinmayuscula" }, "contraseña"],
])("registro inválido %p", (cambio, mensaje) => {
  expect(validarRegistro({ ...registroValido, ...cambio })).toMatch(mensaje);
});

test("consulta ignora filtros vacíos", () => {
  expect(consulta({ categoria: "1", marca: "", nombre: null })).toBe("?categoria=1");
  expect(consulta({})).toBe("");
});

test("urlImagenProducto resuelve cada tipo de ruta", () => {
  expect(urlImagenProducto(null)).toBe(IMAGEN_POR_DEFECTO);
  expect(urlImagenProducto("https://x.com/a.png")).toBe("https://x.com/a.png");
  expect(urlImagenProducto("/uploads/1.jpg")).toMatch(/\/uploads\/1\.jpg$/);
  expect(urlImagenProducto("camisetas/a.png")).toBe("https://supabase/camisetas/a.png");
});
