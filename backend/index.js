// Punto de entrada: carga el entorno, arma el contenedor y levanta el servidor HTTP.
require("dotenv").config({ path: process.env.ENV_FILE || ".env.local" });
const { crearContenedor } = require("./src/arranque/contenedor");
const { sembrarDatosDemo } = require("./src/arranque/persistenciaMemoria");
const crearApp = require("./src/arranque/app");

const PORT = process.env.PORT || 3001;

const iniciar = async () => {
    const contenedor = crearContenedor();
    const { persistencia } = contenedor;

    if (persistencia.nombre === "memoria") {
        await sembrarDatosDemo(persistencia.bd, contenedor.hasheador);
        console.log("⚠ Persistencia EN MEMORIA: los datos se pierden al reiniciar.");
        console.log("  Empleado demo: admin@bichomania.com / Admin1234 · Cliente demo: cliente@gmail.com / Cliente123");
    }

    const servidor = crearApp(contenedor).listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT} (persistencia: ${persistencia.nombre})`);
    });

    process.on("SIGINT", () => {
        servidor.close(async () => {
            await persistencia.cerrar();
            process.exit(0);
        });
    });
};

iniciar();
