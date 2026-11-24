// Fecha calendario (YYYY-MM-DD) en la zona horaria del servidor, no en UTC.
// (toISOString() daría "mañana" a partir de las 7 p. m. en Lima.)
const fechaLocalISO = (fecha = new Date()) => {
    const d = new Date(fecha);
    const dosDigitos = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`;
};

module.exports = { fechaLocalISO };
