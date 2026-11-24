const RepositorioEncuesta = require("../../dominio/RepositorioEncuesta");
const Encuesta = require("../../dominio/Encuesta");
const OpcionEncuesta = require("../../dominio/OpcionEncuesta");
const { mismoId } = require("../../../../compartido/infraestructura/memoria/BaseDatosMemoria");

const NOMBRE_ESTADO = { [Encuesta.ESTADOS.ACTIVA]: "Activa", [Encuesta.ESTADOS.CERRADA]: "Cerrada" };

class EncuestaRepositoryMemoria extends RepositorioEncuesta {
    constructor(bd) { super(); this.bd = bd; }

    async guardar(e) {
        const id = this.bd.insertar("encuestas", "id_encuesta", {
            fecha_inicio: e.fechaInicio, fecha_fin: e.fechaFin, descripcion: e.descripcion,
            id_empleado: Number(e.idEmpleado), id_estado: e.idEstado,
        });
        e.opciones.forEach((o) => this.bd.insertar("detalles_encuestas", "id_detalle", {
            id_encuesta: id, opcion_equipo: o.equipo, opcion_liga: o.liga, categoria: o.categoria, votos: 0,
        }));
        return id;
    }

    async obtenerPorId(id) {
        const f = this.bd.primero("encuestas", (e) => mismoId(e.id_encuesta, id));
        if (!f) return null;
        return new Encuesta({
            id: f.id_encuesta, fechaInicio: f.fecha_inicio, fechaFin: f.fecha_fin, descripcion: f.descripcion,
            idEmpleado: f.id_empleado, idEstado: f.id_estado,
            opciones: (await this.listarDetalles(id)).map((d) => new OpcionEncuesta({
                id: d.id_detalle, equipo: d.opcion_equipo, liga: d.opcion_liga, categoria: d.categoria, votos: d.votos,
            })),
        });
    }

    async eliminar(id) {
        this.bd.eliminar("votos_encuestas", (v) => mismoId(v.id_encuesta, id));
        this.bd.eliminar("detalles_encuestas", (d) => mismoId(d.id_encuesta, id));
        return this.bd.eliminar("encuestas", (e) => mismoId(e.id_encuesta, id));
    }

    async actualizarEstado(id, idEstado) {
        return this.bd.actualizar("encuestas", (e) => mismoId(e.id_encuesta, id), { id_estado: idEstado });
    }

    async listarActivas() {
        return this.bd.buscar("encuestas", (e) => e.id_estado === Encuesta.ESTADOS.ACTIVA)
            .map(({ id_encuesta, fecha_inicio, fecha_fin, descripcion }) => ({ id_encuesta, fecha_inicio, fecha_fin, descripcion }));
    }

    async listarPorEmpleado(idEmpleado) {
        return this.bd.buscar("encuestas", (e) => mismoId(e.id_empleado, idEmpleado))
            .map((e) => ({
                id_encuesta: e.id_encuesta, fecha_inicio: e.fecha_inicio, fecha_fin: e.fecha_fin,
                descripcion: e.descripcion, estado: NOMBRE_ESTADO[e.id_estado],
            }));
    }

    async listarDetalles(id) {
        return this.bd.buscar("detalles_encuestas", (d) => mismoId(d.id_encuesta, id)).map((d) => ({ ...d }));
    }

    async existeVoto(idCliente, idEncuesta) {
        return Boolean(this.bd.primero("votos_encuestas", (v) => mismoId(v.id_cliente, idCliente) && mismoId(v.id_encuesta, idEncuesta)));
    }

    async registrarVoto(idCliente, idEncuesta, idDetalle) {
        if (await this.existeVoto(idCliente, idEncuesta)) return false;
        this.bd.insertar("votos_encuestas", "id_voto", {
            fecha_voto: new Date().toISOString().slice(0, 10),
            id_cliente: Number(idCliente), id_detalle: Number(idDetalle), id_encuesta: Number(idEncuesta),
        });
        this.bd.actualizar("detalles_encuestas",
            (d) => mismoId(d.id_detalle, idDetalle) && mismoId(d.id_encuesta, idEncuesta),
            (d) => ({ votos: d.votos + 1 }));
        return true;
    }
}

module.exports = EncuestaRepositoryMemoria;
