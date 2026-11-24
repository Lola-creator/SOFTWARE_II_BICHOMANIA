import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './header.css';
import { sesion } from "../../../compartido/infraestructura/sesion";

export default function Header() {
  const [rol, setRol] = useState(sesion.rol());
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      setRol(sesion.rol());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    sesion.cerrar();
    setRol(null);
    navigate("/");
  };

  // 🔹 Control de acceso: siempre muestra el botón, pero restringe la acción
  const handleClick = (path, allowedRoles) => {
    if (allowedRoles.includes(rol)) {
      navigate(path);
    } else {
      console.log("Acceso restringido: este botón no está disponible para tu rol");
    }
  };

  return (
    <header className="box">
      {/* Logo */}
      <div className="logo">
        <img src="/header/logo.png" alt="logo" />
        <span>LA TIENDA DEL BICHO</span>
      </div>

      {/* Barra de búsqueda */}
      <div className="BusquedaBar">
        <span> BUSCAR PRODUCTO</span>
        <button onClick={() => navigate("/productos")}>
          <img src="/header/icon-search.png" alt="buscar" />
        </button>
      </div>

      {/* Iconos */}
      <div className="iconos-header">
        <div className="iconos">
          {/* Carrito → solo clientes */}
          <button className="btn-im" onClick={() => handleClick("/carrito", ["cliente"])}>
            <img src="/header/carrito.png" alt="carrito" />
          </button>

          {/* Perfil → solo clientes */}
          <button className="btn-im" onClick={() => handleClick("/profile", ["cliente"])}>
            <img src="/header/icono-user.png" alt="user" />
          </button>

          {/* Encuestas → clientes y empleados */}
          {rol === "cliente" && (
            <button
              className="btn-im"
              onClick={() => handleClick("/responder-encuestas", ["cliente"])}
            >
              <img src="/header/encuesta.png" alt="encuesta" />
            </button>
          )}

          {/* Opciones extra para empleados */}
          {rol === "empleado" && (
            <div className ="especial">
              <button
                className="btn-im"
                onClick={() => handleClick("/encuestas", ["empleado"])}
              >
                <img src="/header/encuesta.png" alt="encuesta" />
              </button>
              
              <button className="btn-im" onClick={() => navigate("/productos/agregar")}>
                Editar Productos
              </button>
              <button className="btn-im" onClick={() => navigate("/modificar_item")}>
                Modificar Items
              </button>
            </div>
          )}

          {/* Logout solo si hay rol */}
          {rol && (
            <button className="btn-im" onClick={handleLogout} style={{ marginLeft: "10px" }}>
              <img src="/header/out.png" alt="logout" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}