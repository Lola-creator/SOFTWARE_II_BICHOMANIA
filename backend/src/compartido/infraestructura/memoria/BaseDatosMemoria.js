/**
 * "Base de datos" en memoria para desarrollar y probar sin MySQL.
 * Imita las tablas actuales (mismos nombres de columnas) para que los
 * adaptadores de memoria devuelvan exactamente lo mismo que los de MySQL.
 * Se pierde al reiniciar el servidor.
 */
class BaseDatosMemoria {
    constructor() {
        this.tablas = {};
        this.secuencias = {};
    }

    tabla(nombre) {
        if (!this.tablas[nombre]) this.tablas[nombre] = [];
        return this.tablas[nombre];
    }

    insertar(nombre, columnaId, fila) {
        this.secuencias[nombre] = (this.secuencias[nombre] || 0) + 1;
        const nueva = { [columnaId]: this.secuencias[nombre], ...fila };
        this.tabla(nombre).push(nueva);
        return nueva[columnaId];
    }

    buscar(nombre, predicado) {
        return this.tabla(nombre).filter(predicado);
    }

    primero(nombre, predicado) {
        return this.tabla(nombre).find(predicado) || null;
    }

    eliminar(nombre, predicado) {
        const antes = this.tabla(nombre).length;
        this.tablas[nombre] = this.tabla(nombre).filter((fila) => !predicado(fila));
        return antes - this.tablas[nombre].length;
    }

    actualizar(nombre, predicado, cambios) {
        let afectadas = 0;
        this.tabla(nombre).forEach((fila) => {
            if (predicado(fila)) {
                Object.assign(fila, typeof cambios === "function" ? cambios(fila) : cambios);
                afectadas += 1;
            }
        });
        return afectadas;
    }
}

// Igualdad tolerante: los ids llegan a veces como texto desde HTTP
const mismoId = (a, b) => a !== null && a !== undefined && String(a) === String(b);

module.exports = { BaseDatosMemoria, mismoId };
