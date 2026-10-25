import React, { useState } from 'react';
import { 
  Users, 
  ShoppingBag, 
  Plus, 
  Search, 
  Phone, 
  Share2, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  X, 
  UserPlus,
  Send,
  Calendar
} from 'lucide-react';
import { Customer, Order, Business, Product } from '../types';
import { formatZAR, formatDateSA, generateOrderNumber } from '../utils/formatters';
import { storage } from '../services/storage';

interface CustomersViewProps {
  business: Business;
  customers: Customer[];
  orders: Order[];
  products: Product[];
  onOpenPublicCatalogue: () => void;
  onSuccess: (msg: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  business,
  customers,
  orders,
  products,
  onOpenPublicCatalogue,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'customers' | 'orders'>('customers');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Customer Modal State
  const [isAddingCustomer, setIsAddingCustomer] = useState<boolean>(false);
  const [custName, setCustName] = useState<string>('');
  const [custPhone, setCustPhone] = useState<string>('');
  const [custNotes, setCustNotes] = useState<string>('');

  // Order Modal State
  const [isAddingOrder, setIsAddingOrder] = useState<boolean>(false);
  const [orderCustomerName, setOrderCustomerName] = useState<string>('');
  const [orderCustomerPhone, setOrderCustomerPhone] = useState<string>('');
  const [orderItemsDraft, setOrderItemsDraft] = useState<{ productId: string; quantity: number }[]>([
    { productId: products[0]?.id || '', quantity: 1 }
  ]);
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [orderPaymentStatus, setOrderPaymentStatus] = useState<'unpaid' | 'partial' | 'paid'>('unpaid');

  const totalOutstandingCredit = customers.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0);

