const { RepositorioEmpleados } = require("../../dominio/puertos");
const Empleado = require("../../dominio/Empleado");

class EmpleadoRepositoryMySQL extends RepositorioEmpleados {
    constructor(conexion) {
        super();
        this.conexion = conexion;
    }

    async buscarPorCorreo(correo) {
        const [filas] = await this.conexion.query(
            "SELECT * FROM empleados WHERE correo_electronico = ? LIMIT 1", [correo.valor],
        );
        if (!filas.length) return null;
        const fila = filas[0];
        return new Empleado({
            id: fila.id_empleado,
            nombre: fila.nombre,
            correo: fila.correo_electronico,
            cargo: fila.cargo,
            contrasenaHash: fila.contrasena,
        });
    }
}

module.exports = EmpleadoRepositoryMySQL;
