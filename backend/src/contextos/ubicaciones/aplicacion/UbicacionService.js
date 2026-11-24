const { Pais, Ciudad, Direccion } = require("../dominio/Ubicaciones");
const { ErrorValidacion, ErrorNoEncontrado } = require("../../../compartido/dominio/errores");
const { validarIdentificador } = require("../../../compartido/dominio/validaciones");
const ejecutar = require("../../../compartido/aplicacion/ejecutarPersistencia");

class UbicacionService {
    constructor(repositorio) {
        this.repositorio = repositorio;
    }

    listarPaises() {
        return ejecutar(() => this.repositorio.listarPaises(), "Error al obtener países");
    }

    async agregarPais({ nombre } = {}) {
        const id = await ejecutar(() => this.repositorio.guardarPais(new Pais({ nombre })), "Error al insertar país");
        return { message: "País insertado correctamente", id_pais: id };
    }

    async actualizarPais(id, { nombre } = {}) {
        const pais = new Pais({ nombre });
        validarIdentificador(id, "país");
        pais.id = id;
        const filas = await ejecutar(() => this.repositorio.guardarPais(pais), "Error al actualizar país");
        if (filas === 0) throw new ErrorNoEncontrado("País no encontrado");
        return { message: "País actualizado correctamente" };
    }

    listarCiudades(idPais) {
        if (!idPais) throw new ErrorValidacion("Falta el id_pais");
        return ejecutar(() => this.repositorio.listarCiudades(idPais), "Error al obtener ciudades");
    }

    async agregarCiudad({ nombre, id_pais } = {}) {
        const ciudad = new Ciudad({ nombre, idPais: id_pais });
        const id = await ejecutar(() => this.repositorio.guardarCiudad(ciudad), "Error al insertar ciudad");
        return { message: "Ciudad insertada correctamente", id_ciudad: id };
    }

    async actualizarCiudad(id, { nombre, id_pais } = {}) {
        const ciudad = new Ciudad({ nombre, idPais: id_pais });
        validarIdentificador(id, "ciudad");
        ciudad.id = id;
        const filas = await ejecutar(() => this.repositorio.guardarCiudad(ciudad), "Error al actualizar ciudad");
        if (filas === 0) throw new ErrorNoEncontrado("Ciudad no encontrada");
        return { message: "Ciudad actualizada correctamente" };
    }

    listarDirecciones(idCliente) {
        if (!idCliente) throw new ErrorValidacion("Falta id_cliente");
        return ejecutar(() => this.repositorio.listarDirecciones(idCliente), "Error al buscar direcciones");
    }

    async agregarDireccion({ distrito, calle, referencia, codigo_postal, id_cliente, id_ciudad } = {}) {
        const direccion = new Direccion({
            distrito, calle, referencia, codigoPostal: codigo_postal, idCliente: id_cliente, idCiudad: id_ciudad,
        });
        const id = await ejecutar(() => this.repositorio.guardarDireccion(direccion), "Error al agregar dirección");
        return { mensaje: "Dirección registrada correctamente", id_direccion: id };
    }
}

module.exports = UbicacionService;
