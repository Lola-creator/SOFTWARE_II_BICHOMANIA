/**
 * Carga una lista desde el backend sin ocultar los errores.
 * En lugar de un catch vacío devuelve { datos, error } para que la UI muestre el problema.
 */
export async function cargarLista(obtener, mensajeError) {
  try {
    const datos = await obtener();
    return { datos: Array.isArray(datos) ? datos : [], error: null };
  } catch (causa) {
    const detalle = causa?.message ? ` (${causa.message})` : "";
    return { datos: [], error: `${mensajeError}${detalle}` };
  }
}
