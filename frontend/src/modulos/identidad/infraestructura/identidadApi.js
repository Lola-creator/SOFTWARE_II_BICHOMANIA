import { pedir, consulta } from "../../../compartido/infraestructura/clienteHttp";

export const identidadApi = {
  registrar: (cliente) => pedir("/registrar", { metodo: "POST", cuerpo: cliente }),
  loginCliente: (credenciales) => pedir("/login/user", { metodo: "POST", cuerpo: credenciales }),
  loginEmpleado: (credenciales) => pedir("/login/employee", { metodo: "POST", cuerpo: credenciales }),
  perfil: (idCliente) => pedir(`/profile${consulta({ id_cliente: idCliente })}`),
  listarClientes: () => pedir("/clientes"),
};
