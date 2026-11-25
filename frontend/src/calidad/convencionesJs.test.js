// Pruebas de convenciones (equivalen a las reglas de SonarQube del issue #17).
// Recorren el código fuente y fallan mientras exista el code smell.
const fs = require("node:fs");
const path = require("node:path");

const RAIZ_SRC = path.join(__dirname, "..");

const archivosJs = (directorio) => fs.readdirSync(directorio, { withFileTypes: true }).flatMap((entrada) => {
  const ruta = path.join(directorio, entrada.name);
  if (entrada.isDirectory()) return archivosJs(ruta);
  return /\.jsx?$/.test(entrada.name) && !entrada.name.includes(".test.") ? [ruta] : [];
});

const fuentes = () => archivosJs(RAIZ_SRC).map((archivo) => ({
  nombre: path.relative(RAIZ_SRC, archivo),
  codigo: fs.readFileSync(archivo, "utf8"),
}));

const IMPORT = /^import\s+(.+?)\s+from\s+["']([^"']+)["'];?/gm;

const importaciones = (codigo) => [...codigo.matchAll(IMPORT)].map(([sentencia, nombres, modulo]) => ({ sentencia, nombres, modulo }));

const nombresLocales = (nombres) => {
  const llaves = nombres.match(/\{([^}]*)\}/);
  const porDefecto = nombres.replace(/\{[^}]*\}/, "").split(",").map((n) => n.trim()).filter(Boolean)
    .map((n) => n.replace(/^\*\s+as\s+/, ""));
  const nombrados = llaves ? llaves[1].split(",").map((n) => n.trim()).filter(Boolean)
    .map((n) => n.split(/\s+as\s+/).pop()) : [];
  return [...porDefecto, ...nombrados];
};

const ubicaciones = (codigo, patron, nombre) => codigo.split("\n")
  .map((linea, i) => (patron.test(linea) ? `${nombre}:${i + 1}` : null)).filter(Boolean);

describe("Convenciones de JavaScript en el frontend", () => {
  test("S1128: no hay imports sin usar", () => {
    const sinUsar = fuentes().flatMap(({ nombre, codigo }) => importaciones(codigo).flatMap(({ sentencia, nombres }) => {
      const resto = codigo.replace(sentencia, "");
      return nombresLocales(nombres)
        .filter((local) => local !== "React") // necesario para JSX en algunas configuraciones
        .filter((local) => !new RegExp(`\\b${local}\\b`).test(resto))
        .map((local) => `${nombre}: ${local}`);
    }));

    expect(sinUsar).toEqual([]);
  });

  test("S3863: cada módulo se importa una sola vez por archivo", () => {
    const duplicados = fuentes().flatMap(({ nombre, codigo }) => {
      const modulos = importaciones(codigo).map((i) => i.modulo);
      return [...new Set(modulos.filter((m, i) => modulos.indexOf(m) !== i))].map((m) => `${nombre}: ${m}`);
    });

    expect(duplicados).toEqual([]);
  });

  test("S7773: se usa Number.isNaN en lugar del isNaN global", () => {
    const usos = fuentes().flatMap(({ nombre, codigo }) => ubicaciones(codigo, /(^|[^.\w])isNaN\(/, nombre));

    expect(usos).toEqual([]);
  });

  test("S6353: las expresiones regulares usan \\d en lugar de [0-9]", () => {
    const usos = fuentes().flatMap(({ nombre, codigo }) => ubicaciones(codigo, /\[0-9\]/, nombre));

    expect(usos).toEqual([]);
  });

  test("S6582: se usa encadenamiento opcional en lugar de !x || !x.prop", () => {
    const usos = fuentes().flatMap(({ nombre, codigo }) => ubicaciones(codigo, /!(\w+)\s*\|\|\s*!\1\./, nombre));

    expect(usos).toEqual([]);
  });
});
