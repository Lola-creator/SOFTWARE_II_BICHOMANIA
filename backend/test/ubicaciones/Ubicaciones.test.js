const { Pais, Ciudad, Direccion } = require("../../src/contextos/ubicaciones/dominio/Ubicaciones");
const UbicacionService = require("../../src/contextos/ubicaciones/aplicacion/UbicacionService");
const { ErrorValidacion, ErrorNoEncontrado } = require("../../src/compartido/dominio/errores");

describe("Ubicaciones (dominio)", () => {
    test("país y ciudad exigen nombre", () => {
        expect(() => new Pais({ nombre: "" })).toThrow("El nombre del país es obligatorio");
        expect(() => new Ciudad({ nombre: "Lima" })).toThrow("Nombre e id_pais son obligatorios");
    });

    test("dirección exige todos los campos", () => {
        expect(() => new Direccion({ distrito: "Miraflores", calle: "Av. 1", referencia: "", codigoPostal: "15074", idCliente: 1, idCiudad: 1 }))
            .toThrow("Faltan datos para agregar dirección");
    });
});

describe("UbicacionService", () => {
    let repo, servicio;
    beforeEach(() => {
        repo = { listarPaises: jest.fn(), guardarPais: jest.fn(), listarCiudades: jest.fn(), guardarCiudad: jest.fn(), listarDirecciones: jest.fn(), guardarDireccion: jest.fn() };
        servicio = new UbicacionService(repo);
    });

    test("actualizar un país inexistente → ErrorNoEncontrado", async () => {
        repo.guardarPais.mockResolvedValue(0);
        await expect(servicio.actualizarPais("9", { nombre: "Chile" })).rejects.toThrow(ErrorNoEncontrado);
    });

    test("listarCiudades sin país → ErrorValidacion", () => {
        expect(() => servicio.listarCiudades()).toThrow(ErrorValidacion);
    });

    test("agregarDireccion traduce los campos de la API", async () => {
        repo.guardarDireccion.mockResolvedValue(3);
        const r = await servicio.agregarDireccion({ distrito: "Miraflores", calle: "Av. 1", referencia: "Parque", codigo_postal: "15074", id_cliente: 1, id_ciudad: 2 });
        expect(r).toEqual({ mensaje: "Dirección registrada correctamente", id_direccion: 3 });
        expect(repo.guardarDireccion.mock.calls[0][0].codigoPostal).toBe("15074");
    });
});
