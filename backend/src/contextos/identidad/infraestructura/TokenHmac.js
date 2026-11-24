const crypto = require("node:crypto");
const { EmisorTokens } = require("../dominio/puertos");
const { ErrorCredenciales } = require("../../../compartido/dominio/errores");

const LONGITUD_MINIMA_SECRETO = 32;
const OCHO_HORAS = 8 * 60 * 60;
const CABECERA = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");

const tokenInvalido = () => new ErrorCredenciales("Token inválido o expirado");

/**
 * Token firmado con HMAC-SHA256 (formato compatible con JWT HS256).
 * Usa solo node:crypto, así no se agrega ninguna dependencia nueva.
 */
class TokenHmac extends EmisorTokens {
    constructor({ secreto, duracionSegundos = OCHO_HORAS, reloj = Date.now } = {}) {
        super();
        if (!secreto || secreto.length < LONGITUD_MINIMA_SECRETO) {
            throw new Error(`El secreto de tokens debe tener al menos ${LONGITUD_MINIMA_SECRETO} caracteres`);
        }
        this.secreto = secreto;
        this.duracionSegundos = duracionSegundos;
        this.reloj = reloj;
    }

    emitir(datosSesion) {
        const ahora = Math.floor(this.reloj() / 1000);
        const carga = { ...datosSesion, iat: ahora, exp: ahora + this.duracionSegundos };
        const contenido = `${CABECERA}.${Buffer.from(JSON.stringify(carga)).toString("base64url")}`;
        return `${contenido}.${this.#firmar(contenido)}`;
    }

    verificar(token) {
        const partes = typeof token === "string" ? token.split(".") : [];
        if (partes.length !== 3) throw tokenInvalido();

        const [cabecera, carga, firma] = partes;
        if (!this.#firmaValida(`${cabecera}.${carga}`, firma)) throw tokenInvalido();

        const datos = this.#leerCarga(carga);
        if (!datos.exp || datos.exp * 1000 <= this.reloj()) throw tokenInvalido();
        return datos;
    }

    #firmar(contenido) {
        return crypto.createHmac("sha256", this.secreto).update(contenido).digest("base64url");
    }

    #firmaValida(contenido, firma) {
        const esperada = Buffer.from(this.#firmar(contenido));
        const recibida = Buffer.from(firma);
        return esperada.length === recibida.length && crypto.timingSafeEqual(esperada, recibida);
    }

    #leerCarga(carga) {
        try {
            return JSON.parse(Buffer.from(carga, "base64url").toString("utf8"));
        } catch {
            throw tokenInvalido();
        }
    }
}

module.exports = TokenHmac;
