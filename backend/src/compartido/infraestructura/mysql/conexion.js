const mysql = require("mysql2");

// Pool de conexiones MySQL. Devuelve la versión con promesas, que es la que usan los repositorios.
const crearPoolMySQL = (entorno = process.env) => {
    const pool = mysql.createPool({
        host: entorno.DB_HOST,
        user: entorno.DB_USER,
        password: entorno.DB_PASSWORD,
        database: entorno.DB_NAME,
        port: Number(entorno.DB_PORT) || 3306,
        waitForConnections: true,
        connectionLimit: 2,
        maxIdle: 1,
        idleTimeout: 10000,
        queueLimit: 0,
        ssl: entorno.DB_SSL !== "false" ? { rejectUnauthorized: false } : undefined,
    });
    return pool.promise();
};

module.exports = { crearPoolMySQL };
