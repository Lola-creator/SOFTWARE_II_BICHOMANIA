import { useState, useEffect } from "react";
import './pago.css'
import { pedidosApi } from "../../infraestructura/pedidosApi";
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
    const val = Number(monto);
    let e = {};
    const deudaActual = Number(idPedido ? deudaPedido : totalDeuda);


    if (!val || val <= 0) e.monto = "Debe ingresar un monto válido";
    if (val > deudaActual) e.monto = "No puedes pagar más que la deuda actual";

    if (metodo === "tarjeta") {
      if ((tarjeta.numero || "").length !== 16) e.numero = "Tarjeta inválida";
      if ((tarjeta.nombre || "").length < 3) e.nombre = "Nombre inválido";
      if (!((tarjeta.correo || "").includes("@"))) e.correo = "Correo inválido";
      if (!/^\d{2}\/\d{2}$/.test(tarjeta.fecha)) e.fecha = "Formato MM/YY";
      if ((tarjeta.cvv || "").length !== 3) e.cvv = "CVV inválido";
    }

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
      //setMetodo("");

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
        <div className="grid gap-2 p-4 border rounded-xl">
          <input placeholder="Número de tarjeta" maxLength={16} value={tarjeta.numero}
                 onChange={(e) => setTarjeta({ ...tarjeta, numero: e.target.value })} />
          {errores.numero && <p className="text-red-500 text-sm">{errores.numero}</p>}

          <input placeholder="Nombre" value={tarjeta.nombre}
                 onChange={(e) => setTarjeta({ ...tarjeta, nombre: e.target.value })} />
          {errores.nombre && <p className="text-red-500 text-sm">{errores.nombre}</p>}

          <input placeholder="Correo" value={tarjeta.correo}
                 onChange={(e) => setTarjeta({ ...tarjeta, correo: e.target.value })} />
          {errores.correo && <p className="text-red-500 text-sm">{errores.correo}</p>}

          <input placeholder="MM/YY" maxLength={5} value={tarjeta.fecha}
                 onChange={(e) => setTarjeta({ ...tarjeta, fecha: e.target.value })} />
          {errores.fecha && <p className="text-red-500 text-sm">{errores.fecha}</p>}

          <input placeholder="CVV" maxLength={3} value={tarjeta.cvv}
                 onChange={(e) => setTarjeta({ ...tarjeta, cvv: e.target.value })} />
          {errores.cvv && <p className="text-red-500 text-sm">{errores.cvv}</p>}
        </div>
      )}

      <button  onClick={procesarPago}>
        Pagar
      </button>
    </div>
  );
}
