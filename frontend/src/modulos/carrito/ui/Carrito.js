import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { carritoApi } from "../infraestructura/carritoApi";
import { sesion } from "../../../compartido/infraestructura/sesion";
export default function Carrito() {
  const [items, setItems] = useState([]);
  const [idCarrito, setIdCarrito] = useState(null);

  const navigate = useNavigate();
  const id_cliente = sesion.idCliente();

  const cargarCarrito = () => {
    carritoApi.obtener(id_cliente)
      .then(data => {
        if (data.mensaje) setItems([]); 
        else 
          {
            setItems(data.productos);
        setIdCarrito(data.id_carrito);
          }
      })
      .catch(err => console.error("Error cargando carrito:", err));
  };

  useEffect(() => {
    cargarCarrito();
  }, []);

  const actualizarCantidad = (id_producto, nuevaCantidad) => {
    carritoApi.actualizarCantidad(id_cliente, id_producto, nuevaCantidad)
      .then(() => cargarCarrito())
      .catch(err => alert(err.message));
  };

  const eliminarItem = (id_producto) => {
    carritoApi.eliminarItem(id_cliente, id_producto)
      .then(() => cargarCarrito())
      .catch(err => alert(err.message));
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Mi carrito</h1>

      {items.length === 0 && <p>Carrito vacío</p>}

      {items.map(item => (
        <div key={item.id_producto} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px" }}>
          <h3>{item.nombre}</h3>
          <p>Precio: S/. {item.precio}</p>
          <p>Cantidad: {item.cantidad}</p>

          <button onClick={() => actualizarCantidad(item.id_producto, item.cantidad + 1)} style ={{backgroundColor:"blue", color:"white"}}>+</button>
          <button onClick={() => actualizarCantidad(item.id_producto, item.cantidad - 1)}style ={{backgroundColor:"black", color:"white"}}>-</button>

          <button onClick={() => eliminarItem(item.id_producto)} style={{ marginLeft: "10px", 
            borderRadius:"5px", backgroundColor:"red", color: "white"}}>
            Eliminar
          </button>
        </div>
      ))}

       <button
  onClick={() => navigate("/pedidos", { state: { idCarrito } })}
  style={{ marginTop: "20px", borderRadius: "5px", backgroundColor:"green", color: "white", fontSize:"20px", hover: "red"}}
>
  Generar Pedido
</button>

    </div>
  );
}
