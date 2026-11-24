const { RepositorioClientes } = require("../../dominio/puertos");
const Cliente = require("../../dominio/Cliente");

const COLUMNAS = `id_cliente, nombre, apellido_paterno, apellido_materno, telefono,
                  correo_electronico, dni, contrasena, saldo`;

const aCliente = (fila) => new Cliente({
    id: fila.id_cliente,
    nombre: fila.nombre,
    apellidoPaterno: fila.apellido_paterno,
    apellidoMaterno: fila.apellido_materno,
    telefono: fila.telefono,
    correo: fila.correo_electronico,
    dni: fila.dni,
    contrasenaHash: fila.contrasena,
    saldo: fila.saldo,
});

class ClienteRepositoryMySQL extends RepositorioClientes {
    constructor(conexion) {
        super();
        this.conexion = conexion;
    }

    async guardar(cliente) {
        const [resultado] = await this.conexion.query(
            `INSERT INTO clientes (nombre, apellido_paterno, telefono, correo_electronico, dni, contrasena)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [cliente.nombre, cliente.apellidoPaterno, cliente.telefono,
             cliente.correo.valor, cliente.dni, cliente.contrasenaHash],
        );
        return resultado.insertId;
    }

    async buscarPorCorreo(correo) {
        const [filas] = await this.conexion.query(
            `SELECT ${COLUMNAS} FROM clientes WHERE correo_electronico = ? LIMIT 1`, [correo.valor],
        );
        return filas.length ? aCliente(filas[0]) : null;
    }

    async buscarPorId(idCliente) {
        const [filas] = await this.conexion.query(
            `SELECT ${COLUMNAS} FROM clientes WHERE id_cliente = ? LIMIT 1`, [idCliente],
        );
        return filas.length ? aCliente(filas[0]) : null;
    }

    async listar() {
        const [filas] = await this.conexion.query(`SELECT ${COLUMNAS} FROM clientes`);
        return filas.map(aCliente);
    }

    async actualizarSaldo(cliente) {
        await this.conexion.query("UPDATE clientes SET saldo = ? WHERE id_cliente = ?", [cliente.saldo, cliente.id]);
    }
}

module.exports = ClienteRepositoryMySQL;
