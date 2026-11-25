import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RequireEmpleado from "../../app/rutas/RequireEmpleado";
import { crearToken, crearTokenExpirado } from "../apoyo/crearToken";

const EMPLEADO = { id: 2, rol: "empleado" };
const CLIENTE = { id: 5, rol: "cliente" };

const renderizarGestion = () => render(
  <MemoryRouter initialEntries={["/gestion"]}>
    <Routes>
      <Route path="/" element={<p>Inicio</p>} />
      <Route path="/gestion" element={<RequireEmpleado><p>Panel de gestion</p></RequireEmpleado>} />
    </Routes>
  </MemoryRouter>,
);

describe("RequireEmpleado", () => {
  beforeEach(() => localStorage.clear());

  test("deja pasar con un token de empleado", () => {
    localStorage.setItem("token", crearToken(EMPLEADO));

    renderizarGestion();

    expect(screen.getByText("Panel de gestion")).toBeInTheDocument();
  });

  test("redirige si solo se cambio la clave rol en localStorage", () => {
    localStorage.setItem("token", crearToken(CLIENTE));
    localStorage.setItem("rol", "empleado");

    renderizarGestion();

    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.queryByText("Panel de gestion")).not.toBeInTheDocument();
  });

  test("redirige si hay rol empleado pero no hay token", () => {
    localStorage.setItem("rol", "empleado");

    renderizarGestion();

    expect(screen.getByText("Inicio")).toBeInTheDocument();
  });

  test("redirige si el token de empleado expiro", () => {
    localStorage.setItem("token", crearTokenExpirado(EMPLEADO));

    renderizarGestion();

    expect(screen.getByText("Inicio")).toBeInTheDocument();
  });
});
