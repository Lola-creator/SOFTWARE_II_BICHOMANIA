import { sesion } from "./sesion";

describe("sesion (token de autenticación)", () => {
  beforeEach(() => localStorage.clear());

  test("iniciarCliente guarda el token recibido del backend", () => {
    sesion.iniciarCliente({ id: 5, rol: "cliente" }, "TOKEN-CLIENTE");

    expect(sesion.token()).toBe("TOKEN-CLIENTE");
    expect(sesion.idCliente()).toBe("5");
  });

  test("iniciarEmpleado guarda el token recibido del backend", () => {
    sesion.iniciarEmpleado({ id: 1, rol: "empleado" }, "TOKEN-EMPLEADO");

    expect(sesion.token()).toBe("TOKEN-EMPLEADO");
    expect(sesion.esEmpleado()).toBe(true);
  });

  test("cerrar elimina también el token", () => {
    sesion.iniciarCliente({ id: 5, rol: "cliente" }, "TOKEN-CLIENTE");

    sesion.cerrar();

    expect(sesion.token()).toBeNull();
    expect(sesion.rol()).toBeNull();
  });
});
