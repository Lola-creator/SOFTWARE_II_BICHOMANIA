import { render, screen, fireEvent } from "@testing-library/react";
import ResponderEncuestas from "../../modulos/encuestas/ui/responder/responder-encuestas";
import { encuestasApi } from "../../modulos/encuestas/infraestructura/encuestasApi";

jest.mock("../../modulos/encuestas/infraestructura/encuestasApi", () => ({
  encuestasApi: { activas: jest.fn(), yaVoto: jest.fn(), detalles: jest.fn(), votar: jest.fn() },
}));

describe("ResponderEncuestas", () => {
  beforeEach(() => {
    localStorage.setItem("id_usuario", "4");
    window.alert = jest.fn();
    encuestasApi.activas.mockResolvedValue([
      { id_encuesta: 1, descripcion: "¿Cual es tu equipo favorito?", fecha_inicio: "2026-10-01", fecha_fin: "2026-10-31" },
    ]);
    encuestasApi.yaVoto.mockResolvedValue({ yaVoto: false });
    encuestasApi.detalles.mockResolvedValue([
      { id_detalle: 11, opcion_equipo: "Real Madrid", opcion_liga: "LaLiga", categoria: "Camisetas" },
    ]);
    encuestasApi.votar.mockResolvedValue({ msg: "Voto registrado" });
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("cada encuesta se elige con un boton", async () => {
    render(<ResponderEncuestas />);

    const boton = await screen.findByRole("button", { name: /equipo favorito/ });
    fireEvent.click(boton);

    expect(boton).toHaveAttribute("type", "button");
    expect(encuestasApi.detalles).toHaveBeenCalledWith(1);
  });

  test("cada opcion se vota con un boton", async () => {
    render(<ResponderEncuestas />);
    fireEvent.click(await screen.findByRole("button", { name: /equipo favorito/ }));

    fireEvent.click(await screen.findByRole("button", { name: /Real Madrid/ }));
    await screen.findByText("No tienes encuestas disponibles para responder.");

    expect(encuestasApi.votar).toHaveBeenCalledWith("4", 1, 11);
  });
});
