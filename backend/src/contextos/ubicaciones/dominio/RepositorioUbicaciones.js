const { exigirImplementacion } = require("../../../compartido/dominio/contratos");

class RepositorioUbicaciones {
    async listarPaises() { exigirImplementacion("listarPaises"); }
    async guardarPais(pais) { exigirImplementacion("guardarPais"); }              // id nuevo o filas afectadas si tiene id
    async listarCiudades(idPais) { exigirImplementacion("listarCiudades"); }
    async guardarCiudad(ciudad) { exigirImplementacion("guardarCiudad"); }
    async listarDirecciones(idCliente) { exigirImplementacion("listarDirecciones"); }
    async guardarDireccion(direccion) { exigirImplementacion("guardarDireccion"); }
}

module.exports = RepositorioUbicaciones;
