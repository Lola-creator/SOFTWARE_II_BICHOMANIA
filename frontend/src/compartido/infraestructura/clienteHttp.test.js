import { pedir, descargar, ErrorApi } from "./clienteHttp";
import { sesion } from "./sesion";

const respuesta = (estado, cuerpo) => ({
  ok: estado >= 200 && estado < 300,
  status: estado,
  text: () => Promise.resolve(cuerpo === undefined ? "" : JSON.stringify(cuerpo)),
  blob: () => Promise.resolve("BLOB-PDF"),
});

describe("clienteHttp con autenticación por token", () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn().mockResolvedValue(respuesta(200, { ok: true }));
  });

  const cabecerasEnviadas = () => global.fetch.mock.calls[0][1].headers || {};

  test("envía Authorization: Bearer <token> cuando hay sesión", async () => {
    sesion.iniciarCliente({ id: 5, rol: "cliente" }, "TOKEN-CLIENTE");

    await pedir("/carrito");

    expect(cabecerasEnviadas().Authorization).toBe("Bearer TOKEN-CLIENTE");
  });

  test("conserva el Content-Type JSON junto al token", async () => {
    sesion.iniciarCliente({ id: 5, rol: "cliente" }, "TOKEN-CLIENTE");

    await pedir("/resenas", { metodo: "POST", cuerpo: { texto: "hola" } });

    expect(cabecerasEnviadas()).toEqual({ "Content-Type": "application/json", Authorization: "Bearer TOKEN-CLIENTE" });
  });

  test("también envía el token al subir formularios (FormData)", async () => {
    sesion.iniciarEmpleado({ id: 1, rol: "empleado" }, "TOKEN-EMPLEADO");

    await pedir("/productos/agregar", { metodo: "POST", formulario: "FORMDATA" });

    expect(cabecerasEnviadas()).toEqual({ Authorization: "Bearer TOKEN-EMPLEADO" });
  });

  test("no envía Authorization si no hay sesión", async () => {
    await pedir("/productos");

    expect(cabecerasEnviadas().Authorization).toBeUndefined();
  });

  test("si el backend responde 401 cierra la sesión local y lanza ErrorApi", async () => {
    sesion.iniciarCliente({ id: 5, rol: "cliente" }, "TOKEN-VENCIDO");
    global.fetch.mockResolvedValue(respuesta(401, { error: "Token inválido o expirado" }));

    await expect(pedir("/carrito")).rejects.toThrow(ErrorApi);
    expect(sesion.token()).toBeNull();
  });

  test("descargar pide el archivo con el token y devuelve un Blob", async () => {
    sesion.iniciarCliente({ id: 5, rol: "cliente" }, "TOKEN-CLIENTE");

    const archivo = await descargar("/boleta/4");

    expect(archivo).toBe("BLOB-PDF");
    expect(cabecerasEnviadas().Authorization).toBe("Bearer TOKEN-CLIENTE");
  });
});
