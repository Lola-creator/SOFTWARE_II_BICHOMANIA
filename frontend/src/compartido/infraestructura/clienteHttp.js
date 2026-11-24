// Único punto que sabe dónde está el backend y cómo hablar HTTP con él.
export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

export class ErrorApi extends Error {
  constructor(mensaje, estado, datos) {
    super(mensaje);
    this.name = "ErrorApi";
    this.estado = estado;
    this.datos = datos;
  }
}

const leerCuerpo = async (respuesta) => {
  const texto = await respuesta.text();
  if (!texto) return null;
  try {
    return JSON.parse(texto);
  } catch {
    return texto;
  }
};

const mensajeDe = (datos, estado) => {
  if (typeof datos === "string" && datos) return datos;
  return datos?.error || datos?.message || datos?.mensaje || `Error ${estado}`;
};

/**
 * Hace una petición al backend y devuelve el cuerpo ya interpretado (JSON o texto).
 * Si el servidor responde con error lanza ErrorApi con el mensaje del backend.
 */
export async function pedir(ruta, { metodo = "GET", cuerpo, formulario } = {}) {
  const opciones = { method: metodo };
  if (formulario) {
    opciones.body = formulario; // FormData: el navegador pone el Content-Type
  } else if (cuerpo !== undefined) {
    opciones.headers = { "Content-Type": "application/json" };
    opciones.body = JSON.stringify(cuerpo);
  }
  const respuesta = await fetch(`${API_URL}${ruta}`, opciones);
  const datos = await leerCuerpo(respuesta);
  if (!respuesta.ok) throw new ErrorApi(mensajeDe(datos, respuesta.status), respuesta.status, datos);
  return datos;
}

export const consulta = (parametros) => {
  const limpios = Object.fromEntries(
    Object.entries(parametros || {}).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  );
  const texto = new URLSearchParams(limpios).toString();
  return texto ? `?${texto}` : "";
};

// Para descargas (p. ej. la boleta en PDF)
export const urlDe = (ruta) => `${API_URL}${ruta}`;
