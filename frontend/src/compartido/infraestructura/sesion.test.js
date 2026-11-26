import { sesion } from "./sesion";
import { crearToken } from "../../test/apoyo/crearToken";

const TOKEN_CLIENTE = crearToken({ id: 5, rol: "cliente" });
const TOKEN_EMPLEADO = crearToken({ id: 1, rol: "empleado" });

describe("sesion (token de autenticación)", () => {
  beforeEach(() => localStorage.clear());

  test("iniciarCliente guarda el token recibido del backend", () => {
    sesion.iniciarCliente({ id: 5, rol: "cliente" }, TOKEN_CLIENTE);

    expect(sesion.token()).toBe(TOKEN_CLIENTE);
    expect(sesion.idCliente()).toBe("5");
  });

  test("iniciarEmpleado guarda el token recibido del backend", () => {
    sesion.iniciarEmpleado({ id: 1, rol: "empleado" }, TOKEN_EMPLEADO);

    expect(sesion.token()).toBe(TOKEN_EMPLEADO);
    expect(sesion.esEmpleado()).toBe(true);
  });

  test("cerrar elimina también el token", () => {
    sesion.iniciarCliente({ id: 5, rol: "cliente" }, TOKEN_CLIENTE);

    sesion.cerrar();

    expect(sesion.token()).toBeNull();
    expect(sesion.rol()).toBeNull();
  });
});
