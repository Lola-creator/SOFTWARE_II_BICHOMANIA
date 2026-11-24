const { RepositorioClientes, RepositorioEmpleados } = require("../../dominio/puertos");
const Cliente = require("../../dominio/Cliente");
const Empleado = require("../../dominio/Empleado");
const { mismoId } = require("../../../../compartido/infraestructura/memoria/BaseDatosMemoria");

const aCliente = (f) => new Cliente({
    id: f.id_cliente, nombre: f.nombre, apellidoPaterno: f.apellido_paterno,
    apellidoMaterno: f.apellido_materno, telefono: f.telefono, correo: f.correo_electronico,
    dni: f.dni, contrasenaHash: f.contrasena, saldo: f.saldo,
});

class ClienteRepositoryMemoria extends RepositorioClientes {
    constructor(bd) { super(); this.bd = bd; }

    async guardar(c) {
        return this.bd.insertar("clientes", "id_cliente", {
            nombre: c.nombre, apellido_paterno: c.apellidoPaterno, apellido_materno: c.apellidoMaterno,
            telefono: c.telefono, correo_electronico: c.correo.valor, dni: c.dni,
            contrasena: c.contrasenaHash, saldo: c.saldo,
        });
    }

    async buscarPorCorreo(correo) {
        const fila = this.bd.primero("clientes", (f) => f.correo_electronico === correo.valor);
        return fila ? aCliente(fila) : null;
    }

    async buscarPorId(id) {
        const fila = this.bd.primero("clientes", (f) => mismoId(f.id_cliente, id));
        return fila ? aCliente(fila) : null;
    }

    async listar() {
        return this.bd.tabla("clientes").map(aCliente);
    }

    async actualizarSaldo(c) {
        this.bd.actualizar("clientes", (f) => mismoId(f.id_cliente, c.id), { saldo: c.saldo });
    }
}

class EmpleadoRepositoryMemoria extends RepositorioEmpleados {
    constructor(bd) { super(); this.bd = bd; }

    async buscarPorCorreo(correo) {
        const f = this.bd.primero("empleados", (e) => e.correo_electronico === correo.valor);
        return f ? new Empleado({
            id: f.id_empleado, nombre: f.nombre, correo: f.correo_electronico,
            cargo: f.cargo, contrasenaHash: f.contrasena,
        }) : null;
    }
}

module.exports = { ClienteRepositoryMemoria, EmpleadoRepositoryMemoria };
