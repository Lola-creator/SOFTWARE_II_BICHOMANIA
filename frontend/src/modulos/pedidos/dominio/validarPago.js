// Reglas para pagar un pedido (antes estaban copiadas en los dos MetodoPago.js)
const LARGO_NUMERO_TARJETA = 16;
const LARGO_CVV = 3;
const LARGO_MINIMO_NOMBRE = 3;
const PATRON_FECHA = /^\d{2}\/\d{2}$/;

function validarTarjeta(tarjeta = {}) {
  const errores = {};
  if ((tarjeta.numero || "").length !== LARGO_NUMERO_TARJETA) errores.numero = "Tarjeta inválida";
  if ((tarjeta.nombre || "").length < LARGO_MINIMO_NOMBRE) errores.nombre = "Nombre inválido";
  if (!(tarjeta.correo || "").includes("@")) errores.correo = "Correo inválido";
  if (!PATRON_FECHA.test(tarjeta.fecha || "")) errores.fecha = "Formato MM/YY";
  if ((tarjeta.cvv || "").length !== LARGO_CVV) errores.cvv = "CVV inválido";
  return errores;
}

function validarMonto(monto, deudaActual) {
  const valor = Number(monto);
  if (!valor || valor <= 0) return "Debe ingresar un monto válido";
  if (valor > Number(deudaActual)) return "No puedes pagar más que la deuda actual";
  return null;
}

// Devuelve un objeto { campo: mensaje }; vacío si todo es válido
export function validarPago({ monto, deudaActual, metodo, tarjeta }) {
  const errores = metodo === "tarjeta" ? validarTarjeta(tarjeta) : {};
  const errorMonto = validarMonto(monto, deudaActual);
  return errorMonto ? { monto: errorMonto, ...errores } : errores;
}