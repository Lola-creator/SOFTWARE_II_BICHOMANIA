import { render, screen, fireEvent } from "@testing-library/react";
import Encuestas from "../../modulos/encuestas/ui/gestion/Encuesta";
import { encuestasApi } from "../../modulos/encuestas/infraestructura/encuestasApi";
import { claveDelContenedor } from "../apoyo/claveReact";

jest.mock("../../modulos/encuestas/infraestructura/encuestasApi", () => ({
  encuestasApi: { delEmpleado: jest.fn(), activas: jest.fn(), crear: jest.fn(), eliminar: jest.fn(), cerrar: jest.fn(), ganadora: jest.fn() },
}));
jest.mock("../../modulos/identidad/infraestructura/identidadApi", () => ({
  identidadApi: { listarClientes: jest.fn() },
}));

const clavesDeOpciones = () =>
  screen.getAllByPlaceholderText("Equipo").map(claveDelContenedor);

describe("Encuestas formulario de opciones", () => {
  beforeEach(() => {
    window.alert = jest.fn();
  });

  test("las opciones no usan el indice como key", () => {
    render(<Encuestas />);
    fireEvent.click(screen.getByText("Crear Encuesta"));

    fireEvent.click(screen.getByText("+ Agregar opción"));
    fireEvent.click(screen.getByText("+ Agregar opción"));
    const claves = clavesDeOpciones();

    expect(new Set(claves).size).toBe(3);
    claves.forEach((clave, indice) => expect(clave).not.toBe(String(indice)));
  });

  test("agregar una opcion mantiene la key de las anteriores", () => {
    render(<Encuestas />);
    fireEvent.click(screen.getByText("Crear Encuesta"));
    const clavePrimera = clavesDeOpciones()[0];

    fireEvent.click(screen.getByText("+ Agregar opción"));

    expect(clavesDeOpciones()[0]).toBe(clavePrimera);
  });

  test("al guardar se envian las opciones sin el id interno", async () => {
    encuestasApi.crear.mockResolvedValue("Encuesta creada correctamente");
    encuestasApi.delEmpleado.mockResolvedValue([]);
    render(<Encuestas />);
    fireEvent.click(screen.getByText("Crear Encuesta"));
    fireEvent.click(screen.getByText("+ Agregar opción"));
    const [equipo1, equipo2] = screen.getAllByPlaceholderText("Equipo");
    fireEvent.change(equipo1, { target: { value: "Real Madrid" } });
    fireEvent.change(equipo2, { target: { value: "Barcelona" } });

    fireEvent.click(screen.getByText("Guardar Encuesta"));
    await screen.findByText("Crear Encuesta");

    expect(encuestasApi.crear.mock.calls[0][0].opciones).toEqual([
      { opcion_equipo: "Real Madrid", opcion_liga: "", categoria: "" },
      { opcion_equipo: "Barcelona", opcion_liga: "", categoria: "" },
    ]);
  });
});
