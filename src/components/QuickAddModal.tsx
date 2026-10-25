import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Receipt, 
  Boxes, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  User,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { Product, Customer, ExpenseCategory, PaymentMethod, PaymentStatus, Sale, Expense } from '../types';
import { formatZAR, getTodayISODate, generateInvoiceNumber } from '../utils/formatters';
import { storage } from '../services/storage';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'sale' | 'expense' | 'stock';
  products: Product[];
  customers: Customer[];
  businessId: string;
  onSuccess: (message: string) => void;
}

interface SaleLineDraft {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'sale',
  products,
  customers,
  businessId,
  onSuccess,
}) => {
  const [tab, setTab] = useState<'sale' | 'expense' | 'stock'>(initialTab);

  // Sync tab with initialTab when opened
  React.useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // SALE STATE
  const [saleDate, setSaleDate] = useState<string>(getTodayISODate());
  const [saleCustomerId, setSaleCustomerId] = useState<string>('');
  const [saleCustomerName, setSaleCustomerName] = useState<string>('');
  const [saleCustomerPhone, setSaleCustomerPhone] = useState<string>('');
  const [saleLines, setSaleLines] = useState<SaleLineDraft[]>([
    { productId: products[0]?.id || '', quantity: 1, unitPrice: products[0]?.sellingPrice || 0 },
  ]);
  const [saleDiscount, setSaleDiscount] = useState<string>('0');
  const [salePaymentStatus, setSalePaymentStatus] = useState<PaymentStatus>('paid');
  const [salePaidAmount, setSalePaidAmount] = useState<string>('');
  const [salePaymentMethod, setSalePaymentMethod] = useState<PaymentMethod>('cash');
  const [saleNotes, setSaleNotes] = useState<string>('');
  const [saleError, setSaleError] = useState<string>('');

  // EXPENSE STATE
  const [expDescription, setExpDescription] = useState<string>('');
  const [expAmount, setExpAmount] = useState<string>('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Stock purchases');
  const [expDate, setExpDate] = useState<string>(getTodayISODate());
  const [expPaymentMethod, setExpPaymentMethod] = useState<PaymentMethod>('cash');
  const [expSupplier, setExpSupplier] = useState<string>('');
  const [expNotes, setExpNotes] = useState<string>('');
  const [expError, setExpError] = useState<string>('');

  // STOCK ADJUSTMENT STATE
  const [adjProductId, setAdjProductId] = useState<string>(products[0]?.id || '');
  const [adjDelta, setAdjDelta] = useState<string>('5');
  const [adjReasonType, setAdjReasonType] = useState<string>('Restock from Cash & Carry');
  const [adjNotes, setAdjNotes] = useState<string>('');
  const [adjError, setAdjError] = useState<string>('');

  if (!isOpen) return null;

  // Sale Calculations
  const calculatedSubtotal = saleLines.reduce((sum, line) => {
    return sum + (line.quantity * line.unitPrice);
  }, 0);
  const discountVal = Math.max(0, parseFloat(saleDiscount) || 0);
  const calculatedTotal = Math.max(0, calculatedSubtotal - discountVal);

  const handleAddSaleLine = () => {
    const unselected = products.find(p => !saleLines.some(l => l.productId === p.id));
    const targetProduct = unselected || products[0];
    if (targetProduct) {
      setSaleLines([...saleLines, {
        productId: targetProduct.id,
        quantity: 1,
        unitPrice: targetProduct.sellingPrice,
      }]);
    }
  };

  const handleRemoveSaleLine = (index: number) => {
    if (saleLines.length === 1) return;
    setSaleLines(saleLines.filter((_, i) => i !== index));
  };

  const handleUpdateSaleLine = (index: number, field: keyof SaleLineDraft, value: any) => {
    const updated = [...saleLines];
    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      updated[index] = {
        ...updated[index],
        productId: value,
        unitPrice: prod?.sellingPrice || updated[index].unitPrice,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setSaleLines(updated);
  };

  // Submit Sale
  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    setSaleError('');

    if (saleLines.length === 0) {
      setSaleError('Please add at least one product or item.');
      return;
    }

    if (calculatedTotal <= 0) {
      setSaleError('Sale total must be greater than zero.');
      return;
    }

    // Customer resolution
    let finalCustName = saleCustomerName.trim();
    if (saleCustomerId) {
      const cust = customers.find(c => c.id === saleCustomerId);
      if (cust) {
        finalCustName = cust.name;
      }
    }

    // Determine paid amount
    let finalPaidAmount = calculatedTotal;
    if (salePaymentStatus === 'unpaid') {
      finalPaidAmount = 0;
    } else if (salePaymentStatus === 'partial') {
      const parsedPaid = parseFloat(salePaidAmount) || 0;
      if (parsedPaid < 0 || parsedPaid >= calculatedTotal) {
        setSaleError(`Partial payment must be between R 0.01 and ${formatZAR(calculatedTotal - 0.01)}`);
        return;
      }
      finalPaidAmount = parsedPaid;
    }

    const salesCount = storage.getSales(businessId).length;
    const newInvoiceNumber = generateInvoiceNumber(salesCount + 1);

    const saleItems = saleLines.map(line => {
      const prod = products.find(p => p.id === line.productId);
      return {
        productId: line.productId,
        productName: prod?.name || 'Item',
        quantity: Number(line.quantity),
        unitPrice: Number(line.unitPrice),
        unitCost: prod?.unitCost || 0,
        total: line.quantity * line.unitPrice,
      };
    });

    const newSale: Sale = {
      id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      businessId,
      invoiceNumber: newInvoiceNumber,
      date: saleDate,
      customerId: saleCustomerId || undefined,
      customerName: finalCustName || 'Walk-in Customer',
      customerPhone: saleCustomerPhone || undefined,
      items: saleItems,
      subtotal: calculatedSubtotal,
      discount: discountVal,
      total: calculatedTotal,
      paidAmount: finalPaidAmount,
      paymentStatus: salePaymentStatus,
      paymentMethod: salePaymentMethod,
      notes: saleNotes.trim() || undefined,
      isVoided: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      storage.recordSale(newSale);
      onSuccess(`Sale #${newInvoiceNumber} for ${formatZAR(calculatedTotal)} recorded successfully!`);
      onClose();
    } catch (err: any) {
      setSaleError(err?.message || 'Failed to save sale.');
    }
  };

  // Submit Expense
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setExpError('');

    const parsedAmount = parseFloat(expAmount);
    if (!parsedAmount || parsedAmount <= 0) {
      setExpError('Please enter a valid expense amount greater than R 0.00.');
      return;
    }

    if (!expDescription.trim()) {
      setExpError('Please provide a short description for this expense.');
      return;
    }

    const newExpense: Expense = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      businessId,
      description: expDescription.trim(),
      amount: parsedAmount,
      category: expCategory,
      date: expDate,
      paymentMethod: expPaymentMethod,
      supplier: expSupplier.trim() || undefined,
      notes: expNotes.trim() || undefined,
      isVoided: false,
      createdAt: new Date().toISOString(),
    };

    try {
      storage.recordExpense(newExpense);
      onSuccess(`Expense of ${formatZAR(parsedAmount)} (${expCategory}) recorded.`);
      onClose();
    } catch (err: any) {
      setExpError(err?.message || 'Failed to record expense.');
    }
  };

  // Submit Stock Adjustment
  const handleSaveStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    setAdjError('');

    const targetProduct = products.find(p => p.id === adjProductId);
    if (!targetProduct) {
      setAdjError('Please select a valid product to adjust.');
      return;
    }

    const delta = parseInt(adjDelta, 10);
    if (isNaN(delta) || delta === 0) {
      setAdjError('Please enter a non-zero adjustment quantity.');
      return;
    }

    const reason = `${adjReasonType}${adjNotes.trim() ? ` — ${adjNotes.trim()}` : ''}`;
    const movementType = delta > 0 ? 'restock' : 'adjustment';

    try {
      storage.adjustStock(businessId, adjProductId, delta, reason, movementType);
      onSuccess(`Stock for ${targetProduct.name} updated: now ${targetProduct.currentQuantity + delta} units.`);
      onClose();
    } catch (err: any) {
      setAdjError(err?.message || 'Failed to adjust stock.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTab('sale')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                tab === 'sale' ? 'bg-white text-emerald-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
              <span>Record Sale</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('expense')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                tab === 'expense' ? 'bg-white text-emerald-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-stone-700" />
              <span>Add Expense</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('stock')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                tab === 'stock' ? 'bg-white text-emerald-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Boxes className="w-3.5 h-3.5 text-amber-700" />
              <span>Update Stock</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[80vh] overflow-y-auto">
          
          {/* TAB 1: RECORD SALE */}
          {tab === 'sale' && (
            <form onSubmit={handleSaveSale} className="space-y-4">
              {saleError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{saleError}</span>
                </div>
              )}

              {/* Date & Customer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Customer (Optional)
                  </label>
                  <select
                    value={saleCustomerId}
                    onChange={(e) => {
                      setSaleCustomerId(e.target.value);
                      if (e.target.value) {
                        const cust = customers.find(c => c.id === e.target.value);
                        setSaleCustomerName(cust?.name || '');
                        setSaleCustomerPhone(cust?.phone || '');
                      }
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">Walk-in Customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.outstandingBalance > 0 ? `(Owes ${formatZAR(c.outstandingBalance)})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items List */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
                    Sale Items
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSaleLine}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Another Item
                  </button>
                </div>

                <div className="space-y-2">
                  {saleLines.map((line, idx) => {
                    const selectedProd = products.find(p => p.id === line.productId);
                    const isLow = selectedProd && selectedProd.currentQuantity <= selectedProd.lowStockThreshold;

                    return (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-stone-50 border border-stone-200 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <select
                            value={line.productId}
                            onChange={(e) => handleUpdateSaleLine(idx, 'productId', e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs truncate focus:outline-none"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} — {formatZAR(p.sellingPrice)} (Stock: {p.currentQuantity})
                              </option>
                            ))}
                          </select>
                          {selectedProd && (
                            <div className="text-[10px] text-stone-500 mt-0.5 flex items-center gap-1.5">
                              <span>In Stock: {selectedProd.currentQuantity} units</span>
                              {isLow && <span className="text-amber-700 font-semibold">Low stock!</span>}
                            </div>
                          )}
                        </div>

                        {/* Quantity */}
                        <div className="w-16">
                          <input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) => handleUpdateSaleLine(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-xs text-center font-medium focus:outline-none"
                          />
                        </div>

                        {/* Unit Price */}
                        <div className="w-20">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={line.unitPrice}
                            onChange={(e) => handleUpdateSaleLine(idx, 'unitPrice', Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-xs text-right font-medium focus:outline-none"
                          />
                        </div>

                        {/* Line Total */}
                        <div className="w-16 text-right font-semibold text-xs text-stone-900 truncate">
                          {formatZAR(line.quantity * line.unitPrice)}
                        </div>

                        {/* Remove */}
                        {saleLines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSaleLine(idx)}
                            className="p-1 text-stone-400 hover:text-red-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Discount & Totals */}
              <div className="pt-2 border-t border-stone-200 space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-stone-900">{formatZAR(calculatedSubtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">Discount (ZAR):</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={saleDiscount}
                    onChange={(e) => setSaleDiscount(e.target.value)}
                    className="w-24 px-2 py-1 text-right bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between text-sm font-bold text-emerald-950 pt-1 border-t border-dashed border-stone-200">
                  <span>Total Amount Due:</span>
                  <span className="text-base text-emerald-800">{formatZAR(calculatedTotal)}</span>
                </div>
              </div>

              {/* Payment Method & Payment Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <select
                    value={salePaymentMethod}
                    onChange={(e) => setSalePaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="cash">Cash in Hand</option>
                    <option value="card">Card / Tap (Yoco / POS)</option>
                    <option value="eft">EFT / Instant Transfer</option>
                    <option value="other">Other / Voucher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Payment Status
                  </label>
                  <select
                    value={salePaymentStatus}
                    onChange={(e) => setSalePaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="paid">Paid in Full (Cash Inflow)</option>
                    <option value="partial">Partially Paid</option>
                    <option value="unpaid">Unpaid (Credit / Book Debt)</option>
                  </select>
                </div>
              </div>

              {salePaymentStatus === 'partial' && (
                <div>
                  <label className="block text-[11px] font-semibold text-amber-800 uppercase tracking-wider mb-1">
                    Amount Paid Today (ZAR)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max={calculatedTotal}
                    placeholder={`e.g. ${formatZAR(calculatedTotal / 2)}`}
                    value={salePaidAmount}
                    onChange={(e) => setSalePaidAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                  <p className="text-[10px] text-amber-700 mt-1">
                    Remaining {formatZAR(calculatedTotal - (parseFloat(salePaidAmount) || 0))} will be recorded on customer credit book.
                  </p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Optional Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Regular discount, morning customer"
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition active:scale-95"
                >
                  Record Sale & Update Stock
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: RECORD EXPENSE */}
          {tab === 'expense' && (
            <form onSubmit={handleSaveExpense} className="space-y-4">
              {expError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{expError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Amount (ZAR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-stone-400">R</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      placeholder="0.00"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      required
                      className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Stock purchases">Stock purchases (Wholesale / Cash & Carry)</option>
                  <option value="Transport">Transport (Bakkie / Taxi / Petrol)</option>
                  <option value="Electricity & utilities">Electricity & utilities (Eskom / Water)</option>
                  <option value="Rent">Rent (Shop / Stand lease)</option>
                  <option value="Data & connectivity">Data & connectivity (LTE / Phone)</option>
                  <option value="Packaging">Packaging (Bags / Boxes)</option>
                  <option value="Equipment">Equipment (Fridge repair / Shelves)</option>
                  <option value="Staff & labour">Staff & labour (Helper wages)</option>
                  <option value="Marketing">Marketing & Signage</option>
                  <option value="Other">Other Operational Overhead</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Metro Cash & Carry weekly staple restock"
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Supplier / Payee (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Albany Meadowlands, Eskom"
                    value={expSupplier}
                    onChange={(e) => setExpSupplier(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <select
                    value={expPaymentMethod}
                    onChange={(e) => setExpPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="cash">Cash (From Till)</option>
                    <option value="eft">EFT / Bank App Transfer</option>
                    <option value="card">Card / Debit</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Optional Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Receipt #4912, token number"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition active:scale-95"
                >
                  Record Expense
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: UPDATE STOCK */}
          {tab === 'stock' && (
            <form onSubmit={handleSaveStockAdjustment} className="space-y-4">
              {adjError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{adjError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Select Product
                </label>
                <select
                  value={adjProductId}
                  onChange={(e) => setAdjProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current Stock: {p.currentQuantity} units)
                    </option>
                  ))}
                </select>
              </div>

              {(() => {
                const currentProduct = products.find(p => p.id === adjProductId);
                const currentQty = currentProduct?.currentQuantity || 0;
                const deltaNum = parseInt(adjDelta, 10) || 0;
                const newQty = currentQty + deltaNum;

                return (
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-stone-500">Current Stock:</span>{' '}
                      <strong className="text-stone-900">{currentQty} units</strong>
                    </div>
                    <div className="text-stone-400">→</div>
                    <div>
                      <span className="text-stone-500">New Resulting Stock:</span>{' '}
                      <strong className={newQty < 0 ? 'text-red-600' : 'text-emerald-800'}>
                        {newQty} units
                      </strong>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Quantity Change (+ or -)
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. +10 or -2"
                    value={adjDelta}
                    onChange={(e) => setAdjDelta(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Use positive numbers for restock, negative for shrinkage/damage.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Adjustment Reason
                  </label>
                  <select
                    value={adjReasonType}
                    onChange={(e) => setAdjReasonType(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Restock from Cash & Carry">Restock from Cash & Carry / Wholesale</option>
                    <option value="Bakery daily delivery">Bakery daily delivery</option>
                    <option value="Physical count reconciliation">Physical count reconciliation</option>
                    <option value="Damaged or expired goods">Damaged or expired goods</option>
                    <option value="Customer return">Customer return</option>
                    <option value="Shop internal consumption">Shop internal consumption</option>
                    <option value="Other adjustment">Other adjustment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Audit Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Invoice #9182, 2 cans dented"
                  value={adjNotes}
                  onChange={(e) => setAdjNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition active:scale-95"
                >
                  Update Inventory
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
