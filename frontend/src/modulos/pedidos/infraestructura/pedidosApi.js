import { pedir, consulta, descargar } from "../../../compartido/infraestructura/clienteHttp";

export const pedidosApi = {
  crear: (datos) => pedir("/pedido/crear", { metodo: "POST", cuerpo: datos }),
  anular: (idPedido) => pedir(`/pedido/eliminar/${idPedido}`, { metodo: "DELETE" }),
  deudaDeCarrito: (idCarrito) => pedir(`/deuda${consulta({ id_carrito: idCarrito })}`),
  deudaDePedido: (idPedido) => pedir(`/pagos/deuda/${idPedido}`),
  registrarPago: (datos) => pedir("/pagos/registrar", { metodo: "POST", cuerpo: datos }),
  pagos: (idPedido) => pedir(`/pagos/${idPedido}`),
  deudas: (idCliente) => pedir(`/deudas/${idCliente}`),
  compras: (idCliente) => pedir(`/compras/${idCliente}`),
  boleta: (idPedido) => descargar(`/boleta/${idPedido}`),
};
