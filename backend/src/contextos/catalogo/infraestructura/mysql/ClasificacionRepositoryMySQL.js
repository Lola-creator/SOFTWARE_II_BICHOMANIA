const RepositorioClasificaciones = require("../../dominio/RepositorioClasificaciones");

// Cómo se guarda cada tipo de clasificación en las tablas actuales
const TABLAS = {
    categorias:   { tabla: "categoria",    id: "id_categoria" },
    marcas:       { tabla: "marcas",       id: "id_marca" },
    equipos:      { tabla: "equipos",      id: "id_equipo" },
    competencias: { tabla: "competencias", id: "id_competencia" },
};

class ClasificacionRepositoryMySQL extends RepositorioClasificaciones {
    constructor(conexion) {
        super();
        this.conexion = conexion;
    }

    async listar(tipo) {
        const [filas] = await this.conexion.query(`SELECT * FROM ${TABLAS[tipo].tabla}`);
        return filas;
    }

    async agregar(clasificacion) {
        const { tabla } = TABLAS[clasificacion.tipo];
        const [resultado] = clasificacion.pais
            ? await this.conexion.query(`INSERT INTO ${tabla} (nombre, pais) VALUES (?, ?)`, [clasificacion.nombre, clasificacion.pais])
            : await this.conexion.query(`INSERT INTO ${tabla} (nombre) VALUES (?)`, [clasificacion.nombre]);
        return resultado.insertId;
    }

    async eliminar(tipo, id) {
        const { tabla, id: columna } = TABLAS[tipo];
        const [resultado] = await this.conexion.query(`DELETE FROM ${tabla} WHERE ${columna} = ?`, [id]);
        return resultado.affectedRows;
    }
}

ClasificacionRepositoryMySQL.TABLAS = TABLAS;

module.exports = ClasificacionRepositoryMySQL;
