import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";

// Estructura de la app
import Header from "./layout/header/Header";
import Footer from "./layout/footer/footer";
import Home from "./paginas/home/Home";
import RequireAuth from "./rutas/RequireAuth";
import RequireEmpleado from "./rutas/RequireEmpleado";

// Identidad (clientes y empleados)
import Login from "../modulos/identidad/ui/login/Login";
import Registro from "../modulos/identidad/ui/registro/Registro";
import Profile from "../modulos/identidad/ui/perfil/Perfil";

// Catálogo
import Productos from "../modulos/catalogo/ui/productos/Productos";
import ProductoDetalles from "../modulos/catalogo/ui/detalles/Detalles";
import AgregarProducto from "../modulos/catalogo/ui/gestion-productos/AgregarProducto";
import EliminarProducto from "../modulos/catalogo/ui/gestion-productos/EliminarProducto";
import ModificarItem from "../modulos/catalogo/ui/clasificaciones/modificar-categorias";

// Carrito, pedidos y pagos
import Carrito from "../modulos/carrito/ui/Carrito";
import Pedido from "../modulos/pedidos/ui/checkout/Pedido";
import Deuda from "../modulos/pedidos/ui/deudas/Deuda";

// Reseñas y encuestas
import Resena from "../modulos/resenas/ui/Resenas";
import Encuesta from "../modulos/encuestas/ui/gestion/Encuesta";
import ResponderEncuestas from "../modulos/encuestas/ui/responder/responder-encuestas";

function ResenasDeProducto() {
  const { id } = useParams();
  return <Resena idProducto={id} />;
}

function App() {
  return (
    <Router>
      <Header /> 
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login-user" element={<Login tipo="user" />} />
          <Route path="/login-employee" element={<Login tipo="employee" />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/agregar" element={<RequireEmpleado><AgregarProducto /></RequireEmpleado>}/>
          <Route path="/profile" element={ <RequireAuth> <Profile /> </RequireAuth>} /> 
          <Route path="/encuestas" element={<Encuesta/>} /> 
          <Route path="/responder-encuestas" element={<ResponderEncuestas />} />
          <Route path="/pedidos" element={<Pedido/>} /> 
          <Route path="/resenas/:id" element={<ResenasDeProducto />} />
          <Route path="/deudas" element={<Deuda/>} />
          <Route path="/productos/eliminar/:id" element={<EliminarProducto />} />
          <Route path="/producto/:id" element={<ProductoDetalles />} />
          <Route path="/carrito" element={ <RequireAuth><Carrito/></RequireAuth>} /> 
            <Route path="/modificar_item" element={<ModificarItem/>} />
        </Routes>
      <Footer />
    </Router>
  );
}

export default App;
