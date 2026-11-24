// Errores del dominio: expresan reglas de negocio violadas, sin saber nada de HTTP.
class ErrorDominio extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = this.constructor.name;
    }
}

// Datos que no cumplen una invariante (→ 400)
class ErrorValidacion extends ErrorDominio {}

// La entidad buscada no existe (→ 404)
class ErrorNoEncontrado extends ErrorDominio {}

// Credenciales incorrectas (→ 401)
class ErrorCredenciales extends ErrorDominio {}

// El actor no puede realizar la operación sobre ese recurso (→ 403)
class ErrorNoAutorizado extends ErrorDominio {}

module.exports = {
    ErrorDominio,
    ErrorValidacion,
    ErrorNoEncontrado,
    ErrorCredenciales,
    ErrorNoAutorizado,
};
