const Cliente = require("../dominio/Cliente");
const CorreoElectronico = require("../dominio/CorreoElectronico");
const { validarContrasenaNueva } = require("../dominio/PoliticaContrasena");
const { ErrorValidacion, ErrorNoEncontrado, ErrorCredenciales } = require("../../../compartido/dominio/errores");
const { validarIdentificador } = require("../../../compartido/dominio/validaciones");
const ejecutar = require("../../../compartido/aplicacion/ejecutarPersistencia");

const aPerfil = (cliente) => ({
    nombre: cliente.nombre,
    apellido_paterno: cliente.apellidoPaterno,
    apellido_materno: cliente.apellidoMaterno,
    telefono: cliente.telefono,
    correo_electronico: cliente.correo.valor,
    dni: cliente.dni,
    saldo: cliente.saldo,
});

class IdentidadService {
    constructor({ repositorioClientes, repositorioEmpleados, hasheador }) {
        this.clientes = repositorioClientes;
        this.empleados = repositorioEmpleados;
        this.hasheador = hasheador;
    }

    async registrarCliente({ nombre, apellido_paterno, telefono, correo_electronico, dni, contrasena } = {}) {
        validarContrasenaNueva(contrasena);
        const correo = new CorreoElectronico(correo_electronico);
        const existente = await ejecutar(() => this.clientes.buscarPorCorreo(correo), "Error al verificar el correo");
        if (existente) throw new ErrorValidacion("El correo ya está registrado");

        const cliente = Cliente.registrar({
            nombre,
            apellidoPaterno: apellido_paterno,
            telefono,
            correo,
            dni,
            contrasenaHash: await this.hasheador.hashear(contrasena),
        });
        const id = await ejecutar(() => this.clientes.guardar(cliente), "Error al registrar el usuario");
        return { message: "Usuario registrado exitosamente", id_cliente: id };
    }

    async iniciarSesionCliente({ correo, password } = {}) {
        const cliente = await this.#buscarPorCorreo(this.clientes, correo);
        if (!cliente) throw new ErrorNoEncontrado("Usuario no encontrado");
        await this.#verificarContrasena(password, cliente.contrasenaHash);
        return { message: "Login exitoso", usuario: cliente.sesion() };
    }

    async iniciarSesionEmpleado({ correo, password } = {}) {
        const empleado = await this.#buscarPorCorreo(this.empleados, correo);
        if (!empleado) throw new ErrorNoEncontrado("Empleado no encontrado");
        await this.#verificarContrasena(password, empleado.contrasenaHash);
        return { message: "Login de empleado exitoso", empleado: empleado.sesion() };
    }

    async obtenerPerfil(idCliente) {
        validarIdentificador(idCliente, "cliente");
        const cliente = await ejecutar(() => this.clientes.buscarPorId(idCliente), "Error al buscar obtener usuario");
        if (!cliente) throw new ErrorNoEncontrado("Usuario no encontrado");
        return aPerfil(cliente);
    }

    async listarClientes() {
        const clientes = await ejecutar(() => this.clientes.listar(), "Error al obtener clientes");
        return clientes.map((cliente) => ({ id_cliente: cliente.id, ...aPerfil(cliente) }));
    }

    // Usado por otros contextos (p. ej. Pedidos devuelve dinero al anular)
    async abonarSaldo(idCliente, monto) {
        const cliente = await ejecutar(() => this.clientes.buscarPorId(idCliente), "Error al buscar el cliente");
        if (!cliente) throw new ErrorNoEncontrado("Cliente no encontrado");
        cliente.abonarSaldo(monto);
        await ejecutar(() => this.clientes.actualizarSaldo(cliente), "Error al actualizar el saldo");
        return cliente.saldo;
    }

    async #buscarPorCorreo(repositorio, correoTexto) {
        let correo;
        try {
            correo = new CorreoElectronico(correoTexto);
        } catch {
            return null; // un correo mal escrito simplemente no existe
        }
        return ejecutar(() => repositorio.buscarPorCorreo(correo), "Error en la BD");
    }

    async #verificarContrasena(password, hash) {
        const valida = await this.hasheador.comparar(String(password ?? ""), hash);
        if (!valida) throw new ErrorCredenciales("Contraseña incorrecta");
    }
}

module.exports = IdentidadService;
