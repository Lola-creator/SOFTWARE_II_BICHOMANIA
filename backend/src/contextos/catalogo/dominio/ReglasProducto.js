const { ErrorValidacion } = require("../../../compartido/dominio/errores");

// Reglas de negocio para registrar/editar un producto del catálogo.
// (Los mensajes los verifican las pruebas de Selenium: no cambiarlos sin actualizarlas.)
const MAX_NOMBRE = 100;
const PRECIO_MAX = 99999.99;

function validarDatosProducto(datos, { nuevo }) {
  const nombre = String(datos.nombre ?? "");
  const precioTxt = String(datos.precio ?? "");

  const faltan =
    !nombre || !precioTxt ||
    (nuevo && (!datos.idCategoria || !datos.idCompetencia ||
               !datos.idMarca || !datos.idEquipo || !datos.imagen));
  if (faltan) throw new ErrorValidacion("Falta llenar campos obligatorios");

  if (nombre.trim() === "")
    throw new ErrorValidacion("El nombre no puede contener solo espacios");
  if (nombre.trim().length > MAX_NOMBRE)
    throw new ErrorValidacion(`El nombre no puede superar ${MAX_NOMBRE} caracteres`);

  const precio = Number(precioTxt);
  if (Number.isNaN(precio) || precio <= 0)
    throw new ErrorValidacion("El precio debe ser mayor que 0");
  if (precio > PRECIO_MAX)
    throw new ErrorValidacion(`El precio no puede superar ${PRECIO_MAX}`);
}

module.exports = { validarDatosProducto, MAX_NOMBRE, PRECIO_MAX };
