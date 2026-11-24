import { pedir, consulta } from "../../../compartido/infraestructura/clienteHttp";

export const catalogoApi = {
  listas: () => pedir("/listas"),
  buscarProductos: (filtros) => pedir(`/productos${consulta(filtros)}`),
  detalleProducto: (id) => pedir(`/producto/${id}`),
  agregarProducto: (formulario) => pedir("/productos/agregar", { metodo: "POST", formulario }),
  editarProducto: (id, formulario) => pedir(`/productos/editar/${id}`, { metodo: "PUT", formulario }),
  eliminarProducto: (id) => pedir(`/productos/eliminar/${id}`, { metodo: "DELETE" }),

  // Clasificaciones: tipo = "categorias" | "marcas" | "equipos" | "competencias"
  listarClasificacion: (tipo) => pedir(`/${tipo}`),
  agregarClasificacion: (tipo, datos) => pedir(`/${tipo}`, { metodo: "POST", cuerpo: datos }),
  eliminarClasificacion: (tipo, id) => pedir(`/${tipo}/${id}`, { metodo: "DELETE" }),
};
