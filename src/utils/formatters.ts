/**
 * South African Currency and Date Formatters for KhulaBiz
 */

export function formatZAR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'R 0.00';
  }
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Format with thousands separator as space or comma (South African banking convention uses R 1,250.00 or R 1 250.00)
  const parts = absAmount.toFixed(2).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formatted = `R ${intPart}.${parts[1]}`;
  
  return isNegative ? `-${formatted}` : formatted;
}

export function formatDateSA(dateInput: string | Date | undefined): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);
  
  return d.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTimeSA(dateInput: string | Date | undefined): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);
  
  return d.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getTodayISODate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateInvoiceNumber(sequence: number): string {
  const now = new Date();
  const prefix = `KB-${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `${prefix}-${String(sequence).padStart(4, '0')}`;
}

export function generateOrderNumber(sequence: number): string {
  const now = new Date();
  const prefix = `ORD-${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `${prefix}-${String(sequence).padStart(4, '0')}`;
}
