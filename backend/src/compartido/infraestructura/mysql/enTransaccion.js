// Ejecuta `trabajo(conexion)` dentro de una transacción MySQL.
const enTransaccion = async (pool, trabajo) => {
    const conexion = await pool.getConnection();
    try {
        await conexion.beginTransaction();
        const resultado = await trabajo(conexion);
        await conexion.commit();
        return resultado;
    } catch (error) {
        await conexion.rollback();
        throw error;
    } finally {
        conexion.release();
    }
};

module.exports = enTransaccion;
