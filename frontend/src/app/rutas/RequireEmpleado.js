import { Navigate } from "react-router-dom";
import { sesion } from "../../compartido/infraestructura/sesion";

export default function RequireEmpleado({ children }) {
  return sesion.esEmpleado() ? children : <Navigate to="/" replace />;
}
