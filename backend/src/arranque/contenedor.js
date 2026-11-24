/**
 * Raíz de composición: el ÚNICO lugar que conoce todas las piezas concretas.
 * Elige la persistencia (MySQL o memoria) y conecta servicios de aplicación con sus puertos.
 */
const path = require("path");
const IdentidadService = require("../contextos/identidad/aplicacion/IdentidadService");
const HasheadorBcrypt = require("../contextos/identidad/infraestructura/HasheadorBcrypt");
const ProductoService = require("../contextos/catalogo/aplicacion/ProductoService");
const ClasificacionService = require("../contextos/catalogo/aplicacion/ClasificacionService");
const AlmacenImagenesDisco = require("../contextos/catalogo/infraestructura/almacenamiento/AlmacenImagenesDisco");
const CarritoService = require("../contextos/carrito/aplicacion/CarritoService");
const UbicacionService = require("../contextos/ubicaciones/aplicacion/UbicacionService");
const ResenaService = require("../contextos/resenas/aplicacion/ResenaService");
const PedidoService = require("../contextos/pedidos/aplicacion/PedidoService");
const MonederoClientesIdentidad = require("../contextos/pedidos/infraestructura/MonederoClientesIdentidad");
const BoletaPdfKit = require("../contextos/pedidos/infraestructura/BoletaPdfKit");
const EncuestaService = require("../contextos/encuestas/aplicacion/EncuestaService");

const DIRECTORIO_IMAGENES = path.join(__dirname, "../../uploads");

const crearPersistencia = (entorno) => {
    if ((entorno.PERSISTENCIA || "mysql").toLowerCase() === "memoria") {
        return require("./persistenciaMemoria").crearPersistenciaMemoria();
    }
    return require("./persistenciaMySQL")(entorno);
};

const crearContenedor = ({ entorno = process.env, persistencia = crearPersistencia(entorno), hasheador = new HasheadorBcrypt() } = {}) => {
    const identidadService = new IdentidadService({
        repositorioClientes: persistencia.clientes,
        repositorioEmpleados: persistencia.empleados,
        hasheador,
    });

    return {
        persistencia,
        hasheador,
        directorioImagenes: DIRECTORIO_IMAGENES,
        identidadService,
        productoService: new ProductoService(persistencia.productos, new AlmacenImagenesDisco(DIRECTORIO_IMAGENES)),
        clasificacionService: new ClasificacionService(persistencia.clasificaciones),
        carritoService: new CarritoService(persistencia.carritos),
        ubicacionService: new UbicacionService(persistencia.ubicaciones),
        resenaService: new ResenaService(persistencia.resenas),
        pedidoService: new PedidoService({
            repositorioPedidos: persistencia.pedidos,
            monederoClientes: new MonederoClientesIdentidad(identidadService),
        }),
        generadorBoleta: new BoletaPdfKit(),
        encuestaService: new EncuestaService(persistencia.encuestas),
    };
};

module.exports = { crearContenedor, crearPersistencia };
