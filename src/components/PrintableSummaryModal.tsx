import React from 'react';
import { X, Printer, Download, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Business, Sale, Expense, Product, Customer } from '../types';
import { formatZAR, formatDateSA } from '../utils/formatters';
import { computeBusinessPulse } from '../services/businessPulse';

interface PrintableSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
  customers: Customer[];
}

export const PrintableSummaryModal: React.FC<PrintableSummaryModalProps> = ({
  isOpen,
  onClose,
  business,
  sales,
  expenses,
  products,
  customers,
}) => {
  if (!isOpen) return null;

  const pulse = computeBusinessPulse(business, products, sales, expenses, customers);
  const activeSales = sales.filter(s => !s.isVoided);
  const activeExpenses = expenses.filter(e => !e.isVoided);

  const totalSalesRevenue = activeSales.reduce((acc, s) => acc + s.total, 0);
  const totalExpensesPaid = activeExpenses.reduce((acc, e) => acc + e.amount, 0);
  const estimatedGrossProfit = pulse.grossProfitTotal;
  const netEstimatedMargin = totalSalesRevenue > 0 ? (estimatedGrossProfit / totalSalesRevenue) * 100 : 0;

  // Breakdown expenses by category
  const expensesByCategory: Record<string, number> = {};
  activeExpenses.forEach(e => {
    expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Modal Controls (Not printed) */}
        <div className="no-print px-6 py-3.5 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold">Monthly Business Statement (Print / PDF)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Document */}
        <div className="p-8 overflow-y-auto bg-white text-stone-900 font-sans space-y-6">
          
          {/* Header */}
          <div className="border-b-2 border-emerald-900 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold tracking-tight text-emerald-950">Khula<span className="text-emerald-600">Biz</span></span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                  Business Performance Statement
                </span>
              </div>
              <h1 className="text-lg font-bold text-stone-900 mt-2">{business.name}</h1>
              <p className="text-xs text-stone-600">{business.address || `${business.townOrCity}, ${business.province}`}</p>
              <p className="text-xs text-stone-600">Phone: {business.contactPhone || 'Registered Trader'}</p>
            </div>

            <div className="text-right text-xs text-stone-500 space-y-1">
              <div><strong>Statement Date:</strong> {formatDateSA(new Date())}</div>
              <div><strong>Period Covered:</strong> Last 30 Days</div>
              <div><strong>Currency:</strong> South African Rand (ZAR)</div>
              <div><strong>Trading Status:</strong> Active Micro-Enterprise</div>
            </div>
          </div>

          {/* Key Performance Indicators Grid */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">1. Financial Performance Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="text-[10px] font-semibold text-stone-500 uppercase">Recorded Sales</div>
                <div className="text-base font-extrabold text-stone-900 mt-0.5">{formatZAR(totalSalesRevenue)}</div>
                <div className="text-[10px] text-stone-500">{activeSales.length} recorded sales</div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="text-[10px] font-semibold text-stone-500 uppercase">Total Expenses</div>
                <div className="text-base font-extrabold text-stone-900 mt-0.5">{formatZAR(totalExpensesPaid)}</div>
                <div className="text-[10px] text-stone-500">{activeExpenses.length} expense entries</div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="text-[10px] font-semibold text-emerald-800 uppercase">Est. Gross Profit</div>
                <div className="text-base font-extrabold text-emerald-950 mt-0.5">{formatZAR(estimatedGrossProfit)}</div>
                <div className="text-[10px] text-emerald-700 font-medium">Margin: {netEstimatedMargin.toFixed(1)}%</div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="text-[10px] font-semibold text-stone-500 uppercase">Estimated Cash Float</div>
                <div className="text-base font-extrabold text-stone-900 mt-0.5">{formatZAR(pulse.currentCashEstimate)}</div>
                <div className="text-[10px] text-stone-500">Till + Inflows - Expenses</div>
              </div>
            </div>
          </div>

          {/* Outstanding Customer Book Credit & Stock Valuation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700">2. Outstanding Customer Receivables</h2>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">Total Unpaid Credit on Book:</span>
                <span className="font-bold text-stone-900">{formatZAR(pulse.totalReceivables)}</span>
              </div>
              <p className="text-[10px] text-stone-500 leading-relaxed">
                Represents informal credit extended to local customers (e.g. SASSA book). Not included as received cash until collected.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700">3. Inventory Valuation</h2>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">Stock Valuation (at Cost):</span>
                <span className="font-bold text-stone-900">{formatZAR(pulse.totalInventoryValuationAtCost)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">Stock Valuation (at Retail):</span>
                <span className="font-bold text-stone-900">{formatZAR(pulse.totalInventoryValuationAtRetail)}</span>
              </div>
            </div>

          </div>

          {/* Operating Expense Breakdown Table */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">4. Recorded Overhead Breakdown</h2>
            <table className="w-full text-xs text-left border border-stone-200 rounded-xl overflow-hidden">
              <thead className="bg-stone-100 text-stone-700 font-semibold">
                <tr>
                  <th className="p-2.5">Expense Category</th>
                  <th className="p-2.5 text-right">Amount (ZAR)</th>
                  <th className="p-2.5 text-right">% of Total Expenses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {Object.entries(expensesByCategory).map(([cat, amt]) => {
                  const pct = totalExpensesPaid > 0 ? (amt / totalExpensesPaid) * 100 : 0;
                  return (
                    <tr key={cat}>
                      <td className="p-2.5 font-medium text-stone-800">{cat}</td>
                      <td className="p-2.5 text-right font-bold text-stone-900">{formatZAR(amt)}</td>
                      <td className="p-2.5 text-right text-stone-500">{pct.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mandatory Disclaimer Box */}
          <div className="p-4 bg-amber-50/80 border border-amber-300/80 rounded-2xl text-[11px] text-amber-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Official Disclaimer & Record Notice</span>
            </div>
            <p className="leading-relaxed">
              This summary is generated by <strong>KhulaBiz</strong> based strictly on transactions and expenses recorded by the business owner. It represents an operational management statement and does not constitute an audited financial statement or formal credit endorsement by financial institutions or hackathon organizers.
            </p>
          </div>

          {/* Signoff lines */}
          <div className="pt-6 border-t border-stone-200 grid grid-cols-2 gap-8 text-xs text-stone-500">
            <div>
              <div className="border-b border-stone-400 pb-1 mb-1">Owner / Operator Signature</div>
              <div>{business.name} — Authorised Representative</div>
            </div>
            <div>
              <div className="border-b border-stone-400 pb-1 mb-1">Generated via KhulaBiz Platform</div>
              <div>Timestamp: {new Date().toISOString()}</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
