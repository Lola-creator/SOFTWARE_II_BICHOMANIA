import { render, screen, fireEvent } from "@testing-library/react";
import Resenas from "../../modulos/resenas/ui/Resenas";
import { resenasApi } from "../../modulos/resenas/infraestructura/resenasApi";

jest.mock("../../modulos/resenas/infraestructura/resenasApi", () => ({
  resenasApi: { listar: jest.fn(), crear: jest.fn(), editar: jest.fn(), eliminar: jest.fn() },
}));

describe("Resenas formulario", () => {
  beforeEach(() => {
    resenasApi.listar.mockResolvedValue([]);
  });

  test("la etiqueta de puntuacion esta asociada a las estrellas", async () => {
    render(<Resenas idProducto={1} />);
    await screen.findByText("No hay reseñas aún.");

    const grupo = screen.getByLabelText("Puntuación:");

    expect(grupo).toHaveAttribute("role", "group");
  });

  test("elegir una estrella no envia la resena", async () => {
    render(<Resenas idProducto={1} />);
    await screen.findByText("No hay reseñas aún.");

    fireEvent.click(screen.getByRole("button", { name: "4 estrellas" }));

    expect(resenasApi.crear).not.toHaveBeenCalled();
  });
});
