const RepositorioResenas = require("../../dominio/RepositorioResenas");
const Resena = require("../../dominio/Resena");

class ResenaRepositoryMySQL extends RepositorioResenas {
    constructor(conexion) {
        super();
        this.conexion = conexion;
    }

    async guardar(r) {
        const [res] = await this.conexion.query(
            `INSERT INTO resena (calificacion, fecha, puntuacion, id_cliente, id_producto) VALUES (?, ?, ?, ?, ?)`,
            [r.calificacion, r.fecha, r.puntuacion, r.idCliente, r.idProducto]);
        return res.insertId;
    }

    async actualizar(r) {
        await this.conexion.query(
            "UPDATE resena SET calificacion = ?, puntuacion = ? WHERE id_resena = ?",
            [r.calificacion, r.puntuacion, r.id]);
    }

    async buscarPorId(idResena) {
        const [filas] = await this.conexion.query("SELECT * FROM resena WHERE id_resena = ?", [idResena]);
        if (!filas.length) return null;
        const f = filas[0];
        return new Resena({
            id: f.id_resena, calificacion: f.calificacion, puntuacion: f.puntuacion,
            fecha: f.fecha, idCliente: f.id_cliente, idProducto: f.id_producto,
        });
    }

    async eliminar(idResena) {
        await this.conexion.query("DELETE FROM resena WHERE id_resena = ?", [idResena]);
    }

    async listarPorProducto(idProducto) {
        const [filas] = await this.conexion.query(`
            SELECT r.*, c.nombre AS cliente_nombre
            FROM resena r
            LEFT JOIN clientes c ON r.id_cliente = c.id_cliente
            WHERE r.id_producto = ?
            ORDER BY r.fecha DESC`, [idProducto]);
        return filas;
    }
}

module.exports = ResenaRepositoryMySQL;
