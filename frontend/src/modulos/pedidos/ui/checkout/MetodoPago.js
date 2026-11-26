import { useState, useEffect } from "react";
import './pago.css'
import { pedidosApi } from "../../infraestructura/pedidosApi";
import { validarPago } from "../../dominio/validarPago";
import FormularioTarjeta from "../compartido/FormularioTarjeta";

export default function MetodoPago({ id_carrito, id_direccion }) {
  const [totalDeuda, setTotalDeuda] = useState(0);
  const [deudaPedido, setDeudaPedido] = useState(null);
  const [idPedido, setIdPedido] = useState(null);

  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState("");

  const [tarjeta, setTarjeta] = useState({
    numero: "",
    nombre: "",
    correo: "",
    fecha: "",
    cvv: ""
  });

  const [errores, setErrores] = useState({});
  useEffect(() => {
    if (!id_carrito) return;
    cargarDeudaCarrito();
  }, [id_carrito]);
  const cargarDeudaCarrito = async () => {
    try {
      const data = await pedidosApi.deudaDeCarrito(id_carrito);
      setTotalDeuda(data.deuda ?? 0);
    } catch (err) {
      console.error("Error cargando deuda carrito:", err);
    }
  };
  const cargarDeudaPedido = async (id_pedido) => {
    try {
      const data = await pedidosApi.deudaDePedido(id_pedido);
      setDeudaPedido(Number(data.deuda) || 0);
    } catch (err) {
      console.error("Error cargando deuda pedido:", err);
    }
  };
  const validar = () => {
    const deudaActual = Number(idPedido ? deudaPedido : totalDeuda);
    const e = validarPago({ monto, deudaActual, metodo, tarjeta });
    setErrores(e);
    return Object.keys(e).length === 0;
  };
  const procesarPago = async () => {
    if (!validar()) return;

    try {
      let pedidoActual = idPedido;

      if (!pedidoActual) {
        // El backend decide el estado: el pedido nace pendiente y pasa a pagado cuando la deuda llega a 0
        let jsonPedido;
        try {
          jsonPedido = await pedidosApi.crear({ id_carrito, id_direccion });
        } catch (err) {
          return alert(err.message);
        }

        pedidoActual = jsonPedido.id_pedido;
        setIdPedido(pedidoActual);
      }
      let jsonPago;
      try {
        jsonPago = await pedidosApi.registrarPago({
          id_pedido: pedidoActual,
          metodo_pago: metodo,
          monto: Number(monto)
        });
      } catch (err) {
        return alert(err.message);
      }

      alert("Pago registrado correctamente");

      await cargarDeudaPedido(pedidoActual);

      if (jsonPago.deudaRestante <= 0) {
        alert("Pago finalizado");
        window.location.href = "/productos";
        return;
      }

      setMonto("");
    } catch (err) {
      console.error("Error procesando pago:", err);
      alert("Error procesando pago");
    }
  };
  const deudaMostrada = idPedido ? deudaPedido : totalDeuda;

  return (
    <div className="pago-deuda">
      <h2>Deuda actual</h2>
      <div>
        <p>
          <strong>S/ {deudaMostrada}</strong>
        </p>
      </div>

      <input
        className="p-2 border rounded w-full"
        placeholder="Ingrese monto a pagar"
        type="number"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
      />
      {errores.monto && <p className="text-red-500 text-sm">{errores.monto}</p>}

      <div className="space-y-2">
        <label>
          <input type="radio" name="mp" value="paypal" onChange={() => setMetodo("paypal")} />
          PayPal
        </label>
        <br />
        <label>
          <input type="radio" name="mp" value="tarjeta" onChange={() => setMetodo("tarjeta")} />
          Tarjeta
        </label>
      </div>

      {metodo === "tarjeta" && (
        <FormularioTarjeta tarjeta={tarjeta} setTarjeta={setTarjeta} errores={errores} />
      )}

      <button onClick={procesarPago}>
        Pagar
      </button>
    </div>
  );
}