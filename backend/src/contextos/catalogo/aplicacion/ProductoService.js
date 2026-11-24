const Producto = require("../dominio/Producto");
const { ErrorNoEncontrado } = require("../../../compartido/dominio/errores");
const { validarDatosProducto: validar } = require("../dominio/ReglasProducto");

class ProductoService {
  constructor(repositorio, almacenImagenes) {
    this.repositorio = repositorio;
    this.almacenImagenes = almacenImagenes;
  }

  async agregar(datos) {
    try {
      validar(datos, { nuevo: true });
    } catch (e) {
      this.almacenImagenes.eliminar(datos.imagen);
      throw e;
    }
    const producto = new Producto({ ...datos, nombre: datos.nombre.trim() });
    const idProducto = await this.repositorio.crear(producto);
    return { message: "Producto registrado correctamente", id_producto: idProducto };
  }

  async editar(idProducto, datos, rutaImagenNueva) {
    try {
      validar(datos, { nuevo: false });
    } catch (e) {
      this.almacenImagenes.eliminar(rutaImagenNueva);
      throw e;
    }

    const actual = await this.repositorio.buscarPorId(idProducto);
    if (!actual) {
      this.almacenImagenes.eliminar(rutaImagenNueva);
      throw new ErrorNoEncontrado("Producto no encontrado");
    }

    const imagenAnterior = actual.imagen;
    const actualizado = new Producto({
      ...datos,
      nombre: datos.nombre.trim(),
      id: actual.id,
      imagen: rutaImagenNueva || imagenAnterior,
    });
    await this.repositorio.actualizar(actualizado);

    if (rutaImagenNueva) this.almacenImagenes.eliminar(imagenAnterior);
    return this.obtenerDetalle(idProducto);
  }

  async eliminar(idProducto) {
    const producto = await this.repositorio.buscarPorId(idProducto);
    if (!producto) throw new ErrorNoEncontrado("Producto no encontrado");

    await this.repositorio.eliminar(idProducto);
    this.almacenImagenes.eliminar(producto.imagen);
    return { message: "Producto eliminado correctamente" };
  }

  listar(filtros) {
    return this.repositorio.listar(filtros);
  }

  async obtenerDetalle(idProducto) {
    const detalle = await this.repositorio.buscarDetalle(idProducto);
    if (!detalle) throw new ErrorNoEncontrado("Producto no encontrado");
    return detalle;
  }
}

module.exports = ProductoService;