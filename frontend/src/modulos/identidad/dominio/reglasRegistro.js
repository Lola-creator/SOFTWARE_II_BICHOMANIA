// Reglas del formulario de registro (las mismas que valida el backend, más la de @gmail.com).
// Devuelve el primer mensaje de error o null si todo está bien.
export function validarRegistro({ correo_electronico, dni, telefono, contrasena }) {
  if (!correo_electronico.endsWith("@gmail.com")) return "El correo debe terminar en @gmail.com";
  if (!/^\d{8}$/.test(dni)) return "El DNI debe tener exactamente 8 números";
  if (!/^\d{9}$/.test(telefono)) return "El teléfono debe tener exactamente 9 números";
  if (!/^(?=.*[A-Z]).{8,12}$/.test(contrasena)) {
    return "La contraseña debe tener mínimo 8 caracteres y al menos una mayúscula";
  }
  return null;
}
