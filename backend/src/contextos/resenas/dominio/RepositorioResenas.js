const { exigirImplementacion } = require("../../../compartido/dominio/contratos");

class RepositorioResenas {
    async guardar(resena) { exigirImplementacion("guardar"); }          // id nuevo
    async actualizar(resena) { exigirImplementacion("actualizar"); }
    async buscarPorId(idResena) { exigirImplementacion("buscarPorId"); } // Resena | null
    async eliminar(idResena) { exigirImplementacion("eliminar"); }
    async listarPorProducto(idProducto) { exigirImplementacion("listarPorProducto"); } // filas con cliente_nombre
}

module.exports = RepositorioResenas;
