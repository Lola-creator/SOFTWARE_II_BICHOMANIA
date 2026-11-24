import { pedir, consulta } from "../../../compartido/infraestructura/clienteHttp";

export const encuestasApi = {
  delEmpleado: (idEmpleado) => pedir(`/encuestas${consulta({ id_empleado: idEmpleado })}`),
  activas: () => pedir("/encuestas-activas"),
  crear: (encuesta) => pedir("/crear_encuesta", { metodo: "POST", cuerpo: encuesta }),
  eliminar: (id, idEmpleado) => pedir(`/eliminar_encuesta/${id}${consulta({ id_empleado: idEmpleado })}`, { metodo: "DELETE" }),
  cerrar: (id, idEmpleado) => pedir(`/cerrar_encuesta/${id}`, { metodo: "PUT", cuerpo: { id_empleado: idEmpleado } }),
  ganadora: (id) => pedir(`/encuesta_ganadora/${id}`),
  detalles: (id) => pedir(`/detalles-encuesta/${id}`),
  yaVoto: (idCliente, idEncuesta) => pedir(`/ya-voto/${idCliente}/${idEncuesta}`),
  votar: (idCliente, idEncuesta, idDetalle) => pedir("/votar", { metodo: "POST", cuerpo: { idCliente, idEncuesta, idDetalle } }),
};
