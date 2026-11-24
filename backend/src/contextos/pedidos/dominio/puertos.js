const { exigirImplementacion } = require("../../../compartido/dominio/contratos");

// Persistencia de pedidos y pagos
class RepositorioPedidos {
    async guardar(pedido) { exigirImplementacion("guardar"); }                       // id nuevo
    async guardarYCerrarCarrito(pedido, fechaNuevoCarrito) { exigirImplementacion("guardarYCerrarCarrito"); }
    async obtenerPorId(idPedido) { exigirImplementacion("obtenerPorId"); }           // Pedido (con total, pagos e idCliente) | null
    async guardarPago(pedido, pago) { exigirImplementacion("guardarPago"); }         // inserta el pago y actualiza el estado
    async eliminar(idPedido) { exigirImplementacion("eliminar"); }
    async calcularTotalCarrito(idCarrito) { exigirImplementacion("calcularTotalCarrito"); }
    // Consultas (modelos de lectura para pantallas)
    async listarResumenPorCliente(idCliente, idEstado) { exigirImplementacion("listarResumenPorCliente"); }
    async listarPagos(idPedido) { exigirImplementacion("listarPagos"); }
    async obtenerLineasBoleta(idPedido) { exigirImplementacion("obtenerLineasBoleta"); }
}

// Contexto Carrito visto desde Pedidos: al convertir un carrito en pedido se cierra y se abre uno nuevo
class GestorCarritos {
    async cerrarYAbrirNuevo(idCarrito, fecha) { exigirImplementacion("cerrarYAbrirNuevo"); } // id del carrito nuevo
}

// Contexto Identidad visto desde Pedidos: devolver dinero al saldo del cliente
class MonederoClientes {
    async abonar(idCliente, monto) { exigirImplementacion("abonar"); }
}

// Generación del documento de la boleta (PDF)
class GeneradorBoleta {
    generar(boleta, destino) { exigirImplementacion("generar"); }
}

module.exports = { RepositorioPedidos, GestorCarritos, MonederoClientes, GeneradorBoleta };
