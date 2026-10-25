import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Ban, 
  Calendar, 
  DollarSign, 
  Layers, 
  AlertCircle,
  Truck,
  Zap,
  Building,
  Wifi,
  Package,
  Wrench,
  Users
} from 'lucide-react';
import { Expense, Business, ExpenseCategory } from '../types';
import { formatZAR, formatDateSA } from '../utils/formatters';
import { exportExpensesCSV } from '../services/exportUtils';
import { storage } from '../services/storage';

interface ExpensesViewProps {
  business: Business;
  expenses: Expense[];
  totalSales: number;
  onOpenQuickAdd: (tab?: 'sale' | 'expense' | 'stock') => void;
  onSuccess: (msg: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  business,
  expenses,
  totalSales,
  onOpenQuickAdd,
  onSuccess,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [voidingExpense, setVoidingExpense] = useState<Expense | null>(null);
  const [voidReason, setVoidReason] = useState<string>('');

  const activeExpenses = expenses.filter(e => !e.isVoided);

  // Category Aggregates
  const categoryTotals: Record<string, number> = {};
  activeExpenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const totalExpenseAmount = activeExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Filtered expenses
  const filteredExpenses = expenses.filter(e => {
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchDesc = e.description.toLowerCase().includes(q);
      const matchSupp = (e.supplier || '').toLowerCase().includes(q);
      const matchCat = e.category.toLowerCase().includes(q);
      if (!matchDesc && !matchSupp && !matchCat) return false;
    }
    return true;
  });

  const handleVoidExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidingExpense || !voidReason.trim()) return;

    try {
      storage.voidExpense(business.id, voidingExpense.id, voidReason.trim());
      onSuccess(`Expense "${voidingExpense.description}" voided.`);
      setVoidingExpense(null);
      setVoidReason('');
    } catch (err: any) {
      alert(err?.message || 'Error voiding expense');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Stock purchases': return Package;
      case 'Transport': return Truck;
      case 'Electricity & utilities': return Zap;
      case 'Rent': return Building;
      case 'Data & connectivity': return Wifi;
      case 'Staff & labour': return Users;
      case 'Equipment': return Wrench;
      default: return Receipt;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-800" />
            <span>Overheads & Expense Ledger</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Track stock purchases, taxi transport, Eskom electricity, rent, and shop running costs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportExpensesCSV(business.name, expenses)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => onOpenQuickAdd('expense')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Expense vs Sales Comparison Bar */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Cash Outflow vs Recorded Revenue
          </span>
          <div className="text-xs font-semibold text-stone-700">
            Expenses represent <strong>{totalSales > 0 ? ((totalExpenseAmount / totalSales) * 100).toFixed(1) : 0}%</strong> of recorded sales
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div className="text-[10px] text-stone-500 font-semibold uppercase">Total Recorded Expenses</div>
            <div className="text-lg font-extrabold text-stone-900 mt-0.5">{formatZAR(totalExpenseAmount)}</div>
            <div className="text-[10px] text-stone-500">{activeExpenses.length} entries</div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="text-[10px] text-emerald-800 font-semibold uppercase">Total Sales Revenue</div>
            <div className="text-lg font-extrabold text-emerald-950 mt-0.5">{formatZAR(totalSales)}</div>
            <div className="text-[10px] text-emerald-700 font-medium">Turnover</div>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 col-span-2 sm:col-span-1">
            <div className="text-[10px] text-stone-500 font-semibold uppercase">Net Operational Flow</div>
            <div className={`text-lg font-extrabold mt-0.5 ${totalSales - totalExpenseAmount >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {formatZAR(totalSales - totalExpenseAmount)}
            </div>
            <div className="text-[10px] text-stone-500">Sales minus cash expenses</div>
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search expenses, suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="text-xs text-stone-500">
            Showing <strong>{filteredExpenses.length}</strong> entries
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
              selectedCategory === 'all' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            All Categories
          </button>
          {[
            'Stock purchases',
            'Electricity & utilities',
            'Transport',
            'Rent',
            'Data & connectivity',
            'Packaging',
            'Staff & labour',
            'Equipment',
            'Other',
          ].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                selectedCategory === cat ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {cat} ({formatZAR(categoryTotals[cat] || 0)})
            </button>
          ))}
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-800">No expenses recorded</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Track your daily overheads like electricity vouchers and taxi transport to maintain an accurate cash balance.
            </p>
            <button
              onClick={() => onOpenQuickAdd('expense')}
              className="px-4 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800 transition shadow-xs"
            >
              Add First Expense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50/80 text-stone-600 font-semibold border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5">Supplier / Payee</th>
                  <th className="p-3.5 text-right">Amount</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredExpenses.map((exp) => {
                  const Icon = getCategoryIcon(exp.category);
                  return (
                    <tr key={exp.id} className={`hover:bg-stone-50/70 transition ${exp.isVoided ? 'opacity-50 bg-stone-50/40' : ''}`}>
                      <td className="p-3.5 text-stone-600 whitespace-nowrap">
                        {formatDateSA(exp.date)}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-stone-100 text-stone-800 text-[11px] font-semibold w-fit">
                          <Icon className="w-3.5 h-3.5 text-stone-500" />
                          <span>{exp.category}</span>
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-stone-900 max-w-sm truncate">
                        {exp.description}
                        {exp.notes && <span className="text-[10px] text-stone-400 block truncate">{exp.notes}</span>}
                      </td>
                      <td className="p-3.5 text-stone-600 whitespace-nowrap">
                        {exp.supplier || '—'}
                      </td>
                      <td className="p-3.5 text-right font-extrabold text-stone-900 whitespace-nowrap">
                        {formatZAR(exp.amount)}
                      </td>
                      <td className="p-3.5 uppercase text-[10px] font-bold text-stone-500 whitespace-nowrap">
                        {exp.paymentMethod}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {!exp.isVoided ? (
                          <button
                            onClick={() => setVoidingExpense(exp)}
                            title="Void Expense"
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-red-600 font-bold uppercase">
                            Voided
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VOID EXPENSE MODAL */}
      {voidingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <form onSubmit={handleVoidExpense} className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <Ban className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-stone-900">Void Recorded Expense?</h3>
              <p className="text-xs text-stone-600 mt-1">
                Voiding "{voidingExpense.description}" ({formatZAR(voidingExpense.amount)}) will restore this amount to your estimated cash balance float.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Reason for Void <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Duplicate entry, refund received"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                required
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVoidingExpense(null)}
                className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition"
              >
                Confirm & Void
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
