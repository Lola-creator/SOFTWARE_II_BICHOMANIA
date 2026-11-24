// Pruebas de convenciones CSS (equivalen a las reglas de SonarQube del issue #19).
const fs = require("node:fs");
const path = require("node:path");

const RAIZ_SRC = path.join(__dirname, "..");
const CONTRASTE_MINIMO = 4.5; // WCAG 2.1 AA para texto normal

const archivosCss = (directorio) => fs.readdirSync(directorio, { withFileTypes: true }).flatMap((entrada) => {
  const ruta = path.join(directorio, entrada.name);
  if (entrada.isDirectory()) return archivosCss(ruta);
  return entrada.name.endsWith(".css") ? [ruta] : [];
});

const hojas = () => archivosCss(RAIZ_SRC).map((archivo) => ({
  nombre: path.relative(RAIZ_SRC, archivo),
  css: fs.readFileSync(archivo, "utf8").replace(/\/\*[\s\S]*?\*\//g, ""),
}));

// Devuelve las reglas { contexto, selector, declaraciones: [[propiedad, valor]] } de una hoja
const reglas = (css) => {
  const resultado = [];
  const pila = [];
  let texto = "";
  for (const caracter of css) {
    if (caracter === "{") {
      pila.push({ prelude: texto.trim(), declaraciones: "" });
      texto = "";
    } else if (caracter === "}") {
      const bloque = pila.pop();
      if (!bloque) continue;
      bloque.declaraciones += texto;
      texto = "";
      if (!bloque.prelude.startsWith("@")) {
        resultado.push({
          contexto: pila.map((b) => b.prelude).join(" > "),
          selector: bloque.prelude.replace(/\s+/g, " "),
          declaraciones: bloque.declaraciones.split(";").map((d) => d.trim()).filter(Boolean)
            .map((d) => d.split(":")).filter((p) => p.length > 1)
            .map(([prop, ...valor]) => [prop.trim().toLowerCase(), valor.join(":").trim().toLowerCase()]),
        });
      }
    } else {
      texto += caracter;
    }
  }
  return resultado;
};

const COLORES_CON_NOMBRE = {
  white: [255, 255, 255], black: [0, 0, 0], red: [255, 0, 0], yellow: [255, 255, 0],
  darkblue: [0, 0, 139], blue: [0, 0, 255], green: [0, 128, 0], gray: [128, 128, 128],
  darkgoldenrod: [184, 134, 11], goldenrod: [218, 165, 32], orange: [255, 165, 0],
};

const aRgb = (valor) => {
  if (COLORES_CON_NOMBRE[valor]) return COLORES_CON_NOMBRE[valor];
  const hex = valor.match(/^#([\da-f]{3}|[\da-f]{6})$/);
  if (hex) {
    const digitos = hex[1].length === 3 ? [...hex[1]].map((d) => d + d) : hex[1].match(/../g);
    return digitos.map((d) => Number.parseInt(d, 16));
  }
  const rgb = valor.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\)$/);
  if (rgb && (rgb[4] === undefined || Number(rgb[4]) === 1)) return rgb.slice(1, 4).map(Number);
  return null; // transparente o formato no soportado: no se evalúa
};

const luminancia = (rgb) => {
  const [r, g, b] = rgb.map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contraste = (a, b) => {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
};

describe("Convenciones CSS", () => {
  test("S4667: no hay hojas de estilo vacías", () => {
    const vacias = hojas().filter(({ css }) => css.trim() === "").map(({ nombre }) => nombre);

    expect(vacias).toEqual([]);
  });

  test("S4656: una regla no repite la misma propiedad", () => {
    const duplicadas = hojas().flatMap(({ nombre, css }) => reglas(css).flatMap(({ selector, declaraciones }) => {
      const propiedades = declaraciones.map(([prop]) => prop);
      return [...new Set(propiedades.filter((p, i) => propiedades.indexOf(p) !== i))]
        .map((p) => `${nombre} ${selector} → ${p}`);
    }));

    expect(duplicadas).toEqual([]);
  });

  test("S4666: un selector no se declara dos veces en la misma hoja", () => {
    const duplicados = hojas().flatMap(({ nombre, css }) => {
      const claves = reglas(css).map(({ contexto, selector }) => `${contexto}|${selector}`);
      return [...new Set(claves.filter((c, i) => claves.indexOf(c) !== i))].map((c) => `${nombre} ${c.split("|")[1]}`);
    });

    expect(duplicados).toEqual([]);
  });

  test(`S7924: el texto tiene contraste mínimo ${CONTRASTE_MINIMO}:1 con su fondo`, () => {
    const bajos = hojas().flatMap(({ nombre, css }) => reglas(css).flatMap(({ selector, declaraciones }) => {
      const valor = (prop) => declaraciones.filter(([p]) => p === prop).map(([, v]) => v).pop();
      const texto = valor("color") && aRgb(valor("color"));
      const fondo = valor("background-color") && aRgb(valor("background-color"));
      if (!texto || !fondo) return [];
      const ratio = contraste(texto, fondo);
      return ratio < CONTRASTE_MINIMO ? [`${nombre} ${selector} → ${ratio.toFixed(2)}:1`] : [];
    }));

    expect(bajos).toEqual([]);
  });
});
