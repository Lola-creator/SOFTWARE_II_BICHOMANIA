import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Resena from "../../../resenas/ui/Resenas";
import { catalogoApi } from "../../infraestructura/catalogoApi";
import { carritoApi } from "../../../carrito/infraestructura/carritoApi";
import { urlImagenProducto } from "../../dominio/imagenProducto";
import { sesion } from "../../../../compartido/infraestructura/sesion";


export default function ProductoDetalles() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    catalogoApi.detalleProducto(id)
      .then(data => setProducto(data))
      .catch(err => console.error(err));
  }, [id]);

  const agregarAlCarrito = async () => {
    const id_cliente = sesion.idCliente();

    if (!id_cliente) {
      navigate("/login-user");
      return;
    }

    try {
      const data = await carritoApi.agregar(id_cliente, producto.id_producto, 1);
      alert(data.mensaje);
    } catch (err) {
      console.error(err);
    }
  };

  if (!producto) return <p style={{ padding: "20px" }}>Cargando...</p>;

  return (
    <div style={{ padding: "30px" }}>

      <div style={{
        display: "flex",
        gap: "40px",
        alignItems: "flex-start",
        marginBottom: "50px"
      }}>

        <div>
          <img 
            src={urlImagenProducto(producto.imagen)}
            alt={producto.nombre_producto}
            style={{ width: "350px", borderRadius: "10px" }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <h1>{producto.nombre_producto}</h1>

          <p><strong>Precio:</strong> S/. {producto.precio}</p>
          <p><strong>Descripción:</strong> {producto.caracteristica}</p>
          <p><strong>Categoría:</strong> {producto.categoria}</p>
          <p><strong>Competencia:</strong> {producto.competencia}</p>
          <p><strong>Marca:</strong> {producto.marca}</p>
          <p><strong>Equipo:</strong> {producto.equipo}</p>

          <button
            onClick={agregarAlCarrito}
            style={{
              marginTop: "20px",
              padding: "12px 20px",
              backgroundColor: "#2b7cff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            Agregar al carrito
          </button>
        </div>
      </div>

    <Resena idProducto={id} />
      

    </div>
  );
}


