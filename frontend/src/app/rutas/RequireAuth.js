import { Navigate } from "react-router-dom";
import { sesion } from "../../compartido/infraestructura/sesion";

export default function RequireAuth({ children }) {
  if (!sesion.rol()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
