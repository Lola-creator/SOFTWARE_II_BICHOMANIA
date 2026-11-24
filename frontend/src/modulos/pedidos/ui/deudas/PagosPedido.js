import { useState, useEffect } from "react";
import { pedidosApi } from "../../infraestructura/pedidosApi";

export default function PagosPedido({ id_pedido }) {
  const [pagos, setPagos] = useState([]);

  useEffect(() => {
    if (!id_pedido) return;
    cargarPagos();
  }, [id_pedido]);

  const cargarPagos = async () => {
    try {
      const data = await pedidosApi.pagos(id_pedido);
      setPagos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando pagos:", err);
    }
  };

  if (pagos.length === 0) return null;

  return (
    <div style={{ marginTop: "10px", padding: "10px", borderTop: "1px solid #ccc" }}>
      <strong>Pagos realizados:</strong>
      <ul>
        {pagos.map(p => (
          <li key={p.id_pago}>
            {p.fecha_pago} - {p.metodo_pago} - S/. {p.monto}
          </li>
        ))}
      </ul>
    </div>
  );
}
