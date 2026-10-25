import { Sale, Expense, Product, AuditEvent, Business } from '../types';
import { formatZAR, formatDateSA } from '../utils/formatters';

function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportSalesCSV(businessName: string, sales: Sale[]): void {
  const headers = [
    'Invoice Number',
    'Date',
    'Customer',
    'Items Count',
    'Subtotal (ZAR)',
    'Discount (ZAR)',
    'Total (ZAR)',
    'Paid Amount (ZAR)',
    'Payment Status',
    'Payment Method',
    'Notes',
    'Status'
  ];

  const rows = sales.map(s => [
    s.invoiceNumber,
    s.date,
    `"${(s.customerName || 'Walk-in').replace(/"/g, '""')}"`,
    s.items.reduce((acc, i) => acc + i.quantity, 0),
    s.subtotal.toFixed(2),
    s.discount.toFixed(2),
    s.total.toFixed(2),
    s.paidAmount.toFixed(2),
    s.paymentStatus,
    s.paymentMethod,
    `"${(s.notes || '').replace(/"/g, '""')}"`,
    s.isVoided ? `VOIDED (${s.voidReason || ''})` : 'Active'
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const sanitizedName = businessName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadCSV(`khulabiz_${sanitizedName}_sales_${new Date().toISOString().split('T')[0]}.csv`, csv);
}

export function exportExpensesCSV(businessName: string, expenses: Expense[]): void {
  const headers = [
    'Date',
    'Category',
    'Description',
    'Amount (ZAR)',
    'Payment Method',
    'Supplier',
    'Notes',
    'Status'
  ];

  const rows = expenses.map(e => [
    e.date,
    `"${e.category}"`,
    `"${e.description.replace(/"/g, '""')}"`,
    e.amount.toFixed(2),
    e.paymentMethod,
    `"${(e.supplier || '').replace(/"/g, '""')}"`,
    `"${(e.notes || '').replace(/"/g, '""')}"`,
    e.isVoided ? `VOIDED (${e.voidReason || ''})` : 'Active'
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const sanitizedName = businessName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadCSV(`khulabiz_${sanitizedName}_expenses_${new Date().toISOString().split('T')[0]}.csv`, csv);
}

export function exportInventoryCSV(businessName: string, products: Product[]): void {
  const headers = [
    'Product Name',
    'SKU',
    'Category',
    'Current Stock',
    'Min Threshold',
    'Unit Cost (ZAR)',
    'Selling Price (ZAR)',
    'Est. Stock Value (ZAR)',
    'Supplier',
    'Status'
  ];

  const rows = products.map(p => [
    `"${p.name.replace(/"/g, '""')}"`,
    p.sku,
    `"${p.category}"`,
    p.currentQuantity,
    p.lowStockThreshold,
    p.unitCost.toFixed(2),
    p.sellingPrice.toFixed(2),
    (p.currentQuantity * p.unitCost).toFixed(2),
    `"${(p.supplier || '').replace(/"/g, '""')}"`,
    p.isArchived ? 'Archived' : 'Active'
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const sanitizedName = businessName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadCSV(`khulabiz_${sanitizedName}_stock_${new Date().toISOString().split('T')[0]}.csv`, csv);
}

export function exportAuditCSV(businessName: string, logs: AuditEvent[]): void {
  const headers = [
    'Timestamp',
    'Action',
    'Entity Type',
    'Entity ID',
    'Details'
  ];

  const rows = logs.map(l => [
    l.timestamp,
    l.action,
    l.entityType,
    l.entityId,
    `"${l.details.replace(/"/g, '""')}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const sanitizedName = businessName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadCSV(`khulabiz_${sanitizedName}_audit_${new Date().toISOString().split('T')[0]}.csv`, csv);
}
