const RepositorioUbicaciones = require("../../dominio/RepositorioUbicaciones");

class UbicacionRepositoryMySQL extends RepositorioUbicaciones {
    constructor(conexion) {
        super();
        this.conexion = conexion;
    }

    async listarPaises() {
        const [filas] = await this.conexion.query("SELECT id_pais, nombre FROM paises");
        return filas;
    }

    async guardarPais(pais) {
        if (pais.id) {
            const [r] = await this.conexion.query("UPDATE paises SET nombre = ? WHERE id_pais = ?", [pais.nombre, pais.id]);
            return r.affectedRows;
        }
        const [r] = await this.conexion.query("INSERT INTO paises (nombre) VALUES (?)", [pais.nombre]);
        return r.insertId;
    }

    async listarCiudades(idPais) {
        const [filas] = await this.conexion.query("SELECT id_ciudad, nombre FROM ciudades WHERE id_pais = ?", [idPais]);
        return filas;
    }

    async guardarCiudad(ciudad) {
        if (ciudad.id) {
            const [r] = await this.conexion.query(
                "UPDATE ciudades SET nombre = ?, id_pais = ? WHERE id_ciudad = ?", [ciudad.nombre, ciudad.idPais, ciudad.id]);
            return r.affectedRows;
        }
        const [r] = await this.conexion.query("INSERT INTO ciudades (nombre, id_pais) VALUES (?, ?)", [ciudad.nombre, ciudad.idPais]);
        return r.insertId;
    }

    async listarDirecciones(idCliente) {
        const [filas] = await this.conexion.query(`
            SELECT d.id_direccion, d.calle, d.distrito, d.referencia, d.codigo_postal,
                   c.nombre AS ciudad, p.nombre
            FROM direcciones d
            JOIN ciudades c ON d.id_ciudad = c.id_ciudad
            JOIN paises p ON c.id_pais = p.id_pais
            WHERE d.id_cliente = ?`, [idCliente]);
        return filas;
    }

    async guardarDireccion(d) {
        const [r] = await this.conexion.query(`
            INSERT INTO direcciones (distrito, calle, referencia, codigo_postal, id_cliente, id_ciudad)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [d.distrito, d.calle, d.referencia, d.codigoPostal, d.idCliente, d.idCiudad]);
        return r.insertId;
    }
}

module.exports = UbicacionRepositoryMySQL;
