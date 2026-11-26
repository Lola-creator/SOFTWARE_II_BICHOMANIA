const CLAVE_TOKEN = "token";
const CLAVES_ANTIGUAS = ["rol", "id_usuario", "id_empleado"];

const notificarCambio = () => window.dispatchEvent(new Event("storage"));

const decodificarBase64Url = (texto) => {
  const base64 = texto.replace(/-/g, "+").replace(/_/g, "/");
  const binario = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  return new TextDecoder().decode(Uint8Array.from(binario, (caracter) => caracter.charCodeAt(0)));
};

const leerCargaDelToken = (token) => {
  const partes = typeof token === "string" ? token.split(".") : [];
  if (partes.length !== 3) return null;
  try {
    const carga = JSON.parse(decodificarBase64Url(partes[1]));
    const vigente = typeof carga?.exp === "number" && carga.exp * 1000 > Date.now();
    return vigente ? carga : null;
  } catch {
    return null;
  }
};

const usuarioActual = () => leerCargaDelToken(localStorage.getItem(CLAVE_TOKEN));

const rolActual = () => usuarioActual()?.rol ?? null;

const idSiTieneRol = (rol) => {
  const usuario = usuarioActual();
  return usuario?.rol === rol && usuario.id != null ? String(usuario.id) : null;
};

const guardarToken = (token) => {
  CLAVES_ANTIGUAS.forEach((clave) => localStorage.removeItem(clave));
  localStorage.setItem(CLAVE_TOKEN, token);
  notificarCambio();
};

export const sesion = {
  rol: rolActual,
  idCliente: () => idSiTieneRol("cliente"),
  idEmpleado: () => idSiTieneRol("empleado"),
  token: () => localStorage.getItem(CLAVE_TOKEN),
  esCliente: () => rolActual() === "cliente",
  esEmpleado: () => rolActual() === "empleado",

  iniciarCliente(usuario, token) {
    guardarToken(token);
  },

  iniciarEmpleado(empleado, token) {
    guardarToken(token);
  },

  cerrar() {
    [CLAVE_TOKEN, ...CLAVES_ANTIGUAS].forEach((clave) => localStorage.removeItem(clave));
    notificarCambio();
  },
};
