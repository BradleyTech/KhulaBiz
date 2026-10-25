import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Share2, 
  Eye, 
  Ban,
  Calendar,
  X,
  CreditCard
} from 'lucide-react';
import { Sale, Business, Product, Customer } from '../types';
import { formatZAR, formatDateSA, formatDateTimeSA } from '../utils/formatters';
import { exportSalesCSV } from '../services/exportUtils';
import { storage } from '../services/storage';

interface SalesViewProps {
  business: Business;
  sales: Sale[];
  products: Product[];
  customers: Customer[];
  onOpenQuickAdd: (tab?: 'sale' | 'expense' | 'stock') => void;
  onSuccess: (msg: string) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  business,
  sales,
  products,
  customers,
  onOpenQuickAdd,
  onSuccess,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid' | 'voided'>('all');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [voidingSale, setVoidingSale] = useState<Sale | null>(null);
  const [voidReason, setVoidReason] = useState<string>('');
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);

  // Filter sales
  const filteredSales = sales.filter(sale => {
    if (statusFilter === 'voided') {
      if (!sale.isVoided) return false;
    } else if (statusFilter !== 'all') {
      if (sale.isVoided || sale.paymentStatus !== statusFilter) return false;
    } else {
      // 'all' includes active sales
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchInv = sale.invoiceNumber.toLowerCase().includes(q);
      const matchCust = (sale.customerName || '').toLowerCase().includes(q);
      const matchItem = sale.items.some(i => i.productName.toLowerCase().includes(q));
      if (!matchInv && !matchCust && !matchItem) return false;
    }

    return true;
  });

  const totalFilteredAmount = filteredSales
    .filter(s => !s.isVoided)
    .reduce((sum, s) => sum + s.total, 0);

  const handleVoidSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidingSale || !voidReason.trim()) return;

    try {
      storage.voidSale(business.id, voidingSale.id, voidReason.trim());
      onSuccess(`Sale #${voidingSale.invoiceNumber} voided and stock restored.`);
      setVoidingSale(null);
      setVoidReason('');
    } catch (err: any) {
      alert(err?.message || 'Error voiding sale');
    }
  };

  const generateWhatsAppShare = (sale: Sale) => {
    const lines = sale.items.map(i => `• ${i.quantity}x ${i.productName} = ${formatZAR(i.total)}`).join('\n');
    const msg = `*${business.name} — Sale Receipt*\nInvoice: ${sale.invoiceNumber}\nDate: ${formatDateSA(sale.date)}\nCustomer: ${sale.customerName || 'Customer'}\n\n${lines}\n\n*Total Due:* ${formatZAR(sale.total)}\nStatus: ${sale.paymentStatus.toUpperCase()} (${sale.paymentMethod.toUpperCase()})\n\nThank you for supporting our local business!`;
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <span>Sales & Till Transactions</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Record customer purchases, track cash vs customer credit, and issue instant receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportSalesCSV(business.name, sales)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => onOpenQuickAdd('sale')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Sale</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice, customer, item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto text-xs font-semibold">
          {[
            { id: 'all', label: 'All Active' },
            { id: 'paid', label: 'Paid in Full' },
            { id: 'partial', label: 'Partially Paid' },
            { id: 'unpaid', label: 'Unpaid / Credit' },
            { id: 'voided', label: 'Voided' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                statusFilter === f.id
                  ? 'bg-emerald-800 text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sales Summary Counter */}
      <div className="flex items-center justify-between text-xs text-stone-600 px-1">
        <div>
          Showing <strong>{filteredSales.length}</strong> transactions
        </div>
        <div>
          Total Filtered Revenue: <strong className="text-stone-900">{formatZAR(totalFilteredAmount)}</strong>
        </div>
      </div>

      {/* Sales List Table / Mobile Cards */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
        
        {filteredSales.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-800">No transactions found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {searchTerm ? 'No sales matched your search filter.' : 'Record your first sale to start tracking daily revenue and stock.'}
            </p>
            <button
              onClick={() => onOpenQuickAdd('sale')}
              className="px-4 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800 shadow-xs transition"
            >
              Record First Sale
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50/80 text-stone-600 font-semibold border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5 text-right">Amount</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className={`hover:bg-stone-50/70 transition ${sale.isVoided ? 'opacity-50 bg-stone-50/40' : ''}`}>
                    <td className="p-3.5 font-bold text-stone-900 whitespace-nowrap">
                      {sale.invoiceNumber}
                    </td>
                    <td className="p-3.5 text-stone-600 whitespace-nowrap">
                      {formatDateSA(sale.date)}
                    </td>
                    <td className="p-3.5 text-stone-800 font-medium">
                      {sale.customerName || 'Walk-in'}
                    </td>
                    <td className="p-3.5 text-stone-600 max-w-xs truncate">
                      {sale.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-stone-900 whitespace-nowrap">
                      {formatZAR(sale.total)}
                    </td>
                    <td className="p-3.5 whitespace-nowrap uppercase text-[10px] font-bold text-stone-500">
                      {sale.paymentMethod}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {sale.isVoided ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                          Voided
                        </span>
                      ) : sale.paymentStatus === 'paid' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Paid
                        </span>
                      ) : sale.paymentStatus === 'partial' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Partial ({formatZAR(sale.paidAmount)})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-800 border border-red-200">
                          Unpaid (Credit)
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => setReceiptSale(sale)}
                        title="View Receipt"
                        className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-stone-100 rounded-lg transition"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      {!sale.isVoided && (
                        <button
                          onClick={() => setVoidingSale(sale)}
                          title="Void Sale"
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* RECEIPT MODAL */}
      {receiptSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-stone-900">Sale Receipt #{receiptSale.invoiceNumber}</h3>
              </div>
              <button onClick={() => setReceiptSale(null)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-base font-extrabold text-stone-900">{business.name}</h4>
              <p className="text-[11px] text-stone-500">{business.townOrCity}, {business.province}</p>
              <p className="text-[10px] text-stone-400">{formatDateTimeSA(receiptSale.createdAt)}</p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] text-stone-500 border-b border-stone-200 pb-1">
                <span>Customer:</span>
                <strong className="text-stone-800">{receiptSale.customerName || 'Walk-in'}</strong>
              </div>

              <div className="space-y-1.5 pt-1">
                {receiptSale.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-stone-900">{item.productName}</div>
                      <div className="text-[10px] text-stone-500">{item.quantity} x {formatZAR(item.unitPrice)}</div>
                    </div>
                    <div className="font-bold text-stone-900">{formatZAR(item.total)}</div>
                  </div>
                ))}
              </div>

              {receiptSale.discount > 0 && (
                <div className="flex items-center justify-between text-[11px] text-emerald-700 pt-1 border-t border-stone-200">
                  <span>Discount:</span>
                  <span>-{formatZAR(receiptSale.discount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm font-extrabold text-stone-900 pt-2 border-t-2 border-stone-300">
                <span>Total Amount:</span>
                <span className="text-emerald-800">{formatZAR(receiptSale.total)}</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                <span>Payment Method:</span>
                <span className="uppercase font-semibold text-stone-700">{receiptSale.paymentMethod}</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span>Status:</span>
                <span className="uppercase font-bold text-emerald-700">{receiptSale.paymentStatus}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => generateWhatsAppShare(receiptSale)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share via WhatsApp</span>
              </button>
              <button
                onClick={() => setReceiptSale(null)}
                className="py-2 px-3 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VOID CONFIRMATION MODAL */}
      {voidingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <form onSubmit={handleVoidSale} className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <Ban className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-stone-900">Void Sale #{voidingSale.invoiceNumber}?</h3>
              <p className="text-xs text-stone-600 mt-1">
                Voiding this sale will automatically restore inventory counts for all items and reverse any recorded customer debt.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Required Reason for Void <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Accidental duplicate, customer returned items"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                required
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVoidingSale(null)}
                className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition"
              >
                Confirm & Void Sale
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
