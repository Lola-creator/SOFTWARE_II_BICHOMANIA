import { render, screen } from "@testing-library/react";
import MetodoPagoCheckout from "../../modulos/pedidos/ui/checkout/MetodoPago";
import MetodoPagoDeudas from "../../modulos/pedidos/ui/deudas/MetodoPago";

jest.mock("../../modulos/pedidos/infraestructura/pedidosApi", () => ({
  pedidosApi: { deudaDeCarrito: jest.fn(), deudaDePedido: jest.fn(), crear: jest.fn(), registrarPago: jest.fn() },
}));

const textoDeEtiqueta = (nombre) => screen.getByText(nombre).textContent;

describe.each([
  ["checkout", MetodoPagoCheckout],
  ["deudas", MetodoPagoDeudas],
])("MetodoPago de %s", (_, MetodoPago) => {
  test("deja un espacio explicito entre el radio y el texto", () => {
    render(<MetodoPago />);

    const paypal = textoDeEtiqueta("PayPal");
    const tarjeta = textoDeEtiqueta("Tarjeta");

    expect(paypal).toBe(" PayPal");
    expect(tarjeta).toBe(" Tarjeta");
  });
});
