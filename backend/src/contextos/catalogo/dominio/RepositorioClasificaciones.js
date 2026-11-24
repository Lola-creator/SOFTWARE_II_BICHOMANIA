const { exigirImplementacion } = require("../../../compartido/dominio/contratos");

class RepositorioClasificaciones {
    async listar(tipo) { exigirImplementacion("listar"); }          // filas tal cual (id_xxx, nombre, ...)
    async agregar(clasificacion) { exigirImplementacion("agregar"); } // devuelve id
    async eliminar(tipo, id) { exigirImplementacion("eliminar"); }  // devuelve filas eliminadas
}

module.exports = RepositorioClasificaciones;
