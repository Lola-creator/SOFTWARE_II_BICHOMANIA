import { identidadApi } from "../infraestructura/identidadApi";
import { validarRegistro } from "../dominio/reglasRegistro";

/**
 * Caso de uso del registro de clientes.
 * No escribe en consola los datos del formulario: incluyen la contraseña.
 * Devuelve { ok, mensaje } para que la UI solo se encargue de mostrarlo.
 */
export async function registrarCliente(cliente, { api = identidadApi } = {}) {
  const errorValidacion = validarRegistro(cliente);
  if (errorValidacion) return { ok: false, mensaje: errorValidacion };

  try {
    const respuesta = await api.registrar(cliente);
    return { ok: true, mensaje: respuesta.message };
  } catch (error) {
    return { ok: false, mensaje: error.message };
  }
}
