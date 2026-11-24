const Encuesta = require("../../src/contextos/encuestas/dominio/Encuesta");
const OpcionEncuesta = require("../../src/contextos/encuestas/dominio/OpcionEncuesta");
const { ErrorValidacion } = require("../../src/compartido/dominio/errores");
const { codigoHttpDeError } = require("../../src/compartido/http/responderCasoDeUso");

const crearEncuesta = (opciones) => new Encuesta({
    id: 3,
    fechaInicio: "2026-10-01",
    fechaFin: "2026-10-31",
    descripcion: "¿Cual es tu equipo favorito?",
    idEmpleado: 2,
    opciones
});

describe("Encuesta.ganadora", () => {
    test("una encuesta sin opciones lanza un error de validacion", () => {
        const encuesta = crearEncuesta([]);

        const calcular = () => encuesta.ganadora();

        expect(calcular).toThrow(ErrorValidacion);
        expect(calcular).toThrow("La encuesta no tiene opciones para elegir una ganadora");
    });

    test("el error de una encuesta sin opciones se responde con 400", () => {
        const encuesta = crearEncuesta([]);
        let errorObtenido;

        try {
            encuesta.ganadora();
        } catch (error) {
            errorObtenido = error;
        }

        expect(codigoHttpDeError(errorObtenido)).toBe(400);
    });

    test("devuelve la opcion con mas votos", () => {
        const encuesta = crearEncuesta([
            new OpcionEncuesta({ id: 11, equipo: "Barcelona", votos: 2 }),
            new OpcionEncuesta({ id: 12, equipo: "Real Madrid", votos: 4 })
        ]);

        const resultado = encuesta.ganadora();

        expect(resultado).toEqual({ opcion: "Real Madrid", votos: 4 });
    });

    test("en empate gana la primera opcion", () => {
        const encuesta = crearEncuesta([
            new OpcionEncuesta({ id: 11, liga: "LaLiga", votos: 3 }),
            new OpcionEncuesta({ id: 12, liga: "Premier", votos: 3 })
        ]);

        const resultado = encuesta.ganadora();

        expect(resultado).toEqual({ opcion: "LaLiga", votos: 3 });
    });

    test("con una sola opcion esa es la ganadora", () => {
        const encuesta = crearEncuesta([
            new OpcionEncuesta({ id: 11, categoria: "Camisetas", votos: 0 })
        ]);

        const resultado = encuesta.ganadora();

        expect(resultado).toEqual({ opcion: "Camisetas", votos: 0 });
    });
});
