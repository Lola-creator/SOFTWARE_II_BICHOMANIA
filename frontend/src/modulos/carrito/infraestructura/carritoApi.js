import { pedir, consulta } from "../../../compartido/infraestructura/clienteHttp";

export const carritoApi = {
  obtener: (idCliente) => pedir(`/carrito${consulta({ id_cliente: idCliente })}`),
  agregar: (idCliente, idProducto, cantidad = 1) =>
    pedir("/carrito/agregar", { metodo: "POST", cuerpo: { id_cliente: idCliente, id_producto: idProducto, cantidad } }),
  actualizarCantidad: (idCliente, idProducto, cantidad) =>
    pedir("/carrito/actualizar", { metodo: "PUT", cuerpo: { id_cliente: idCliente, id_producto: idProducto, cantidad } }),
  eliminarItem: (idCliente, idProducto) =>
    pedir("/carrito/eliminar-item", { metodo: "DELETE", cuerpo: { id_cliente: idCliente, id_producto: idProducto } }),
  vaciar: (idCliente) => pedir("/carrito/vaciar", { metodo: "DELETE", cuerpo: { id_cliente: idCliente } }),
  total: (idCliente) => pedir(`/carrito/total${consulta({ id_cliente: idCliente })}`),
};
