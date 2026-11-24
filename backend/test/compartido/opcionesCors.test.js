// Tarea 11 – Restringir CORS a los orígenes del frontend (SonarQube S5122)
const { crearOpcionesCors } = require("../../src/compartido/http/opcionesCors");

// Ayuda: ejecuta la función origin de cors y devuelve si permitió el origen
const permite = (opciones, origen) =>
    new Promise((resolve, reject) =>
        opciones.origin(origen, (error, permitido) => (error ? reject(error) : resolve(permitido))));

describe("crearOpcionesCors", () => {
    test("permite los orígenes listados en CORS_ORIGINS", async () => {
        // Arrange
        const opciones = crearOpcionesCors({ CORS_ORIGINS: "http://localhost:3000, https://bichomania.vercel.app" });
        // Act + Assert
        await expect(permite(opciones, "http://localhost:3000")).resolves.toBe(true);
        await expect(permite(opciones, "https://bichomania.vercel.app")).resolves.toBe(true);
    });

    test("bloquea un origen que no está en la lista", async () => {
        const opciones = crearOpcionesCors({ CORS_ORIGINS: "http://localhost:3000" });
        await expect(permite(opciones, "https://sitio-malicioso.com")).resolves.toBe(false);
    });

    test("sin CORS_ORIGINS solo permite el frontend local", async () => {
        const opciones = crearOpcionesCors({});
        await expect(permite(opciones, "http://localhost:3000")).resolves.toBe(true);
        await expect(permite(opciones, "http://otro.com")).resolves.toBe(false);
    });

    test("permite peticiones sin origen (Postman, pruebas, servidor a servidor)", async () => {
        const opciones = crearOpcionesCors({ CORS_ORIGINS: "http://localhost:3000" });
        await expect(permite(opciones, undefined)).resolves.toBe(true);
    });
});
