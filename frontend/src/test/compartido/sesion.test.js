import { sesion } from "../../compartido/infraestructura/sesion";
import { crearToken, crearTokenExpirado } from "../apoyo/crearToken";

const CLIENTE = { id: 5, nombre: "Ana", rol: "cliente" };
const EMPLEADO = { id: 2, nombre: "Luis", cargo: "Ventas", rol: "empleado" };

describe("sesion leida desde el token", () => {
  beforeEach(() => localStorage.clear());

  test("el rol y el id del cliente salen del payload del token", () => {
    sesion.iniciarCliente(CLIENTE, crearToken(CLIENTE));

    const rol = sesion.rol();

    expect(rol).toBe("cliente");
    expect(sesion.esCliente()).toBe(true);
    expect(sesion.idCliente()).toBe("5");
    expect(sesion.idEmpleado()).toBeNull();
  });

  test("el rol y el id del empleado salen del payload del token", () => {
    sesion.iniciarEmpleado(EMPLEADO, crearToken(EMPLEADO));

    const esEmpleado = sesion.esEmpleado();

    expect(esEmpleado).toBe(true);
    expect(sesion.idEmpleado()).toBe("2");
    expect(sesion.idCliente()).toBeNull();
  });

  test("cambiar la clave rol en localStorage no convierte a un cliente en empleado", () => {
    sesion.iniciarCliente(CLIENTE, crearToken(CLIENTE));

    localStorage.setItem("rol", "empleado");

    expect(sesion.esEmpleado()).toBe(false);
    expect(sesion.rol()).toBe("cliente");
  });

  test("cambiar los ids en localStorage no cambia el usuario de la sesion", () => {
    sesion.iniciarCliente(CLIENTE, crearToken(CLIENTE));

    localStorage.setItem("id_usuario", "99");
    localStorage.setItem("id_empleado", "1");

    expect(sesion.idCliente()).toBe("5");
    expect(sesion.idEmpleado()).toBeNull();
  });

  test("sin token la sesion esta cerrada aunque exista la clave rol", () => {
    localStorage.setItem("rol", "empleado");
    localStorage.setItem("id_empleado", "1");

    const rol = sesion.rol();

    expect(rol).toBeNull();
    expect(sesion.esEmpleado()).toBe(false);
    expect(sesion.idEmpleado()).toBeNull();
  });

  test.each(["abc", "a.b", "a.no-es-json.c", "a.b.c.d"])("un token mal formado cierra la sesion (%p)", (token) => {
    localStorage.setItem("token", token);

    const rol = sesion.rol();

    expect(rol).toBeNull();
    expect(sesion.idCliente()).toBeNull();
  });

  test("un token expirado cierra la sesion", () => {
    sesion.iniciarEmpleado(EMPLEADO, crearTokenExpirado(EMPLEADO));

    const esEmpleado = sesion.esEmpleado();

    expect(esEmpleado).toBe(false);
    expect(sesion.rol()).toBeNull();
  });

  test("lee bien un payload con tildes en el nombre", () => {
    const cliente = { ...CLIENTE, nombre: "José Núñez" };
    sesion.iniciarCliente(cliente, crearToken(cliente));

    const rol = sesion.rol();

    expect(rol).toBe("cliente");
  });
});
