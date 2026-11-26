const enTransaccionMemoria = async (bd, trabajo) => {
    const respaldo = structuredClone({ tablas: bd.tablas, secuencias: bd.secuencias });
    try {
        return await trabajo(bd);
    } catch (error) {
        bd.tablas = respaldo.tablas;
        bd.secuencias = respaldo.secuencias;
        throw error;
    }
};

module.exports = enTransaccionMemoria;
