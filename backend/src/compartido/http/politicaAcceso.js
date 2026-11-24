
const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const compilarRegla = (regla) => {
    const [metodo, ruta] = regla.trim().split(/\s+/);
    const patron = ruta.split("/").map((parte) => (parte.startsWith(":") ? "[^/]+" : escaparRegex(parte))).join("/");
    return { metodo: metodo.toUpperCase(), ruta: new RegExp(`^${patron}/?$`) };
};

const crearComprobador = (reglas) => {
    const compiladas = reglas.map(compilarRegla);
    return (metodo, ruta) => compiladas.some((r) => r.metodo === metodo && r.ruta.test(ruta));
};

const leerToken = (req) => {
    const cabecera = req.headers?.authorization || "";
    const [tipo, token] = cabecera.split(" ");
    return tipo === "Bearer" && token ? token : null;
};

const rechazar = (res, codigo, mensaje) => res.status(codigo).json({ error: mensaje });

const crearPoliticaAcceso = ({ verificadorTokens, publicas = [], soloEmpleados = [] }) => {
    const esPublica = crearComprobador(publicas);
    const esSoloEmpleados = crearComprobador(soloEmpleados);

    return (req, res, next) => {
        if (req.method === "OPTIONS" || esPublica(req.method, req.path)) return next();

        const token = leerToken(req);
        if (!token) return rechazar(res, 401, "Token requerido");

        let usuario;
        try {
            usuario = verificadorTokens.verificar(token);
        } catch {
            return rechazar(res, 401, "Token inválido o expirado");
        }

        if (esSoloEmpleados(req.method, req.path) && usuario.rol !== "empleado") {
            return rechazar(res, 403, "Acceso solo para empleados");
        }

        req.usuario = usuario;
        return next();
    };
};

module.exports = { crearPoliticaAcceso };
