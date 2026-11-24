import React, { useState, useEffect } from "react";
import './modificar.css';
import { catalogoApi } from "../../infraestructura/catalogoApi";

// tipo de la pantalla → tipo de clasificación del backend
const TIPOS_API = { categoria: "categorias", equipo: "equipos", marca: "marcas", competencia: "competencias" };

export default function GestionListas() {
  const [tipo, setTipo] = useState("");
  const [items, setItems] = useState([]);
  const [nuevo, setNuevo] = useState("");
  const [pais, setPais] = useState("");
  const [loading, setLoading] = useState(false);


  const cargarDatos = async () => {
    if (!tipo) return;
    setLoading(true);

    try {
      setItems(await catalogoApi.listarClasificacion(TIPOS_API[tipo]));
    } catch (err) {
      console.error(err);
      alert("Error cargando datos.");
    }

    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, [tipo]);



  const agregar = async () => {
    if (!nuevo.trim()) {
      alert("Ingresa un nombre");
      return;
    }

    try {
      let body = { nombre: nuevo };

      if (tipo === "equipo" || tipo === "marca") {
        if (!pais.trim()) return alert("Debes ingresar el país.");
        body.pais = pais;
      }

      await catalogoApi.agregarClasificacion(TIPOS_API[tipo], body);

      alert("Agregado correctamente");
      setNuevo("");
      setPais("");
      cargarDatos();
    } catch (err) {
      console.error(err);
      alert(err.estado ? err.message : "Error al agregar.");
    }
  };


  const eliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar?")) return;

    try {
      await catalogoApi.eliminarClasificacion(TIPOS_API[tipo], id);

      alert("Eliminado correctamente");
      cargarDatos();
    } catch (err) {
      console.error(err);
      alert(err.estado ? err.message : "Error al eliminar.");
    }
  };



  const getItemId = (item) => {
    switch (tipo) {
      case "categoria":
        return item.id_categoria;
      case "equipo":
        return item.id_equipo;
      case "marca":
        return item.id_marca;
      case "competencia":
        return item.id_competencia;
      default:
        return item.id;
    }
  };


  return (
    <div className = 'home' style={{ 
        backgroundImage: "url('/registro/maracana.jpg')", 
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        minHeight: "100vh",
        width: "100%"
        }}>

      <div className="cuadro-gestion">
        <h2>Gestión de Listas</h2>
        <div className="cuadro-opcion">
        <button onClick={() => setTipo("categoria")}>Categorías</button>
        <button onClick={() => setTipo("equipo")}>Equipos</button>
        <button onClick={() => setTipo("marca")}>Marcas</button>
        <button onClick={() => setTipo("competencia")}>Competencias</button>
        </div>
      </div>
      <div className="cuadro-ad">
      {tipo && <h3>Administrando: <strong>{tipo.toUpperCase()}</strong></h3>}

      {tipo && (
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Nuevo nombre"
            value={nuevo}
            onChange={(e) => setNuevo(e.target.value)}
          />

          {(tipo === "equipo" || tipo === "marca") && (
            <input
              type="text"
              placeholder="País"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              style={{ marginLeft: 10 }}
            />
          )}

          <button onClick={agregar} style={{ marginLeft: 10 }}>
            Agregar
          </button>
        </div>
      )}
      </div>
      <div className="lista"> 
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <ul>
          {items.map((item) => {
            const id = getItemId(item);

            return (
              <li key={id} style={{ marginBottom: 10 }}>
                <strong>{item.nombre}</strong>

                {item.pais && <span> — {item.pais}</span>}

                <button
                  onClick={() => eliminar(id)}
                  style={{ marginLeft: 15 }}
                >
                  Eliminar
                </button>
              </li>
            );
          })}
        </ul>
      )}
      </div>
    </div>
  );
}