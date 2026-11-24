const { exigirImplementacion } = require("../../../compartido/dominio/contratos");

// Puerto: persistencia de clientes
class RepositorioClientes {
    async guardar(cliente) { exigirImplementacion("guardar"); }            // devuelve id
    async buscarPorCorreo(correo) { exigirImplementacion("buscarPorCorreo"); } // Cliente | null
    async buscarPorId(idCliente) { exigirImplementacion("buscarPorId"); }      // Cliente | null
    async listar() { exigirImplementacion("listar"); }                         // Cliente[]
    async actualizarSaldo(cliente) { exigirImplementacion("actualizarSaldo"); }
}

// Puerto: persistencia de empleados
class RepositorioEmpleados {
    async buscarPorCorreo(correo) { exigirImplementacion("buscarPorCorreo"); }
}

// Puerto: algoritmo de hash de contraseñas (bcrypt en infraestructura)
class Hasheador {
    async hashear(texto) { exigirImplementacion("hashear"); }
    async comparar(texto, hash) { exigirImplementacion("comparar"); }
}

module.exports = { RepositorioClientes, RepositorioEmpleados, Hasheador };
