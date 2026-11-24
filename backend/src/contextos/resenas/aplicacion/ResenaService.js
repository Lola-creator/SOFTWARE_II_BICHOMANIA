const Resena = require("../dominio/Resena");
const { ErrorNoEncontrado } = require("../../../compartido/dominio/errores");
const { validarIdentificador } = require("../../../compartido/dominio/validaciones");
const ejecutar = require("../../../compartido/aplicacion/ejecutarPersistencia");

class ResenaService {
    constructor(repositorio, obtenerFechaActual = () => new Date()) {
        this.repositorio = repositorio;
        this.obtenerFechaActual = obtenerFechaActual;
    }

    async crear({ calificacion, puntuacion, id_cliente, id_producto } = {}) {
        const resena = Resena.escribir({
            calificacion, puntuacion, idCliente: id_cliente, idProducto: id_producto, hoy: this.obtenerFechaActual(),
        });
        const id = await ejecutar(() => this.repositorio.guardar(resena), "Error creando reseña");
        return { mensaje: "Reseña creada", id_resena: id };
    }

    listarPorProducto(idProducto) {
        validarIdentificador(idProducto, "producto");
        return ejecutar(() => this.repositorio.listarPorProducto(idProducto), "Error obteniendo reseñas");
    }

    async editar(idResena, { calificacion, puntuacion, id_cliente } = {}) {
        const resena = await this.#obtener(idResena);
        resena.editar(id_cliente, { calificacion, puntuacion });
        await ejecutar(() => this.repositorio.actualizar(resena), "Error actualizando reseña");
        return { mensaje: "Reseña actualizada" };
    }

    async eliminar(idResena, idCliente) {
        const resena = await this.#obtener(idResena);
        resena.verificarAutor(idCliente, "eliminar");
        await ejecutar(() => this.repositorio.eliminar(resena.id), "Error eliminando reseña");
        return { mensaje: "Reseña eliminada" };
    }

    async #obtener(idResena) {
        validarIdentificador(idResena, "reseña");
        const resena = await ejecutar(() => this.repositorio.buscarPorId(idResena), "Error obteniendo reseña");
        if (!resena) throw new ErrorNoEncontrado("Reseña no encontrada");
        return resena;
    }
}

module.exports = ResenaService;
