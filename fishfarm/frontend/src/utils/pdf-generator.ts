import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Sale, Expense, PLStatement } from '../types/financials.types';

export const generateInvoice = (sale: Sale, farmDetails: { name: string, address: string, phone: string }) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('TAX INVOICE', 105, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(farmDetails.name, 14, 25);
  doc.setFontSize(10);
  doc.text(farmDetails.address, 14, 30);
  doc.text(`Phone: ${farmDetails.phone}`, 14, 35);
  
  // Invoice Details
  doc.text(`Invoice No: ${sale.invoiceNumber || 'N/A'}`, 140, 25);
  doc.text(`Date: ${format(new Date(sale.saleDate), 'dd MMM yyyy')}`, 140, 30);
  
  // Buyer Details
  doc.text('Bill To:', 14, 45);
  doc.text(sale.buyerName, 14, 50);
  if (sale.buyerPhone) doc.text(`Phone: ${sale.buyerPhone}`, 14, 55);
  if (sale.buyerLocation) doc.text(`Location: ${sale.buyerLocation}`, 14, 60);

  // Table
  autoTable(doc, {
    startY: 70,
    head: [['Description', 'Quantity (Kg)', 'Price/Kg', 'Amount (INR)']],
    body: [
      ['Fish Sale', sale.fishQuantityKg.toString(), sale.pricePerKg.toString(), sale.totalAmount.toString()],
      ...(sale.transportIncluded && sale.transportCostKg ? [['Transport', sale.fishQuantityKg.toString(), sale.transportCostKg.toString(), (sale.fishQuantityKg * sale.transportCostKg).toString()]] : [])
    ],
    foot: [
      ['', '', 'Total:', sale.totalAmount.toString()],
      ['', '', 'Advance:', sale.advanceReceived.toString()],
      ['', '', 'Balance Due:', sale.balancePending.toString()]
    ],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] }
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || 100;
  doc.text(`Payment Status: ${sale.paymentStatus}`, 14, finalY + 10);
  if (sale.paymentMethod) doc.text(`Payment Method: ${sale.paymentMethod}`, 14, finalY + 15);
  if (sale.notes) doc.text(`Notes: ${sale.notes}`, 14, finalY + 20);

  doc.text('Authorized Signatory', 140, finalY + 30);
  doc.save(`${sale.invoiceNumber || 'Invoice'}.pdf`);
};

export const generatePLStatement = (pl: PLStatement, farmDetails: { name: string }) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Profit & Loss Statement', 105, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(farmDetails.name, 105, 22, { align: 'center' });
  doc.text(`Period: ${pl.period.replace('_', ' ').toUpperCase()}`, 105, 29, { align: 'center' });

  autoTable(doc, {
    startY: 40,
    head: [['Category', 'Amount (INR)']],
    body: [
      ['INCOME', ''],
      ['Fish Sales', pl.incomeBySource.fishSales.toString()],
      ['Other Income', pl.incomeBySource.otherIncome.toString()],
      ['Total Income', pl.totalIncome.toString()],
      ['', ''],
      ['EXPENSES', ''],
      ...pl.expensesByCategory.map(e => [e.label, e.total.toString()]),
      ['Total Expenses', pl.totalExpenses.toString()],
      ['', ''],
      ['NET PROFIT/LOSS', pl.netProfit.toString()]
    ],
    theme: 'striped',
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' }
    },
    didParseCell: function (data) {
      if (data.row.index === 3 || data.row.index === pl.expensesByCategory.length + 7 || data.row.index === pl.expensesByCategory.length + 9) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 240];
      }
    }
  });

  doc.save(`PL_Statement_${pl.period}.pdf`);
};
