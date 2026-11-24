import { render, screen } from "@testing-library/react";
import Footer from "../../app/layout/footer/footer";

const OPCIONES = [
  "Contacto", "Entrega y retorno", "FQA",
  "Rodrigo Ccallo", "Fernanda Cruz", "Paolo Avalos", "Sabrina Flores",
  "Politicas", "No vendas tu informacion",
  "Instagram", "Twitter", "YouTube",
];

describe("Footer", () => {
  test("no tiene enlaces que apunten a #", () => {
    render(<Footer />);

    const enlaces = screen.queryAllByRole("link");

    expect(enlaces).toHaveLength(0);
  });

  test.each(OPCIONES)("la opcion %s es un boton que no envia formularios", (nombre) => {
    render(<Footer />);

    const boton = screen.getByRole("button", { name: nombre });

    expect(boton).toHaveAttribute("type", "button");
  });

  test("mantiene la clase dorado en las opciones", () => {
    render(<Footer />);

    const botones = OPCIONES.map((nombre) => screen.getByRole("button", { name: nombre }));

    botones.forEach((boton) => expect(boton).toHaveClass("dorado"));
  });
});
