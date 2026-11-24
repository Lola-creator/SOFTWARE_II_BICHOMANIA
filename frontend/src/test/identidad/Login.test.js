import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../../modulos/identidad/ui/login/Login";
import { identidadApi } from "../../modulos/identidad/infraestructura/identidadApi";

jest.mock("../../modulos/identidad/infraestructura/identidadApi", () => ({
  identidadApi: { loginCliente: jest.fn(), loginEmpleado: jest.fn() },
}));

const renderizarLogin = () => render(<MemoryRouter><Login tipo="user" /></MemoryRouter>);

describe("Login ver contrasena", () => {
  test("el control para ver la contrasena es un boton accesible", () => {
    renderizarLogin();

    const boton = screen.getByRole("button", { name: "Mostrar contraseña" });

    expect(boton).toHaveAttribute("type", "button");
  });

  test("al pulsarlo muestra la contrasena y cambia su nombre", () => {
    renderizarLogin();

    fireEvent.click(screen.getByRole("button", { name: "Mostrar contraseña" }));

    expect(screen.getByPlaceholderText("Password")).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ocultar contraseña" })).toBeInTheDocument();
  });

  test("al pulsarlo no se envia el formulario de login", () => {
    renderizarLogin();

    fireEvent.click(screen.getByRole("button", { name: "Mostrar contraseña" }));

    expect(identidadApi.loginCliente).not.toHaveBeenCalled();
  });
});
