// Sesión del usuario guardada en localStorage (mismas claves que antes).
const CLAVES = { rol: "rol", idCliente: "id_usuario", idEmpleado: "id_empleado" };

export const sesion = {
  rol: () => localStorage.getItem(CLAVES.rol),
  idCliente: () => localStorage.getItem(CLAVES.idCliente),
  idEmpleado: () => localStorage.getItem(CLAVES.idEmpleado),
  esCliente: () => localStorage.getItem(CLAVES.rol) === "cliente",
  esEmpleado: () => localStorage.getItem(CLAVES.rol) === "empleado",

  iniciarCliente(usuario) {
    localStorage.setItem(CLAVES.rol, usuario.rol);
    localStorage.setItem(CLAVES.idCliente, usuario.id);
    window.dispatchEvent(new Event("storage"));
  },

  iniciarEmpleado(empleado) {
    localStorage.setItem(CLAVES.rol, empleado.rol);
    localStorage.setItem(CLAVES.idEmpleado, empleado.id);
    window.dispatchEvent(new Event("storage"));
  },

  cerrar() {
    Object.values(CLAVES).forEach((clave) => localStorage.removeItem(clave));
    window.dispatchEvent(new Event("storage"));
  },
};
