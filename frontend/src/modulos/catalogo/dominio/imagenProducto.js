import { API_URL } from "../../../compartido/infraestructura/clienteHttp";
import { supabase } from "../../../compartido/infraestructura/supabaseClient";

export const IMAGEN_POR_DEFECTO = "/fallback-image.png";

/**
 * Convierte la ruta guardada de un producto en una URL que el navegador puede mostrar:
 *  - URL absoluta (http/https)        → tal cual
 *  - "/uploads/..." (subida al backend) → servida por el backend
 *  - otra ruta                         → archivo del bucket "productos" de Supabase
 */
export function urlImagenProducto(ruta) {
  if (!ruta) return IMAGEN_POR_DEFECTO;
  if (/^https?:\/\//i.test(ruta)) return ruta;
  if (ruta.startsWith("/uploads/")) return `${API_URL}${ruta}`;
  return supabase.storage.from("productos").getPublicUrl(ruta).data.publicUrl;
}
