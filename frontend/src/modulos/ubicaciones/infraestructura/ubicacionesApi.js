import { pedir, consulta } from "../../../compartido/infraestructura/clienteHttp";

export const ubicacionesApi = {
  paises: () => pedir("/paises"),
  ciudades: (idPais) => pedir(`/ciudades${consulta({ id_pais: idPais })}`),
  direcciones: (idCliente) => pedir(`/direccion${consulta({ id_cliente: idCliente })}`),
  agregarDireccion: (direccion) => pedir("/direccionAgregar", { metodo: "POST", cuerpo: direccion }),
};
