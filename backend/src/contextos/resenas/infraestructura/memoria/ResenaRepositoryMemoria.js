const RepositorioResenas = require("../../dominio/RepositorioResenas");
const Resena = require("../../dominio/Resena");
const { mismoId } = require("../../../../compartido/infraestructura/memoria/BaseDatosMemoria");

class ResenaRepositoryMemoria extends RepositorioResenas {
    constructor(bd) { super(); this.bd = bd; }

    async guardar(r) {
        return this.bd.insertar("resena", "id_resena", {
            calificacion: r.calificacion, fecha: r.fecha, puntuacion: r.puntuacion,
            id_cliente: Number(r.idCliente), id_producto: Number(r.idProducto),
        });
    }

    async actualizar(r) {
        this.bd.actualizar("resena", (f) => mismoId(f.id_resena, r.id), { calificacion: r.calificacion, puntuacion: r.puntuacion });
    }

    async buscarPorId(id) {
        const f = this.bd.primero("resena", (fila) => mismoId(fila.id_resena, id));
        return f ? new Resena({
            id: f.id_resena, calificacion: f.calificacion, puntuacion: f.puntuacion,
            fecha: f.fecha, idCliente: f.id_cliente, idProducto: f.id_producto,
        }) : null;
    }

    async eliminar(id) {
        this.bd.eliminar("resena", (f) => mismoId(f.id_resena, id));
    }

    async listarPorProducto(idProducto) {
        return this.bd.buscar("resena", (f) => mismoId(f.id_producto, idProducto))
            .map((f) => ({
                ...f,
                cliente_nombre: this.bd.primero("clientes", (c) => mismoId(c.id_cliente, f.id_cliente))?.nombre ?? null,
            }))
            .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
    }
}

module.exports = ResenaRepositoryMemoria;
