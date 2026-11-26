const fs = require("node:fs");
const path = require("node:path");

// Adaptador: guarda/borra las imágenes de productos en una carpeta local (/uploads)
class AlmacenImagenesDisco {
  constructor(directorio) {
    this.directorio = directorio;
    if (!fs.existsSync(directorio)) fs.mkdirSync(directorio, { recursive: true });
  }

  eliminar(ruta) {
    if (!ruta || !String(ruta).startsWith("/uploads/")) return;
    const archivo = path.join(this.directorio, path.basename(ruta));
    fs.unlink(archivo, (err) => {
      if (err) console.log("⚠ No se pudo borrar imagen:", ruta);
    });
  }
}

module.exports = AlmacenImagenesDisco;
