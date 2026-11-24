const PDFDocument = require("pdfkit");
const { GeneradorBoleta } = require("../dominio/puertos");

const formatoFecha = (fecha) => new Date(fecha).toLocaleDateString("es-PE", {
    day: "2-digit", month: "long", year: "numeric",
});

// Adaptador: dibuja una Boleta del dominio como PDF sobre un stream (p. ej. la respuesta HTTP)
class BoletaPdfKit extends GeneradorBoleta {
    generar(boleta, destino) {
        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(destino);

        doc.fontSize(20).text(`Boleta Pedido #${boleta.idPedido}`, { align: "center" });
        doc.fontSize(12).text(`Fecha de emisión: ${formatoFecha(boleta.fechaEmision)}`);
        doc.fontSize(12).text(`Fecha del pedido: ${formatoFecha(boleta.fechaPedido)}\n\n`);

        doc.fontSize(16).text("Productos comprados:");
        boleta.productos.forEach((p, i) => {
            doc.fontSize(12)
                .text(`${i + 1}. ${p.nombre} (${p.categoria || "-"})`)
                .text(`   Características: ${p.caracteristica || "-"}`)
                .text(`   Precio: S/. ${p.precio}`)
                .text(`   Cantidad: ${p.cantidad}`)
                .text(`   Competencia: ${p.competencia || "-"}`)
                .text(`   Equipo: ${p.equipo || "-"} (${p.paisEquipo || "-"})\n`);
        });

        doc.moveDown();
        doc.fontSize(16).text("Pagos realizados:");
        boleta.pagos.forEach((pago, i) => {
            doc.fontSize(12).text(`Pago ${i + 1} - ${pago.metodo}: S/. ${pago.monto} (${formatoFecha(pago.fecha)})`);
        });

        doc.moveDown();
        doc.fontSize(14).text(`Total pagado: S/. ${boleta.total}`, { align: "right" });
        doc.end();
    }
}

module.exports = BoletaPdfKit;
