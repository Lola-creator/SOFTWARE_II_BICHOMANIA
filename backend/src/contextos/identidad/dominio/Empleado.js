const CorreoElectronico = require("./CorreoElectronico");

class Empleado {
    constructor({ id = null, nombre, correo, cargo = null, contrasenaHash }) {
        this.id = id;
        this.nombre = nombre;
        this.correo = correo instanceof CorreoElectronico ? correo : CorreoElectronico.desdePersistencia(correo);
        this.cargo = cargo;
        this.contrasenaHash = contrasenaHash;
    }

    sesion() {
        return { id: this.id, nombre: this.nombre, correo: this.correo.valor, cargo: this.cargo, rol: "empleado" };
    }
}

module.exports = Empleado;
