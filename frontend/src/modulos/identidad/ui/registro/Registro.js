import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './registro.css'
import { identidadApi } from "../../infraestructura/identidadApi";
import { validarRegistro } from "../../dominio/reglasRegistro";
export default function Registro() {
  const [cliente, setCliente] = useState({
    correo_electronico: "",
    nombre: "",
    apellido_paterno: "",
    telefono: "",
    dni: "",
    contrasena: ""
  });

    const navigate = useNavigate();
  const actualizar = (e) => {
    setCliente({
      ...cliente,
      [e.target.name]: e.target.value
    });
  };

  const validar = () => {
    const error = validarRegistro(cliente);
    if (error) {
      alert(error);
      return false;
    }
    return true;
  };


  const registrarCliente = (e) => {
    e.preventDefault(); // evita recargar la página
    if (!validar()) return;
    identidadApi.registrar(cliente)
      .then((msg) => {
        alert(msg.message);
        console.log("Enviado:", cliente);
        
        navigate("/login-user");


      })
      .catch(err => {
        alert(err.message);
        console.error("ERROR FRONT:", err);
      });

  };

  return (
    <div
      className="fondo"
      style={{ 
        backgroundImage: "url('/registro/registro.jpg')", 
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        minHeight: "100vh",
        width: "100%"
      }}
    >
      <div className="cuadro-registro">
        <div className="texto">
          <span>DATOS: </span>
        </div>

        <form className="campo-registro" onSubmit={registrarCliente}>
          <input
            type="text"
            placeholder="*Email address"
            name="correo_electronico"
            value={cliente.correo_electronico}
            onChange={actualizar}
            required
          />

          <input
            type="text"
            placeholder="*Nombre"
            name="nombre"
            value={cliente.nombre}
            onChange={actualizar}
            required
          />

          <input
            type="text"
            placeholder="*Apellido Paterno"
            name="apellido_paterno"
            value={cliente.apellido_paterno}
            onChange={actualizar}
            required
          />

          <div className="tDNI">
            <input
              type="text"
              placeholder="*Telefono"
              name="telefono"
              value={cliente.telefono}
              onChange={actualizar}
            />

            <input
              type="text"
              placeholder="*DNI"
              name="dni"
              value={cliente.dni}
              onChange={actualizar}
              required
            />
          </div>

          <div className="contraseña">

            <input
              type="password"
              placeholder="*Contraseña"
              name="contrasena"
              value={cliente.contrasena}
              onChange={actualizar}
              required
            />
          </div>

          <button className="boton" type="submit">
            REGISTRARME
          </button>
        </form>

      </div>
    </div>
  );
}