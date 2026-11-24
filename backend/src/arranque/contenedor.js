
const path = require("node:path");
const IdentidadService = require("../contextos/identidad/aplicacion/IdentidadService");
const crypto = require("node:crypto");
const HasheadorBcrypt = require("../contextos/identidad/infraestructura/HasheadorBcrypt");
const TokenHmac = require("../contextos/identidad/infraestructura/TokenHmac");
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

// Sin TOKEN_SECRETO se genera uno aleatorio: funciona, pero las sesiones se pierden al reiniciar
const secretoTokens = (entorno) => {
    if (entorno.TOKEN_SECRETO) return entorno.TOKEN_SECRETO;
    console.warn("⚠ TOKEN_SECRETO no definido: se usa un secreto temporal (las sesiones caducan al reiniciar).");
    return crypto.randomBytes(48).toString("hex");
};

const crearEmisorTokens = (entorno) => new TokenHmac({
    secreto: secretoTokens(entorno),
    duracionSegundos: Number(entorno.TOKEN_DURACION_SEGUNDOS) || undefined,
});

const crearContenedor = ({
    entorno = process.env,
    persistencia = crearPersistencia(entorno),
    hasheador = new HasheadorBcrypt(),
    emisorTokens = crearEmisorTokens(entorno),
} = {}) => {
    const identidadService = new IdentidadService({
        repositorioClientes: persistencia.clientes,
        repositorioEmpleados: persistencia.empleados,
        hasheador,
        emisorTokens,
    });

    return {
        persistencia,
        hasheador,
        emisorTokens,
        directorioImagenes: DIRECTORIO_IMAGENES,
        identidadService,
        productoService: new ProductoService(persistencia.productos, new AlmacenImagenesDisco(DIRECTORIO_IMAGENES)),
        clasificacionService: new ClasificacionService(persistencia.clasificaciones),
        carritoService: new CarritoService(persistencia.carritos),
        ubicacionService: new UbicacionService(persistencia.ubicaciones),
        resenaService: new ResenaService(persistencia.resenas),
        pedidoService: new PedidoService({
            repositorioPedidos: persistencia.pedidos,
            gestorCarritos: persistencia.gestorCarritos,
            monederoClientes: new MonederoClientesIdentidad(identidadService),
        }),
        generadorBoleta: new BoletaPdfKit(),
        encuestaService: new EncuestaService(persistencia.encuestas),
    };
};

module.exports = { crearContenedor, crearPersistencia };
