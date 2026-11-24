const { ErrorValidacion } = require("../../../compartido/dominio/errores");
const { textoOpcional } = require("../../../compartido/dominio/validaciones");

/**
 * Datos de referencia que clasifican los productos: categorías, marcas, equipos y competencias.
 * Todas comparten la misma forma; marcas y equipos además necesitan un país.
 */
const TIPOS = Object.freeze({
    categorias:   { requierePais: false, faltante: "Falta el nombre.",     agregado: "Categoría agregada",   eliminado: "Categoría eliminada",   noEncontrado: "Categoría no encontrada" },
    marcas:       { requierePais: true,  faltante: "Falta nombre o país.", agregado: "Marca agregada",       eliminado: "Marca eliminada",       noEncontrado: "Marca no encontrada" },
    equipos:      { requierePais: true,  faltante: "Falta nombre o país.", agregado: "Equipo agregado",      eliminado: "Equipo eliminado",      noEncontrado: "Equipo no encontrado" },
    competencias: { requierePais: false, faltante: "Falta nombre.",        agregado: "Competencia agregada", eliminado: "Competencia eliminada", noEncontrado: "Competencia no encontrada" },
});

const definicionDe = (tipo) => {
    const definicion = TIPOS[tipo];
    if (!definicion) throw new ErrorValidacion(`Tipo de clasificación desconocido: ${tipo}`);
    return definicion;
};

class Clasificacion {
    constructor({ id = null, tipo, nombre, pais = null }) {
        const definicion = definicionDe(tipo);
        const nombreLimpio = textoOpcional(nombre);
        const paisLimpio = textoOpcional(pais);
        if (!nombreLimpio || (definicion.requierePais && !paisLimpio)) {
            throw new ErrorValidacion(definicion.faltante);
        }
        this.id = id;
        this.tipo = tipo;
        this.nombre = nombreLimpio;
        this.pais = definicion.requierePais ? paisLimpio : null;
    }
}

Clasificacion.TIPOS = TIPOS;
Clasificacion.definicionDe = definicionDe;

module.exports = Clasificacion;
