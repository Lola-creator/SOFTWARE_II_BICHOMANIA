// Sesión del usuario guardada en localStorage (mismas claves que antes + token).
const CLAVES = { rol: "rol", idCliente: "id_usuario", idEmpleado: "id_empleado", token: "token" };

const notificarCambio = () => window.dispatchEvent(new Event("storage"));

export const sesion = {
  rol: () => localStorage.getItem(CLAVES.rol),
  idCliente: () => localStorage.getItem(CLAVES.idCliente),
  idEmpleado: () => localStorage.getItem(CLAVES.idEmpleado),
  token: () => localStorage.getItem(CLAVES.token),
  esCliente: () => localStorage.getItem(CLAVES.rol) === "cliente",
  esEmpleado: () => localStorage.getItem(CLAVES.rol) === "empleado",

  iniciarCliente(usuario, token) {
    localStorage.setItem(CLAVES.rol, usuario.rol);
    localStorage.setItem(CLAVES.idCliente, usuario.id);
    localStorage.setItem(CLAVES.token, token);
    notificarCambio();
  },

  iniciarEmpleado(empleado, token) {
    localStorage.setItem(CLAVES.rol, empleado.rol);
    localStorage.setItem(CLAVES.idEmpleado, empleado.id);
    localStorage.setItem(CLAVES.token, token);
    notificarCambio();
  },

  cerrar() {
    Object.values(CLAVES).forEach((clave) => localStorage.removeItem(clave));
    notificarCambio();
  },
};
