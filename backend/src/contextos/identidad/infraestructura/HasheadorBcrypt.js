const bcrypt = require("bcrypt");
const { Hasheador } = require("../dominio/puertos");

class HasheadorBcrypt extends Hasheador {
    constructor(rondas = 10) {
        super();
        this.rondas = rondas;
    }

    hashear(texto) {
        return bcrypt.hash(texto, this.rondas);
    }

    async comparar(texto, hash) {
        if (!hash) return false;
        return bcrypt.compare(texto, hash);
    }
}

module.exports = HasheadorBcrypt;
