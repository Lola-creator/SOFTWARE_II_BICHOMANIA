import { useState, useEffect } from "react";
import './EP.css';
import { catalogoApi } from "../../infraestructura/catalogoApi";
import { urlImagenProducto } from "../../dominio/imagenProducto";
export default function EliminarProducto() {
  const [categorias, setCategorias] = useState([]);
  const [competencias, setCompetencias] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [marcas, setMarcas] = useState([]);

  const [productos, setProductos] = useState([]);

  const [filtros, setFiltros] = useState({
    categoria: "",
    competencia: "",
    equipo: "",
    marca: "",
    nombre: ""
  });

  useEffect(() => {
    catalogoApi.listas()
      .then(data => {
        setCategorias(data.categorias);
        setCompetencias(data.competencias);
        setEquipos(data.equipos);
        setMarcas(data.marcas);
      });
  }, []);

  const buscarProductos = () => {
    catalogoApi.buscarProductos(filtros)
      .then(data => setProductos(data));
  };

  const eliminarProducto = async (id_producto, nombre) => {
    const ok = window.confirm(`¿Seguro que quieres eliminar "${nombre}"?`);
    if (!ok) return;

    try {
      await catalogoApi.eliminarProducto(id_producto);

      alert("Producto eliminado correctamente");
      buscarProductos();
    } catch (err) {
      console.error(err);
      alert(err.estado ? err.message || "Error al eliminar" : "Error al eliminar producto");
    }
  };

  return (
    <div className="content-EP1">
      <h1>Eliminar Productos</h1>

      <div className="content-EP">
        <input
          placeholder="Buscar por nombre..."
          value={filtros.nombre}
          onChange={(e) => {
            setFiltros({ ...filtros, nombre: e.target.value });
            buscarProductos(); 
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") buscarProductos(); 
          }}
        />

        <select onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}>
          <option value="">Categoría</option>
          {categorias.map(c => (
            <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
          ))}
        </select>

        <select onChange={(e) => setFiltros({ ...filtros, competencia: e.target.value })}>
          <option value="">Competencia</option>
          {competencias.map(x => (
            <option key={x.id_competencia} value={x.id_competencia}>{x.nombre}</option>
          ))}
        </select>

        <select onChange={(e) => setFiltros({ ...filtros, equipo: e.target.value })}>
          <option value="">Equipo</option>
          {equipos.map(e => (
            <option key={e.id_equipo} value={e.id_equipo}>{e.nombre}</option>
          ))}
        </select>

        <select onChange={(e) => setFiltros({ ...filtros, marca: e.target.value })}>
          <option value="">Marca</option>
          {marcas.map(m => (
            <option key={m.id_marca} value={m.id_marca}>{m.nombre}</option>
          ))}
        </select>

        <button onClick={buscarProductos}>Buscar</button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {productos.map(p => (
          <div
            key={p.id_producto}
            style={{
              width: "200px",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "10px"
            }}
          >
            <img
              src={urlImagenProducto(p.imagen)}
              alt={p.nombre_producto}
              style={{ width: "100%", height: "150px", objectFit: "cover" }}
            />

            <h3>{p.nombre_producto}</h3>
            <p>Precio: S/. {p.precio}</p>

            <button
              onClick={() => eliminarProducto(p.id_producto, p.nombre_producto)}
              style={{
                background: "red",
                color: "white",
                width: "100%",
                marginTop: "10px",
                padding: "8px"
              }}
            >
              ELIMINAR
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
