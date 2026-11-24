import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Perfil from "../../modulos/identidad/ui/perfil/Perfil";
import { identidadApi } from "../../modulos/identidad/infraestructura/identidadApi";
import { ubicacionesApi } from "../../modulos/ubicaciones/infraestructura/ubicacionesApi";
import { claveReact } from "../apoyo/claveReact";

jest.mock("../../modulos/identidad/infraestructura/identidadApi", () => ({
  identidadApi: { perfil: jest.fn() },
}));
jest.mock("../../modulos/ubicaciones/infraestructura/ubicacionesApi", () => ({
  ubicacionesApi: { direcciones: jest.fn(), paises: jest.fn(), ciudades: jest.fn(), agregarDireccion: jest.fn() },
}));

describe("Perfil", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  test("cada direccion usa su id_direccion como key", async () => {
    identidadApi.perfil.mockResolvedValue({ nombre: "Ana" });
    ubicacionesApi.direcciones.mockResolvedValue([
      { id_direccion: 7, calle: "Av. Ejercito", distrito: "Cayma", ciudad: "Arequipa", nombre: "Peru" },
      { id_direccion: 9, calle: "Calle Mercaderes", distrito: "Cercado", ciudad: "Arequipa", nombre: "Peru" },
    ]);
    render(<MemoryRouter><Perfil /></MemoryRouter>);

    fireEvent.click(await screen.findByText("Ver direcciones"));
    const direcciones = await screen.findAllByRole("listitem");

    expect(direcciones.map(claveReact)).toEqual(["7", "9"]);
  });
});
