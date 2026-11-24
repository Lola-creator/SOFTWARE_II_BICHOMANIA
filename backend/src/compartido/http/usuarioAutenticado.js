const { ErrorCredenciales, ErrorNoAutorizado } = require("../dominio/errores");
const idClienteAutenticado = (req) => {
    if (!req.usuario) throw new ErrorCredenciales("Debes iniciar sesión");
    if (req.usuario.rol !== "cliente") throw new ErrorNoAutorizado("Esta acción es solo para clientes");
    return req.usuario.id;
};

module.exports = { idClienteAutenticado };