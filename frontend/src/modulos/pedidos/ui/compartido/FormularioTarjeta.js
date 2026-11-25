import { Fragment } from "react";

// Formulario de tarjeta reutilizado por los dos MetodoPago
const CAMPOS = [
  { campo: "numero", placeholder: "Número de tarjeta", maxLength: 16 },
  { campo: "nombre", placeholder: "Nombre" },
  { campo: "correo", placeholder: "Correo" },
  { campo: "fecha", placeholder: "MM/YY", maxLength: 5 },
  { campo: "cvv", placeholder: "CVV", maxLength: 3 },
];

export default function FormularioTarjeta({ tarjeta, setTarjeta, errores }) {
  return (
    <div className="grid gap-2 p-4 border rounded-xl">
      {CAMPOS.map(({ campo, placeholder, maxLength }) => (
        <Fragment key={campo}>
          <input
            placeholder={placeholder}
            maxLength={maxLength}
            value={tarjeta[campo]}
            onChange={(e) => setTarjeta({ ...tarjeta, [campo]: e.target.value })}
          />
          {errores[campo] && <p className="text-red-500 text-sm">{errores[campo]}</p>}
        </Fragment>
      ))}
    </div>
  );
}