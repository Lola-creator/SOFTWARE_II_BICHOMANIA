import { useState, useEffect, useCallback } from "react";
import StarRating from "./Estrellas";
import { resenasApi } from "../infraestructura/resenasApi";
import { sesion } from "../../../compartido/infraestructura/sesion";

export default function Resenas({ idProducto }) {
  const [resenas, setResenas] = useState([]);
  const [nueva, setNueva] = useState({ calificacion: "", puntuacion: 0 });
  const [editandoId, setEditandoId] = useState(null);
  const id_cliente = sesion.idCliente();
  const cargarResenas = useCallback(() => {
    resenasApi.listar(idProducto)
      .then(data => setResenas(data))
      .catch(err => console.error("Error cargando reseñas:", err));
  }, [idProducto]);

  useEffect(() => {
    cargarResenas();
  }, [cargarResenas]);


  const crearResena = (e) => {
    e.preventDefault();

    resenasApi.crear({
      calificacion: nueva.calificacion,
      puntuacion: nueva.puntuacion,
      id_cliente,
      id_producto: idProducto
    })
    .then(() => {
      setNueva({ calificacion: "", puntuacion: 0 });
      cargarResenas();
    })
    .catch(err => alert(err.message));
  };


  const eliminarResena = (id_resena) => {
    resenasApi.eliminar(id_resena, id_cliente)
    .then(() => cargarResenas())
    .catch(err => alert(err.message));
  };


  const guardarEdicion = (id_resena) => {
    resenasApi.editar(id_resena, {
      calificacion: nueva.calificacion,
      puntuacion: nueva.puntuacion,
      id_cliente
    })
    .then(() => {
      setEditandoId(null);
      setNueva({ calificacion: "", puntuacion: 0 });
      cargarResenas();
    })
    .catch(err => alert(err.message));
  };


  return (
    <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #ccc" }}>
      <h2>Reseñas</h2>

      <form onSubmit={editandoId ? (e) => { e.preventDefault(); guardarEdicion(editandoId); } : crearResena}>

        <input
          type="text"
          placeholder="Escribe tu comentario"
          value={nueva.calificacion}
          onChange={(e) => setNueva({ ...nueva, calificacion: e.target.value })}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <label id="etiqueta-puntuacion" htmlFor="puntuacion-resena">Puntuación:</label>
        <StarRating
          id="puntuacion-resena"
          idEtiqueta="etiqueta-puntuacion"
          rating={nueva.puntuacion}
          setRating={(value) => setNueva({ ...nueva, puntuacion: value })}
        />

        <button type="submit" style={{ marginTop: "8px", backgroundColor:"green", fontSize:"20px", fontFamily:"italic", color:"white"}}>
          {editandoId ? "Guardar Cambios" : "Agregar reseña"}
        </button>
      </form>

      <div style={{ marginTop: "20px" }}>
        {resenas.length === 0 && <p>No hay reseñas aún.</p>}

        {resenas.map((r) => (
          <div
            key={r.id_resena}
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px"
            }}
          >
            <strong>{r.cliente_nombre}</strong>

            <div style={{ color: "gold", fontSize: "20px" }}>
              {"★".repeat(r.puntuacion)}
              {"☆".repeat(5 - r.puntuacion)}
            </div>

            <p>{r.calificacion}</p>
            <small>{r.fecha}</small>

            {String(r.id_cliente) === String(id_cliente) && (
              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => {
                    setEditandoId(r.id_resena);
                    setNueva({
                      calificacion: r.calificacion,
                      puntuacion: r.puntuacion
                    });
                  }}
                  style={{ marginRight: "10px",backgroundColor:"blue", 
                    fontSize:"15px", fontFamily:"italic", color:"white" }}
                >
                  Editar
                </button>

                <button onClick={() => eliminarResena(r.id_resena)} style={{ marginRight: "10px",backgroundColor:"red", 
                    fontSize:"15px", fontFamily:"italic", color:"white" }} >
                  Eliminar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
