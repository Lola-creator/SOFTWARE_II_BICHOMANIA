import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Pedido from "../../modulos/pedidos/ui/checkout/Pedido";
import { ubicacionesApi } from "../../modulos/ubicaciones/infraestructura/ubicacionesApi";
import { claveReact } from "../apoyo/claveReact";

jest.mock("../../modulos/ubicaciones/infraestructura/ubicacionesApi", () => ({
  ubicacionesApi: { direcciones: jest.fn(), paises: jest.fn(), ciudades: jest.fn(), agregarDireccion: jest.fn() },
}));
jest.mock("../../modulos/pedidos/infraestructura/pedidosApi", () => ({
  pedidosApi: { deudaDeCarrito: jest.fn(), deudaDePedido: jest.fn(), crear: jest.fn(), registrarPago: jest.fn() },
}));

describe("Pedido checkout", () => {
  beforeEach(() => {
    localStorage.setItem("id_usuario", "4");
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("cada direccion usa su id_direccion como key", async () => {
    ubicacionesApi.direcciones.mockResolvedValue([
      { id_direccion: 12, calle: "Av. Ejercito", distrito: "Cayma", ciudad: "Arequipa", nombre: "Peru" },
      { id_direccion: 15, calle: "Calle Mercaderes", distrito: "Cercado", ciudad: "Arequipa", nombre: "Peru" },
    ]);
    render(
      <MemoryRouter initialEntries={[{ pathname: "/pedido", state: { idCarrito: 3 } }]}>
        <Pedido />
      </MemoryRouter>
    );

    const direcciones = await screen.findAllByRole("listitem");

    expect(direcciones.map(claveReact)).toEqual(["12", "15"]);
  });
});
