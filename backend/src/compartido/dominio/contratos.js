// Ayuda para declarar puertos (interfaces) en JavaScript.
// Cada repositorio del dominio es una clase cuyos métodos lanzan si no se implementan.
const exigirImplementacion = (nombreMetodo) => {
    throw new Error(`Método no implementado: ${nombreMetodo}`);
};

module.exports = { exigirImplementacion };
