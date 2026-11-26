import { useState, useEffect } from "react";
import { pedidosApi } from "../../infraestructura/pedidosApi";
import { validarPago } from "../../dominio/validarPago";
import FormularioTarjeta from "../compartido/FormularioTarjeta";

export default function MetodoPago({ id_pedido, id_carrito, onPagoExitoso }) {
  const [deudaActual, setDeudaActual] = useState(0);
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
    if (!id_pedido && !id_carrito) return;
    cargarDeuda();
  }, [id_pedido, id_carrito]);

  const cargarDeuda = async () => {
    try {
      // Lo que falta pagar del pedido (antes se usaba el total del carrito, sin descontar pagos previos)
      const data = id_pedido
        ? await pedidosApi.deudaDePedido(id_pedido)
        : await pedidosApi.deudaDeCarrito(id_carrito);
      setDeudaActual(Number(data.deuda) || 0);
    } catch (err) {
      console.error("Error cargando deuda carrito:", err);
    }
  };

  const validar = () => {
    const e = validarPago({ monto, deudaActual, metodo, tarjeta });
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const procesarPago = async () => {
    if (!validar()) return;

    try {
      try {
        await pedidosApi.registrarPago({ id_pedido, metodo_pago: metodo, monto: Number(monto) });
      } catch (err) {
        if (!err.estado) throw err;
        return alert(err.message || "Error registrando pago");
      }

      alert("Pago registrado correctamente");

      await cargarDeuda();
      setMonto("");

      if (onPagoExitoso) onPagoExitoso();
    } catch (err) {
      console.error("Error procesando pago:", err);
      alert("Error procesando pago");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold">Ingrese monto</h2>
      <div className="p-4 border rounded-xl text-center">
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

      <button className="p-3 bg-blue-600 text-white rounded-xl w-full" onClick={procesarPago}>
        Pagar
      </button>
    </div>
  );
}