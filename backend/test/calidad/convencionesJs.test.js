// Pruebas de convenciones (equivalen a las reglas de SonarQube del issue #17).
// Recorren el código fuente y fallan mientras exista el code smell.
const fs = require("node:fs");
const path = require("node:path");

const RAIZ_SRC = path.join(__dirname, "../../src");

const archivosJs = (directorio) => fs.readdirSync(directorio, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = path.join(directorio, entrada.name);
    if (entrada.isDirectory()) return archivosJs(ruta);
    return entrada.name.endsWith(".js") ? [ruta] : [];
});

const lineasQueCumplen = (patron) => archivosJs(RAIZ_SRC).flatMap((archivo) =>
    fs.readFileSync(archivo, "utf8").split("\n")
        .map((linea, i) => ({ linea, ubicacion: `${path.relative(RAIZ_SRC, archivo)}:${i + 1}` }))
        .filter(({ linea }) => patron.test(linea))
        .map(({ ubicacion }) => ubicacion));

describe("Convenciones de JavaScript en el backend", () => {
    test("S7772: los módulos nativos de Node se importan con el prefijo node:", () => {
        const modulosNativos = ["fs", "path", "crypto", "os", "util", "http", "https", "url", "stream", "events"].join("|");
        const sinPrefijo = new RegExp(`require\\(["'](${modulosNativos})["']\\)`);

        expect(lineasQueCumplen(sinPrefijo)).toEqual([]);
    });

    test("S7773: se usa Number.isNaN en lugar del isNaN global", () => {
        expect(lineasQueCumplen(/(^|[^.\w])isNaN\(/)).toEqual([]);
    });
});