  // Filtered
  const filteredCustomers = customers.filter(c => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.phone || '').includes(q) || (c.notes || '').toLowerCase().includes(q);
  });

  const filteredOrders = orders.filter(o => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q);
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) return;

    const newCust: Customer = {
      id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      businessId: business.id,
      name: custName.trim(),
      phone: custPhone.trim() || undefined,
      notes: custNotes.trim() || undefined,
      outstandingBalance: 0,
      createdAt: new Date().toISOString(),
    };

    storage.saveCustomer(newCust);
    onSuccess(`Customer ${newCust.name} added to your address book.`);
    setIsAddingCustomer(false);
    setCustName('');
    setCustPhone('');
    setCustNotes('');
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCustomerName.trim() || orderItemsDraft.length === 0) return;

    const items = orderItemsDraft.map(draft => {
      const p = products.find(prod => prod.id === draft.productId);
      return {
        productId: draft.productId,
        productName: p?.name || 'Item',
        quantity: draft.quantity,
        unitPrice: p?.sellingPrice || 0,
        total: (p?.sellingPrice || 0) * draft.quantity,
      };
    });

    const orderTotal = items.reduce((sum, i) => sum + i.total, 0);
    const newOrder: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      businessId: business.id,
      orderNumber: generateOrderNumber(orders.length + 1),
      customerName: orderCustomerName.trim(),
      customerPhone: orderCustomerPhone.trim(),
      items,
      total: orderTotal,
      status: 'confirmed',
      paymentStatus: orderPaymentStatus,
      deliveryNotes: orderNotes.trim() || undefined,
      orderDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    storage.saveOrder(newOrder);
    onSuccess(`Order #${newOrder.orderNumber} for ${formatZAR(orderTotal)} saved.`);
    setIsAddingOrder(false);
  };

  const handleUpdateOrderStatus = (order: Order, newStatus: Order['status']) => {
    order.status = newStatus;
    storage.saveOrder(order);
    onSuccess(`Order #${order.orderNumber} status changed to ${newStatus}.`);
  };

  const sendWhatsAppOrderNotice = (order: Order) => {
    const lines = order.items.map(i => `• ${i.quantity}x ${i.productName} = ${formatZAR(i.total)}`).join('\n');
    const msg = `*${business.name} — Order Update*\nOrder #${order.orderNumber}\nStatus: *${order.status.toUpperCase()}*\n\n${lines}\n\n*Total Due:* ${formatZAR(order.total)}\n${order.deliveryNotes ? `Note: ${order.deliveryNotes}\n` : ''}\nWe appreciate your order!`;
    const cleanPhone = (order.customerPhone || '').replace(/[^0-9]/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-800" />
            <span>Customers, Credit Book & Orders</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage local customer accounts, collect credit balances, and fulfill pre-orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPublicCatalogue}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold rounded-xl transition"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Digital Catalogue Link</span>
          </button>

          {activeTab === 'customers' ? (
            <button
              onClick={() => setIsAddingCustomer(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddingOrder(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Credit Book Summary Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-3xl p-5 text-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs text-stone-400 font-semibold uppercase tracking-wider">
            Total Outstanding Customer Credit Book
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">
            {formatZAR(totalOutstandingCredit)}
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">
            Informal township book accounts waiting for settlement.
          </div>
        </div>

        <div className="p-3 bg-stone-800/80 rounded-2xl border border-stone-700 text-xs text-stone-300 max-w-xs">
          💡 <strong>Tip for Spaza Owners:</strong> Always record the partial payment immediately when a customer pays R50 towards their R100 debt to keep the book in sync.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 text-xs font-semibold pb-2">
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-3.5 py-1.5 rounded-xl transition ${
            activeTab === 'customers' ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Customer Book ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3.5 py-1.5 rounded-xl transition ${
            activeTab === 'orders' ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Advance Orders ({orders.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder={activeTab === 'customers' ? 'Search customer by name or phone...' : 'Search order number, customer...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-2xs"
        />
      </div>

      {/* TAB 1: CUSTOMERS TABLE */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50/80 text-stone-600 font-semibold border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Phone Number</th>
                  <th className="p-3.5">Notes & Terms</th>
                  <th className="p-3.5 text-right">Owed Balance (Credit)</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/70 transition">
                    <td className="p-3.5 font-bold text-stone-900">
                      {c.name}
                    </td>
                    <td className="p-3.5 text-stone-600 whitespace-nowrap">
                      {c.phone ? (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-stone-400" />
                          {c.phone}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3.5 text-stone-600 max-w-sm truncate">
                      {c.notes || 'No special terms'}
                    </td>
                    <td className="p-3.5 text-right font-extrabold whitespace-nowrap">
                      {c.outstandingBalance > 0 ? (
                        <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                          {formatZAR(c.outstandingBalance)}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">Clear (R 0.00)</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      {c.phone && (
                        <button
                          onClick={() => {
                            const cleanPhone = c.phone?.replace(/[^0-9]/g, '');
                            const msg = `Sawubona ${c.name}, warm greeting from ${business.name}. Your current balance is ${formatZAR(c.outstandingBalance)}. Thank you for your support!`;
                            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-lg transition"
                        >
                          WhatsApp
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS TABLE */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50/80 text-stone-600 font-semibold border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Order #</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5 text-right">Total</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Order Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-50/70 transition">
                    <td className="p-3.5 font-bold text-stone-900 whitespace-nowrap">
                      {o.orderNumber}
                    </td>
                    <td className="p-3.5 text-stone-600 whitespace-nowrap">
                      {formatDateSA(o.orderDate)}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-stone-900">{o.customerName}</div>
                      <div className="text-[10px] text-stone-500 font-mono">{o.customerPhone}</div>
                    </td>
                    <td className="p-3.5 text-stone-600 max-w-xs truncate">
                      {o.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-stone-900 whitespace-nowrap">
                      {formatZAR(o.total)}
                    </td>
                    <td className="p-3.5 whitespace-nowrap uppercase text-[10px] font-bold text-stone-600">
                      {o.paymentStatus}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o, e.target.value as any)}
                        className="px-2 py-1 rounded-lg border border-stone-200 bg-stone-50 text-[11px] font-semibold text-stone-800 focus:outline-none"
                      >
                        <option value="new">New</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => sendWhatsAppOrderNotice(o)}
                        className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                        title="Send WhatsApp Order Status"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD CUSTOMER MODAL */}
      {isAddingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <form onSubmit={handleCreateCustomer} className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-sm font-bold text-stone-900">Add Customer to Book</h3>
              <button type="button" onClick={() => setIsAddingCustomer(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Sis Zodwa, Bra Mike"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Phone Number (For WhatsApp / SMS)
              </label>
              <input
                type="text"
                placeholder="e.g. +27 82 123 4567"
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Notes / Terms
              </label>
              <textarea
                placeholder="e.g. Settles account on SASSA pay day"
                value={custNotes}
                onChange={(e) => setCustNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingCustomer(false)}
                className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition"
              >
                Save Customer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD ORDER MODAL */}
      {isAddingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <form onSubmit={handleCreateOrder} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-sm font-bold text-stone-900">Record Advance Order</h3>
              <button type="button" onClick={() => setIsAddingOrder(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mama Nomsa"
                  value={orderCustomerName}
                  onChange={(e) => setOrderCustomerName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. +27 82 550 3119"
                  value={orderCustomerPhone}
                  onChange={(e) => setOrderCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Line item draft */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Order Items
              </label>
              {orderItemsDraft.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <select
                    value={item.productId}
                    onChange={(e) => {
                      const updated = [...orderItemsDraft];
                      updated[idx].productId = e.target.value;
                      setOrderItemsDraft(updated);
                    }}
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs truncate focus:outline-none"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({formatZAR(p.sellingPrice)})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const updated = [...orderItemsDraft];
                      updated[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                      setOrderItemsDraft(updated);
                    }}
                    className="w-16 bg-stone-50 border border-stone-200 rounded-xl px-2 py-1.5 text-xs text-center font-bold focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Payment Status
                </label>
                <select
                  value={orderPaymentStatus}
                  onChange={(e) => setOrderPaymentStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
                >
                  <option value="unpaid">Unpaid (Cash on collection)</option>
                  <option value="paid">Paid in Full (EFT / Advance)</option>
                  <option value="partial">Deposit Paid</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Collection Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Collect Friday 14:00"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingOrder(false)}
                className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition"
              >
                Save Order
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
