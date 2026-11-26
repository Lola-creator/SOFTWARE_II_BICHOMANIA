import { render, screen, fireEvent } from "@testing-library/react";
import StarRating from "../../modulos/resenas/ui/Estrellas";

describe("Estrellas", () => {
  test("cada estrella es un boton con nombre", () => {
    render(<StarRating rating={0} setRating={jest.fn()} />);

    const estrellas = screen.getAllByRole("button");

    expect(estrellas.map((estrella) => estrella.getAttribute("aria-label"))).toEqual([
      "1 estrella", "2 estrellas", "3 estrellas", "4 estrellas", "5 estrellas",
    ]);
  });

  test("elegir una estrella envia su puntuacion", () => {
    const setRating = jest.fn();
    render(<StarRating rating={0} setRating={setRating} />);

    fireEvent.click(screen.getByRole("button", { name: "3 estrellas" }));

    expect(setRating).toHaveBeenCalledWith(3);
  });

  test("marca como presionadas las estrellas hasta la puntuacion actual", () => {
    render(<StarRating rating={2} setRating={jest.fn()} />);

    const presionadas = screen.getAllByRole("button", { pressed: true });

    expect(presionadas).toHaveLength(2);
  });
});
