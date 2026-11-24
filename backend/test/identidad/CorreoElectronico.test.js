// Tarea 12 – Regex de correo sin backtracking (SonarQube S8786)
const CorreoElectronico = require("../../src/contextos/identidad/dominio/CorreoElectronico");
const { ErrorValidacion } = require("../../src/compartido/dominio/errores");

describe("CorreoElectronico", () => {
    test("acepta un correo válido y lo normaliza", () => {
        // Arrange
        const texto = "  Ana.Perez@Gmail.com ";
        // Act
        const correo = new CorreoElectronico(texto);
        // Assert
        expect(correo.valor).toBe("ana.perez@gmail.com");
    });

    test.each(["", "ana", "ana@", "@gmail.com", "ana gmail.com", "ana@gmail", "ana@@gmail.com"])(
        "rechaza el correo inválido '%s'",
        (texto) => {
            expect(() => new CorreoElectronico(texto)).toThrow(ErrorValidacion);
        },
    );

    test("rechaza correos de más de 254 caracteres (límite RFC 5321)", () => {
        // Arrange
        const largo = `${"a".repeat(250)}@gmail.com`;
        // Act + Assert
        expect(() => new CorreoElectronico(largo)).toThrow(ErrorValidacion);
    });

    test("responde rápido con un texto malicioso (sin ReDoS)", () => {
        // Arrange: muchos puntos después de la @ y un carácter inválido al final
        // → con la regex actual tarda cientos de milisegundos (backtracking)
        const malicioso = `a@${".".repeat(20000)}@`;
        const inicio = Date.now();
        // Act
        expect(() => new CorreoElectronico(malicioso)).toThrow(ErrorValidacion);
        // Assert
        expect(Date.now() - inicio).toBeLessThan(50);
    });
});
