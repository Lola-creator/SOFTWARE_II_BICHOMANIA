import { registrarCliente } from "./registrarCliente";

describe("registrarCliente (no debe exponer la contraseña)", () => {
  const CONTRASENA = "Secreta123";
  const cliente = {
    correo_electronico: "ana@gmail.com", nombre: "Ana", apellido_paterno: "Pérez",
    telefono: "987654321", dni: "12345678", contrasena: CONTRASENA,
  };
  const metodosConsola = ["log", "info", "debug", "warn", "error"];
  let espias;
  let api;

  const textoImpresoEnConsola = () =>
    espias.flatMap((espia) => espia.mock.calls).map((args) => JSON.stringify(args)).join(" ");

  beforeEach(() => {
    espias = metodosConsola.map((m) => jest.spyOn(console, m).mockImplementation(() => {}));
    api = { registrar: jest.fn().mockResolvedValue({ message: "Usuario registrado exitosamente", id_cliente: 9 }) };
  });

  afterEach(() => espias.forEach((espia) => espia.mockRestore()));

  test("envía los datos al backend y devuelve el mensaje de éxito", async () => {
    const resultado = await registrarCliente(cliente, { api });

    expect(api.registrar).toHaveBeenCalledWith(cliente);
    expect(resultado).toEqual({ ok: true, mensaje: "Usuario registrado exitosamente" });
  });

  test("no escribe la contraseña en la consola cuando el registro es exitoso", async () => {
    await registrarCliente(cliente, { api });

    expect(textoImpresoEnConsola()).not.toContain(CONTRASENA);
  });

  test("no escribe la contraseña en la consola cuando el backend falla", async () => {
    api.registrar.mockRejectedValue(new Error("El correo ya está registrado"));

    const resultado = await registrarCliente(cliente, { api });

    expect(resultado).toEqual({ ok: false, mensaje: "El correo ya está registrado" });
    expect(textoImpresoEnConsola()).not.toContain(CONTRASENA);
  });

  test("si los datos no son válidos no llama al backend", async () => {
    const resultado = await registrarCliente({ ...cliente, dni: "123" }, { api });

    expect(resultado.ok).toBe(false);
    expect(resultado.mensaje).toMatch("DNI");
    expect(api.registrar).not.toHaveBeenCalled();
  });
});
