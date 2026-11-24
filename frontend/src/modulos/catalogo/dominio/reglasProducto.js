// Límites de un producto (los mismos que aplica el backend en ReglasProducto.js)
export const MAX_NOMBRE = 100;
export const PRECIO_MAX = 99999.99;

// Devuelve el primer mensaje de error o null (mismos mensajes que las pruebas Selenium)
export function validarProducto({ nombre, precio, nuevaImagen }) {
  const nombreTexto = String(nombre ?? "");
  const precioTexto = String(precio ?? "");
  if (nombreTexto === "" || precioTexto === "") return "Falta llenar campos obligatorios";
  if (nombreTexto.trim() === "") return "El nombre no puede contener solo espacios";
  if (nombreTexto.trim().length > MAX_NOMBRE) return `El nombre no puede superar ${MAX_NOMBRE} caracteres`;
  const valor = Number(precioTexto);
  if (Number.isNaN(valor) || valor <= 0) return "El precio debe ser mayor que 0";
  if (valor > PRECIO_MAX) return `El precio no puede superar ${PRECIO_MAX}`;
  if (nuevaImagen && !nuevaImagen.type.startsWith("image/")) return "El archivo debe ser una imagen";
  return null;
}

const CAMPOS_OPCIONALES = ["id_categoria", "id_competencia", "id_marca", "id_equipo"];

// Arma el FormData que espera PUT /productos/editar/:id (solo envía campos con valor)
export function construirFormularioProducto(producto) {
  const form = new FormData();
  form.append("nombre", String(producto.nombre).trim());
  form.append("precio", String(producto.precio));
  if (producto.caracteristica?.trim()) form.append("caracteristica", producto.caracteristica);
  CAMPOS_OPCIONALES.filter((campo) => producto[campo]).forEach((campo) => form.append(campo, producto[campo]));
  if (producto.nuevaImagen) form.append("imagen", producto.nuevaImagen);
  return form;
}