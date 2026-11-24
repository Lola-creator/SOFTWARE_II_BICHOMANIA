const RepositorioProducto = require("../../dominio/RepositorioProducto");
const RepositorioClasificaciones = require("../../dominio/RepositorioClasificaciones");
const Producto = require("../../dominio/Producto");
const { TABLAS } = require("../mysql/ClasificacionRepositoryMySQL");
const { mismoId } = require("../../../../compartido/infraestructura/memoria/BaseDatosMemoria");

class ClasificacionRepositoryMemoria extends RepositorioClasificaciones {
    constructor(bd) { super(); this.bd = bd; }

    async listar(tipo) {
        return this.bd.tabla(TABLAS[tipo].tabla).map((fila) => ({ ...fila }));
    }

    async agregar(c) {
        const { tabla, id } = TABLAS[c.tipo];
        return this.bd.insertar(tabla, id, c.pais ? { nombre: c.nombre, pais: c.pais } : { nombre: c.nombre });
    }

    async eliminar(tipo, idBuscado) {
        const { tabla, id } = TABLAS[tipo];
        return this.bd.eliminar(tabla, (f) => mismoId(f[id], idBuscado));
    }
}

class ProductoRepositoryMemoria extends RepositorioProducto {
    constructor(bd) { super(); this.bd = bd; }

    async crear(p) {
        return this.bd.insertar("productos", "id_producto", this.#aFila(p));
    }

    async actualizar(p) {
        this.bd.actualizar("productos", (f) => mismoId(f.id_producto, p.id), this.#aFila(p));
    }

    async buscarPorId(id) {
        const f = this.bd.primero("productos", (fila) => mismoId(fila.id_producto, id));
        return f ? new Producto({
            id: f.id_producto, nombre: f.nombre, caracteristica: f.caracteristica, precio: f.precio,
            idCategoria: f.id_categoria, idCompetencia: f.id_competencia,
            idMarca: f.id_marca, idEquipo: f.id_equipo, imagen: f.imagen,
        }) : null;
    }

    async eliminar(id) {
        this.bd.eliminar("productos", (f) => mismoId(f.id_producto, id));
    }

    async listar({ categoria, marca, equipo, competencia, nombre } = {}) {
        return this.bd.tabla("productos")
            .filter((f) => !categoria || mismoId(f.id_categoria, categoria))
            .filter((f) => !competencia || mismoId(f.id_competencia, competencia))
            .filter((f) => !marca || mismoId(f.id_marca, marca))
            .filter((f) => !equipo || mismoId(f.id_equipo, equipo))
            .filter((f) => !nombre || f.nombre.toLowerCase().includes(String(nombre).toLowerCase()))
            .map((f) => this.#detalle(f));
    }

    async buscarDetalle(id) {
        const f = this.bd.primero("productos", (fila) => mismoId(fila.id_producto, id));
        return f ? this.#detalle(f) : null;
    }

    #aFila(p) {
        return {
            nombre: p.nombre, caracteristica: p.caracteristica, precio: p.precio,
            id_categoria: p.idCategoria, id_competencia: p.idCompetencia,
            id_marca: p.idMarca, id_equipo: p.idEquipo, imagen: p.imagen,
        };
    }

    #nombreDe(tipo, id) {
        const { tabla, id: columna } = TABLAS[tipo];
        return this.bd.primero(tabla, (f) => mismoId(f[columna], id))?.nombre ?? null;
    }

    // Misma forma que la consulta de detalle de MySQL
    #detalle(f) {
        return {
            id_producto: f.id_producto, nombre_producto: f.nombre, precio: f.precio,
            caracteristica: f.caracteristica, imagen: f.imagen,
            id_categoria: f.id_categoria, id_competencia: f.id_competencia,
            id_marca: f.id_marca ?? null, id_equipo: f.id_equipo ?? null,
            categoria: this.#nombreDe("categorias", f.id_categoria),
            competencia: this.#nombreDe("competencias", f.id_competencia),
            marca: this.#nombreDe("marcas", f.id_marca),
            equipo: this.#nombreDe("equipos", f.id_equipo),
        };
    }
}

module.exports = { ClasificacionRepositoryMemoria, ProductoRepositoryMemoria };
