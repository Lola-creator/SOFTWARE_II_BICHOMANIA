// Tarea 7 – Nombres seguros para las imágenes subidas
const { generarNombreImagen, esImagenPermitida } =
    require("../../src/contextos/catalogo/infraestructura/almacenamiento/nombreImagen");
const { ErrorValidacion } = require("../../src/compartido/dominio/errores");

describe("nombreImagen", () => {
    test.each([
        ["image/jpeg", "jpg"],
        ["image/png", "png"],
        ["image/webp", "webp"],
    ])("usa un id único y la extensión según el tipo %s", (mimetype, extension) => {
        // Arrange
        const generarId = () => "id-fijo";
        // Act
        const nombre = generarNombreImagen(mimetype, generarId);
        // Assert
        expect(nombre).toBe(`id-fijo.${extension}`);
    });

    test("ignora la extensión que manda el usuario", () => {
        // El nombre original "virus.html" no influye: solo cuenta el tipo permitido
        const nombre = generarNombreImagen("image/png", () => "abc");
        expect(nombre.endsWith(".html")).toBe(false);
    });

    test("dos subidas seguidas no generan el mismo nombre", () => {
        expect(generarNombreImagen("image/png")).not.toBe(generarNombreImagen("image/png"));
    });

    test.each(["text/html", "image/svg+xml", "application/pdf", "", undefined])(
        "rechaza el tipo no permitido %p",
        (mimetype) => {
            expect(esImagenPermitida(mimetype)).toBe(false);
            expect(() => generarNombreImagen(mimetype)).toThrow(ErrorValidacion);
        },
    );
});
