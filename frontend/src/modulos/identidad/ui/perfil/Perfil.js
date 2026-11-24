import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
 import './perfil.css';
import { identidadApi } from "../../infraestructura/identidadApi";
import { ubicacionesApi } from "../../../ubicaciones/infraestructura/ubicacionesApi";
import { sesion } from "../../../../compartido/infraestructura/sesion";
const Profile = () => {
  const navigate = useNavigate();

  const id_cliente = sesion.idCliente();
  console.log("id:",id_cliente);
  const [usuario, setUsuario] = useState(null);
  const [direcciones, setDirecciones] = useState([]);
  const [mostrarDirecciones, setMostrarDirecciones] = useState(false);
  const [mostrarAgregar, setMostrarAgregar] = useState(false);

  const [paises, setPaises] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  const [form, setForm] = useState({
    distrito: "",
    calle: "",
    referencia: "",
    codigo_postal: "",
    id_pais: "",
    id_ciudad: ""
  });

 
  useEffect(() => {
    identidadApi.perfil(id_cliente)
      .then((data) => {
        setUsuario(data);
      });
  }, []);


  const cargarDirecciones = () => {
     ubicacionesApi.direcciones(id_cliente)
      .then((data) => {
        console.log("DIRECCIONES RECIBIDAS:", data); //
        setDirecciones(data);
        setMostrarDirecciones(true);
      });
  };

  const cargarPaises = () => {
    ubicacionesApi.paises()
      .then((data) => setPaises(data));
  };

  const cargarCiudades = (id_pais) => {
    ubicacionesApi.ciudades(id_pais)
      .then((data) => setCiudades(data));
  };

  const cambiarValor = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });


    if (e.target.name === "id_pais") {
      cargarCiudades(e.target.value);
    }
  };

  const agregarDireccion = (e) => {
    e.preventDefault();

    const body = {
      ...form,
      id_cliente
    };

    ubicacionesApi.agregarDireccion(body)
      .then(() => {
        alert("Dirección agregada correctamente!");
        setMostrarAgregar(false);
        cargarDirecciones(); 
      })
      .catch((err) => alert(err.message));
  };

  if (!usuario) return <p>Cargando perfil...</p>;

  return (
    <div style={{ 
        backgroundImage: "url('/perfil/perfil.jpg')", 
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        minHeight: "100vh",
        width: "100%",
        overflow: "hidden"
        }} >
          <div className = "cuadro-perfil">
            <h2>Perfil del Usuario</h2>

              <p><strong>Nombre:</strong> {usuario.nombre}</p>
              <p><strong>Apellido paterno:</strong> {usuario.apellido_paterno} </p>
              <p><strong>Apellido materno:</strong> {usuario.apellido_materno}</p>
              <p><strong>Correo:</strong> {usuario.correo_electronico}</p>
              <p><strong>Teléfono:</strong> {usuario.telefono}</p>
              <p><strong>DNI:</strong> {usuario.dni}</p>
              <p><strong>Saldo:</strong> {usuario.saldo}</p>

              <hr />
              <div className="abajo-perfil">
                  <button onClick={cargarDirecciones}>Ver direcciones</button>

                  <button onClick={() => { setMostrarAgregar(true); cargarPaises(); }}>
                  Agregar dirección
                  </button>
                  <button onClick={() => navigate("/deudas")}>
                  Ver Deudas
                  </button>
              </div>
          </div>


      {mostrarDirecciones && (
        <div className="direccion">
          <h3>Mis direcciones</h3>

          {direcciones.length === 0 ? (
            <p>No tienes direcciones registradas</p>
          ) : (
            <ul>
              {direcciones.map((d, i) => (
                <li key={i}>
                  <strong>{d.calle}</strong> - {d.distrito}, {d.ciudad} ({d.nombre})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {mostrarAgregar && (
        <div className="AgregarDireccion">
          <h3>Agregar nueva dirección</h3>

          <form onSubmit={agregarDireccion}>
            <input
              type="text"
              name="distrito"
              placeholder="Distrito"
              value={form.distrito}
              onChange={cambiarValor}
              required
            /><br/>

            <input
              type="text"
              name="calle"
              placeholder="Calle"
              value={form.calle}
              onChange={cambiarValor}
              required
            /><br/>

            <input
              type="text"
              name="referencia"
              placeholder="Referencia"
              value={form.referencia}
              onChange={cambiarValor}
              required
            /><br/>

            <input
              type="text"
              name="codigo_postal"
              placeholder="Código Postal"
              value={form.codigo_postal}
              onChange={cambiarValor}
              required
            /><br/>
            <div className ="opcion-dire"> 
            <select name="id_pais" value={form.id_pais} onChange={cambiarValor} required>
              <option value="">Seleccione un país</option>
              {paises.map((p) => (
                <option key={p.id_pais} value={p.id_pais}>
                  {p.nombre}
                </option>
              ))}
            </select><br/>


            <select name="id_ciudad" value={form.id_ciudad} onChange={cambiarValor} required>
              <option value="">Seleccione una ciudad</option>
              {ciudades.map((c) => (
                <option key={c.id_ciudad} value={c.id_ciudad}>
                  {c.nombre}
                </option>
              ))}
            </select><br/>
            </div>
            <button type="submit">Guardar</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
