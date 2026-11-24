const Clasificacion = require("../dominio/Clasificacion");
const { ErrorNoEncontrado } = require("../../../compartido/dominio/errores");
const { validarIdentificador } = require("../../../compartido/dominio/validaciones");
const ejecutar = require("../../../compartido/aplicacion/ejecutarPersistencia");

const NOMBRES_ERROR_LISTAR = {
    categorias: "Error al obtener categorías",
    marcas: "Error al obtener marcas",
    equipos: "Error al obtener equipos",
    competencias: "Error al obtener competencias",
};

class ClasificacionService {
    constructor(repositorio) {
        this.repositorio = repositorio;
    }

    listar(tipo) {
        Clasificacion.definicionDe(tipo);
        return ejecutar(() => this.repositorio.listar(tipo), NOMBRES_ERROR_LISTAR[tipo]);
    }

    // Todas las listas de una vez (para los filtros y formularios de productos)
    async listarTodas() {
        const tipos = ["categorias", "competencias", "equipos", "marcas"];
        const listas = await ejecutar(
            () => Promise.all(tipos.map((tipo) => this.repositorio.listar(tipo))),
            "Error al obtener listas",
        );
        return Object.fromEntries(tipos.map((tipo, i) => [tipo, listas[i]]));
    }

    async agregar(tipo, { nombre, pais } = {}) {
        const clasificacion = new Clasificacion({ tipo, nombre, pais });
        const id = await ejecutar(() => this.repositorio.agregar(clasificacion), "Error al guardar");
        return { message: Clasificacion.definicionDe(tipo).agregado, id };
    }

    async eliminar(tipo, id) {
        const definicion = Clasificacion.definicionDe(tipo);
        validarIdentificador(id, tipo);
        const filas = await ejecutar(() => this.repositorio.eliminar(tipo, id), "Error al eliminar");
        if (filas === 0) throw new ErrorNoEncontrado(definicion.noEncontrado);
        return { message: definicion.eliminado };
    }
}

module.exports = ClasificacionService;
