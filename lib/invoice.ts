import PDFDocument from 'pdfkit';
import type { Order } from '../types';

export function generateInvoice(order: Order): Buffer {
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  doc.fontSize(20).text('Order Invoice', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Order ID: ${order.uuid}`);
  doc.text(`Date: ${order.createdAt.toDateString()}`);
  doc.text(`Status: ${order.status}`);
  doc.moveDown();
  doc.text(`Product: ${order.product.title}`);
  doc.text(`Quantity: ${order.quantity}`);
  doc.text(`Total: £${order.total}`);

  doc.end();

  return Buffer.concat(chunks);
}
