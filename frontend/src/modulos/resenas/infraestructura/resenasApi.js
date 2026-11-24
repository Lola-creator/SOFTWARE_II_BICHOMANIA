import { pedir } from "../../../compartido/infraestructura/clienteHttp";

export const resenasApi = {
  listar: (idProducto) => pedir(`/resenas/${idProducto}`),
  crear: (resena) => pedir("/resenas", { metodo: "POST", cuerpo: resena }),
  editar: (idResena, cambios) => pedir(`/resenas/${idResena}`, { metodo: "PUT", cuerpo: cambios }),
  eliminar: (idResena, idCliente) => pedir(`/resenas/${idResena}`, { metodo: "DELETE", cuerpo: { id_cliente: idCliente } }),
};
