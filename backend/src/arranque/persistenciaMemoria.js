// Adaptadores en memoria: permiten correr la app y las pruebas sin base de datos
const { BaseDatosMemoria } = require("../compartido/infraestructura/memoria/BaseDatosMemoria");
const { ClienteRepositoryMemoria, EmpleadoRepositoryMemoria } = require("../contextos/identidad/infraestructura/memoria/IdentidadMemoria");
const { ProductoRepositoryMemoria, ClasificacionRepositoryMemoria } = require("../contextos/catalogo/infraestructura/memoria/CatalogoMemoria");
const CarritoRepositoryMemoria = require("../contextos/carrito/infraestructura/memoria/CarritoRepositoryMemoria");
const UbicacionRepositoryMemoria = require("../contextos/ubicaciones/infraestructura/memoria/UbicacionRepositoryMemoria");
const ResenaRepositoryMemoria = require("../contextos/resenas/infraestructura/memoria/ResenaRepositoryMemoria");
const { PedidoRepositoryMemoria, GestorCarritosMemoria } = require("../contextos/pedidos/infraestructura/memoria/PedidosMemoria");
const EncuestaRepositoryMemoria = require("../contextos/encuestas/infraestructura/memoria/EncuestaRepositoryMemoria");

const crearPersistenciaMemoria = (bd = new BaseDatosMemoria()) => ({
    nombre: "memoria",
    bd,
    clientes: new ClienteRepositoryMemoria(bd),
    empleados: new EmpleadoRepositoryMemoria(bd),
    productos: new ProductoRepositoryMemoria(bd),
    clasificaciones: new ClasificacionRepositoryMemoria(bd),
    carritos: new CarritoRepositoryMemoria(bd),
    ubicaciones: new UbicacionRepositoryMemoria(bd),
    resenas: new ResenaRepositoryMemoria(bd),
    pedidos: new PedidoRepositoryMemoria(bd),
    gestorCarritos: new GestorCarritosMemoria(bd),
    encuestas: new EncuestaRepositoryMemoria(bd),
    probarConexion: async () => [{ resultado: 2 }],
    cerrar: () => {},
});

// Datos de ejemplo para poder usar la app recién levantada
const sembrarDatosDemo = async (bd, hasheador) => {
    bd.insertar("empleados", "id_empleado", {
        nombre: "Admin", correo_electronico: "admin@bichomania.com", cargo: "Administrador",
        contrasena: await hasheador.hashear("Admin1234"),
    });
    bd.insertar("clientes", "id_cliente", {
        nombre: "Cliente", apellido_paterno: "Demo", apellido_materno: null, telefono: "999999999",
        correo_electronico: "cliente@gmail.com", dni: "12345678", saldo: 0,
        contrasena: await hasheador.hashear("Cliente123"),
    });
    ["Camisetas", "Shorts", "Accesorios"].forEach((nombre) => bd.insertar("categoria", "id_categoria", { nombre }));
    ["Liga 1", "Champions League", "Copa Libertadores"].forEach((nombre) => bd.insertar("competencias", "id_competencia", { nombre }));
    [["Adidas", "Alemania"], ["Nike", "Estados Unidos"]].forEach(([nombre, pais]) => bd.insertar("marcas", "id_marca", { nombre, pais }));
    [["Alianza Lima", "Perú"], ["Real Madrid", "España"]].forEach(([nombre, pais]) => bd.insertar("equipos", "id_equipo", { nombre, pais }));
    const idPeru = bd.insertar("paises", "id_pais", { nombre: "Perú" });
    bd.insertar("ciudades", "id_ciudad", { nombre: "Lima", id_pais: idPeru });
    bd.insertar("productos", "id_producto", {
        nombre: "Camiseta Alianza Lima 2026", caracteristica: "Talla M", precio: 199.9,
        id_categoria: 1, id_competencia: 1, id_marca: 2, id_equipo: 1, imagen: null,
    });
};

module.exports = { crearPersistenciaMemoria, sembrarDatosDemo };
