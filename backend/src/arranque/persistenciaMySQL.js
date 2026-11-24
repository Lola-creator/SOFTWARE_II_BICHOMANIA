// Adaptadores MySQL de todos los contextos
const { crearPoolMySQL } = require("../compartido/infraestructura/mysql/conexion");
const ClienteRepositoryMySQL = require("../contextos/identidad/infraestructura/mysql/ClienteRepositoryMySQL");
const EmpleadoRepositoryMySQL = require("../contextos/identidad/infraestructura/mysql/EmpleadoRepositoryMySQL");
const ProductoRepositoryMySQL = require("../contextos/catalogo/infraestructura/mysql/ProductoRepositoryMySQL");
const ClasificacionRepositoryMySQL = require("../contextos/catalogo/infraestructura/mysql/ClasificacionRepositoryMySQL");
const CarritoRepositoryMySQL = require("../contextos/carrito/infraestructura/mysql/CarritoRepositoryMySQL");
const UbicacionRepositoryMySQL = require("../contextos/ubicaciones/infraestructura/mysql/UbicacionRepositoryMySQL");
const ResenaRepositoryMySQL = require("../contextos/resenas/infraestructura/mysql/ResenaRepositoryMySQL");
const PedidoRepositoryMySQL = require("../contextos/pedidos/infraestructura/mysql/PedidoRepositoryMySQL");
const GestorCarritosMySQL = require("../contextos/pedidos/infraestructura/mysql/GestorCarritosMySQL");
const EncuestaRepositoryMySQL = require("../contextos/encuestas/infraestructura/mysql/EncuestaRepositoryMySQL");

const crearPersistenciaMySQL = (entorno) => {
    const pool = crearPoolMySQL(entorno);
    return {
        nombre: "mysql",
        clientes: new ClienteRepositoryMySQL(pool),
        empleados: new EmpleadoRepositoryMySQL(pool),
        productos: new ProductoRepositoryMySQL(pool),
        clasificaciones: new ClasificacionRepositoryMySQL(pool),
        carritos: new CarritoRepositoryMySQL(pool),
        ubicaciones: new UbicacionRepositoryMySQL(pool),
        resenas: new ResenaRepositoryMySQL(pool),
        pedidos: new PedidoRepositoryMySQL(pool),
        gestorCarritos: new GestorCarritosMySQL(pool),
        encuestas: new EncuestaRepositoryMySQL(pool),
        probarConexion: async () => (await pool.query("SELECT 1 + 1 AS resultado"))[0],
        cerrar: () => pool.end(),
    };
};

module.exports = crearPersistenciaMySQL;
