// Tarea 10 – Unificar los dos componentes MetodoPago (validación en un solo lugar)
import { validarPago } from "./validarPago";

const tarjetaValida = { numero: "4111111111111111", nombre: "Ana Pérez", correo: "ana@gmail.com", fecha: "12/28", cvv: "123" };

describe("validarPago", () => {
  test("un pago válido con tarjeta no tiene errores", () => {
    // Arrange
    const datos = { monto: "50", deudaActual: 100, metodo: "tarjeta", tarjeta: tarjetaValida };
    // Act
    const errores = validarPago(datos);
    // Assert
    expect(errores).toEqual({});
  });

  test.each([["0"], ["-5"], [""], ["abc"]])("rechaza el monto %p", (monto) => {
    expect(validarPago({ monto, deudaActual: 100, metodo: "paypal" }).monto).toBe("Debe ingresar un monto válido");
  });

  test("no permite pagar más que la deuda", () => {
    expect(validarPago({ monto: "150", deudaActual: 100, metodo: "paypal" }).monto)
      .toBe("No puedes pagar más que la deuda actual");
  });

  test("con PayPal no valida la tarjeta", () => {
    expect(validarPago({ monto: "10", deudaActual: 100, metodo: "paypal", tarjeta: {} })).toEqual({});
  });

  test.each([
    ["numero", "4111", "Tarjeta inválida"],
    ["nombre", "An", "Nombre inválido"],
    ["correo", "anagmail.com", "Correo inválido"],
    ["fecha", "1228", "Formato MM/YY"],
    ["cvv", "12", "CVV inválido"],
  ])("tarjeta: %s inválido", (campo, valor, mensaje) => {
    const errores = validarPago({ monto: "10", deudaActual: 100, metodo: "tarjeta", tarjeta: { ...tarjetaValida, [campo]: valor } });
    expect(errores[campo]).toBe(mensaje);
  });
});