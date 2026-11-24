const RepositorioUbicaciones = require("../../dominio/RepositorioUbicaciones");
const { mismoId } = require("../../../../compartido/infraestructura/memoria/BaseDatosMemoria");

class UbicacionRepositoryMemoria extends RepositorioUbicaciones {
    constructor(bd) { super(); this.bd = bd; }

    async listarPaises() {
        return this.bd.tabla("paises").map(({ id_pais, nombre }) => ({ id_pais, nombre }));
    }

    async guardarPais(pais) {
        if (pais.id) return this.bd.actualizar("paises", (p) => mismoId(p.id_pais, pais.id), { nombre: pais.nombre });
        return this.bd.insertar("paises", "id_pais", { nombre: pais.nombre });
    }

    async listarCiudades(idPais) {
        return this.bd.buscar("ciudades", (c) => mismoId(c.id_pais, idPais)).map(({ id_ciudad, nombre }) => ({ id_ciudad, nombre }));
    }

    async guardarCiudad(ciudad) {
        const datos = { nombre: ciudad.nombre, id_pais: Number(ciudad.idPais) };
        if (ciudad.id) return this.bd.actualizar("ciudades", (c) => mismoId(c.id_ciudad, ciudad.id), datos);
        return this.bd.insertar("ciudades", "id_ciudad", datos);
    }

    async listarDirecciones(idCliente) {
        return this.bd.buscar("direcciones", (d) => mismoId(d.id_cliente, idCliente)).map((d) => {
            const ciudad = this.bd.primero("ciudades", (c) => mismoId(c.id_ciudad, d.id_ciudad)) || {};
            const pais = this.bd.primero("paises", (p) => mismoId(p.id_pais, ciudad.id_pais)) || {};
            return {
                id_direccion: d.id_direccion, calle: d.calle, distrito: d.distrito, referencia: d.referencia,
                codigo_postal: d.codigo_postal, ciudad: ciudad.nombre ?? null, nombre: pais.nombre ?? null,
            };
        });
    }

    async guardarDireccion(d) {
        return this.bd.insertar("direcciones", "id_direccion", {
            distrito: d.distrito, calle: d.calle, referencia: d.referencia, codigo_postal: d.codigoPostal,
            id_cliente: Number(d.idCliente), id_ciudad: Number(d.idCiudad),
        });
    }
}

module.exports = UbicacionRepositoryMemoria;
