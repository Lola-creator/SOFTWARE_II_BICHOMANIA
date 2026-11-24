import { render, screen, fireEvent } from "@testing-library/react";
import EliminarProducto from "../../modulos/catalogo/ui/gestion-productos/EliminarProducto";
import { catalogoApi } from "../../modulos/catalogo/infraestructura/catalogoApi";

jest.mock("../../compartido/infraestructura/supabaseClient", () => ({
  supabase: { storage: { from: () => ({ getPublicUrl: (ruta) => ({ data: { publicUrl: `https://supabase/${ruta}` } }) }) } },
}));
jest.mock("../../modulos/catalogo/infraestructura/catalogoApi", () => ({
  catalogoApi: { listas: jest.fn(), buscarProductos: jest.fn(), eliminarProducto: jest.fn() },
}));

describe("EliminarProducto", () => {
  test("la imagen de cada producto tiene texto alternativo", async () => {
    catalogoApi.listas.mockResolvedValue({ categorias: [], competencias: [], equipos: [], marcas: [] });
    catalogoApi.buscarProductos.mockResolvedValue([
      { id_producto: 1, nombre_producto: "Camiseta Alianza Lima 2026", precio: 199.9, imagen: "alianza.jpg" },
    ]);
    render(<EliminarProducto />);

    fireEvent.click(screen.getByText("Buscar"));
    const imagen = await screen.findByRole("img", { name: "Camiseta Alianza Lima 2026" });

    expect(imagen).toHaveAttribute("src", "https://supabase/alianza.jpg");
  });
});
