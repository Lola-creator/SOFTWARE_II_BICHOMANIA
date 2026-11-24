const IdentidadService = require("../../src/contextos/identidad/aplicacion/IdentidadService");
const Cliente = require("../../src/contextos/identidad/dominio/Cliente");
const Empleado = require("../../src/contextos/identidad/dominio/Empleado");
const { ErrorValidacion, ErrorNoEncontrado, ErrorCredenciales } = require("../../src/compartido/dominio/errores");
const ErrorPersistencia = require("../../src/compartido/aplicacion/ErrorPersistencia");

describe("IdentidadService", () => {
    let clientes, empleados, hasheador, servicio;
    const registro = {
        nombre: "Ana", apellido_paterno: "Pérez", telefono: "987654321",
        correo_electronico: "ana@gmail.com", dni: "12345678", contrasena: "Secreta123",
    };
    const clienteGuardado = () => new Cliente({
        id: 1, nombre: "Ana", apellidoPaterno: "Pérez", telefono: "987654321",
        correo: "ana@gmail.com", dni: "12345678", contrasenaHash: "HASH", saldo: 5,
    });

    beforeEach(() => {
        clientes = { guardar: jest.fn(), buscarPorCorreo: jest.fn(), buscarPorId: jest.fn(), listar: jest.fn(), actualizarSaldo: jest.fn() };
        empleados = { buscarPorCorreo: jest.fn() };
        hasheador = { hashear: jest.fn().mockResolvedValue("HASH"), comparar: jest.fn() };
        servicio = new IdentidadService({ repositorioClientes: clientes, repositorioEmpleados: empleados, hasheador });
    });

    describe("registrarCliente", () => {
        test("guarda el cliente con la contraseña hasheada", async () => {
            clientes.buscarPorCorreo.mockResolvedValue(null);
            clientes.guardar.mockResolvedValue(9);

            await expect(servicio.registrarCliente(registro)).resolves.toEqual({
                message: "Usuario registrado exitosamente", id_cliente: 9,
            });
            const guardado = clientes.guardar.mock.calls[0][0];
            expect(guardado.contrasenaHash).toBe("HASH");
            expect(hasheador.hashear).toHaveBeenCalledWith("Secreta123");
        });

        test("rechaza correos ya registrados", async () => {
            clientes.buscarPorCorreo.mockResolvedValue(clienteGuardado());
            await expect(servicio.registrarCliente(registro)).rejects.toThrow("El correo ya está registrado");
            expect(clientes.guardar).not.toHaveBeenCalled();
        });

        test("rechaza contraseñas débiles sin consultar la BD", async () => {
            await expect(servicio.registrarCliente({ ...registro, contrasena: "debil" })).rejects.toThrow(ErrorValidacion);
            expect(clientes.buscarPorCorreo).not.toHaveBeenCalled();
        });

        test("traduce fallos de BD a ErrorPersistencia", async () => {
            clientes.buscarPorCorreo.mockResolvedValue(null);
            clientes.guardar.mockRejectedValue(new Error("SQL"));
            await expect(servicio.registrarCliente(registro)).rejects.toThrow(ErrorPersistencia);
        });
    });

    describe("inicio de sesión", () => {
        test("cliente con credenciales correctas", async () => {
            clientes.buscarPorCorreo.mockResolvedValue(clienteGuardado());
            hasheador.comparar.mockResolvedValue(true);
            const r = await servicio.iniciarSesionCliente({ correo: "ANA@gmail.com", password: "x" });
            expect(r).toEqual({ message: "Login exitoso", usuario: { id: 1, nombre: "Ana", correo: "ana@gmail.com", rol: "cliente" } });
        });

        test("cliente inexistente → ErrorNoEncontrado", async () => {
            clientes.buscarPorCorreo.mockResolvedValue(null);
            await expect(servicio.iniciarSesionCliente({ correo: "x@x.com", password: "x" })).rejects.toThrow(ErrorNoEncontrado);
        });

        test("correo con formato inválido se trata como inexistente", async () => {
            await expect(servicio.iniciarSesionCliente({ correo: "nada", password: "x" })).rejects.toThrow("Usuario no encontrado");
            expect(clientes.buscarPorCorreo).not.toHaveBeenCalled();
        });

        test("contraseña incorrecta → ErrorCredenciales", async () => {
            clientes.buscarPorCorreo.mockResolvedValue(clienteGuardado());
            hasheador.comparar.mockResolvedValue(false);
            await expect(servicio.iniciarSesionCliente({ correo: "ana@gmail.com", password: "x" })).rejects.toThrow(ErrorCredenciales);
        });

        test("empleado devuelve su cargo y rol", async () => {
            empleados.buscarPorCorreo.mockResolvedValue(new Empleado({ id: 2, nombre: "Admin", correo: "a@b.com", cargo: "Jefe", contrasenaHash: "H" }));
            hasheador.comparar.mockResolvedValue(true);
            const r = await servicio.iniciarSesionEmpleado({ correo: "a@b.com", password: "x" });
            expect(r.empleado).toEqual({ id: 2, nombre: "Admin", correo: "a@b.com", cargo: "Jefe", rol: "empleado" });
        });
    });

    test("obtenerPerfil devuelve los datos en el formato de la API", async () => {
        clientes.buscarPorId.mockResolvedValue(clienteGuardado());
        await expect(servicio.obtenerPerfil("1")).resolves.toMatchObject({ nombre: "Ana", correo_electronico: "ana@gmail.com", saldo: 5 });
    });

    test("abonarSaldo actualiza el saldo del cliente", async () => {
        clientes.buscarPorId.mockResolvedValue(clienteGuardado());
        await expect(servicio.abonarSaldo(1, 20)).resolves.toBe(25);
        expect(clientes.actualizarSaldo.mock.calls[0][0].saldo).toBe(25);
    });
});
