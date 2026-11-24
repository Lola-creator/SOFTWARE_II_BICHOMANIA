const CorreoElectronico = require("./CorreoElectronico");
const { ErrorValidacion } = require("../../../compartido/dominio/errores");
const { textoObligatorio, textoOpcional, redondearMonto } = require("../../../compartido/dominio/validaciones");

const validarDni = (dni) => {
    const valor = String(dni ?? "").trim();
    if (!/^\d{8}$/.test(valor)) throw new ErrorValidacion("El DNI debe tener exactamente 8 números");
    return valor;
};

const validarTelefono = (telefono) => {
    const valor = String(telefono ?? "").trim();
    if (!/^\d{9}$/.test(valor)) throw new ErrorValidacion("El teléfono debe tener exactamente 9 números");
    return valor;
};

// Agregado raíz: Cliente de la tienda.
// El constructor rehidrata (datos ya guardados); `registrar` aplica las reglas para clientes nuevos.
class Cliente {
    constructor({
        id = null, nombre, apellidoPaterno, apellidoMaterno = null,
        telefono, correo, dni, contrasenaHash, saldo = 0,
    }) {
        this.id = id;
        this.nombre = nombre;
        this.apellidoPaterno = apellidoPaterno;
        this.apellidoMaterno = textoOpcional(apellidoMaterno);
        this.telefono = telefono == null ? null : String(telefono);
        this.correo = correo instanceof CorreoElectronico ? correo : CorreoElectronico.desdePersistencia(correo);
        this.dni = dni == null ? null : String(dni);
        this.contrasenaHash = contrasenaHash;
        this.saldo = Number(saldo) || 0;
    }

    // Fábrica para clientes nuevos: aplica todas las reglas de registro
    static registrar({ nombre, apellidoPaterno, telefono, correo, dni, contrasenaHash }) {
        return new Cliente({
            nombre: textoObligatorio(nombre, "El nombre es obligatorio"),
            apellidoPaterno: textoObligatorio(apellidoPaterno, "El apellido paterno es obligatorio"),
            telefono: validarTelefono(telefono),
            correo: new CorreoElectronico(correo),
            dni: validarDni(dni),
            contrasenaHash,
        });
    }

    abonarSaldo(monto) {
        const valor = Number(monto);
        if (!Number.isFinite(valor) || valor < 0) {
            throw new ErrorValidacion("El monto a abonar no es válido");
        }
        this.saldo = redondearMonto(this.saldo + valor);
    }

    // Lo que se devuelve tras iniciar sesión (no expone el hash)
    sesion() {
        return { id: this.id, nombre: this.nombre, correo: this.correo.valor, rol: "cliente" };
    }
}

module.exports = Cliente;
