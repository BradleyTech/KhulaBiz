import React, { useState } from 'react';
import { 
  Boxes, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  AlertTriangle, 
  Edit3, 
  Archive, 
  History, 
  TrendingUp, 
  DollarSign, 
  X, 
  Check, 
  PackageCheck,
  PackageX,
  Truck,
  RotateCcw
} from 'lucide-react';
import { Product, Business, StockMovement } from '../types';
import { formatZAR, formatDateSA, formatDateTimeSA } from '../utils/formatters';
import { exportInventoryCSV } from '../services/exportUtils';
import { storage } from '../services/storage';

interface ProductsViewProps {
  business: Business;
  products: Product[];
  stockMovements: StockMovement[];
  onOpenQuickAdd: (tab?: 'sale' | 'expense' | 'stock') => void;
  onSuccess: (msg: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  business,
  products,
  stockMovements,
  onOpenQuickAdd,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'movements' | 'reorder'>('inventory');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out' | 'healthy'>('all');

  // Product Edit / Create Modal State
  const [isEditingProduct, setIsEditingProduct] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [prodName, setProdName] = useState<string>('');
  const [prodSku, setProdSku] = useState<string>('');
  const [prodCategory, setProdCategory] = useState<string>('Pantry & Groceries');
  const [prodSellingPrice, setProdSellingPrice] = useState<string>('');
  const [prodUnitCost, setProdUnitCost] = useState<string>('');
  const [prodQuantity, setProdQuantity] = useState<string>('10');
  const [prodThreshold, setProdThreshold] = useState<string>('5');
  const [prodSupplier, setProdSupplier] = useState<string>('');
  const [prodDescription, setProdDescription] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Valuations
  const activeProducts = products.filter(p => !p.isArchived);
  const totalValuationCost = activeProducts.reduce((sum, p) => sum + (p.currentQuantity * p.unitCost), 0);
  const totalValuationRetail = activeProducts.reduce((sum, p) => sum + (p.currentQuantity * p.sellingPrice), 0);
  const lowStockProducts = activeProducts.filter(p => p.currentQuantity > 0 && p.currentQuantity <= p.lowStockThreshold);
  const outOfStockProducts = activeProducts.filter(p => p.currentQuantity <= 0);

  // Filter
  const filteredProducts = activeProducts.filter(p => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (stockStatusFilter === 'out' && p.currentQuantity > 0) return false;
    if (stockStatusFilter === 'low' && (p.currentQuantity <= 0 || p.currentQuantity > p.lowStockThreshold)) return false;
    if (stockStatusFilter === 'healthy' && p.currentQuantity <= p.lowStockThreshold) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchSupp = (p.supplier || '').toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchSupp) return false;
    }
    return true;
  });

  const categories = Array.from(new Set(activeProducts.map(p => p.category)));

  const openCreateModal = () => {
    setEditingId(null);
    setProdName('');
    setProdSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setProdCategory('Pantry & Groceries');
    setProdSellingPrice('');
    setProdUnitCost('');
    setProdQuantity('10');
    setProdThreshold('5');
    setProdSupplier('Metro Cash & Carry Devland');
    setProdDescription('');
    setFormError('');
    setIsEditingProduct(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setProdName(product.name);
    setProdSku(product.sku);
    setProdCategory(product.category);
    setProdSellingPrice(product.sellingPrice.toString());
    setProdUnitCost(product.unitCost.toString());
    setProdQuantity(product.currentQuantity.toString());
    setProdThreshold(product.lowStockThreshold.toString());
    setProdSupplier(product.supplier || '');
    setProdDescription(product.description || '');
    setFormError('');
    setIsEditingProduct(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!prodName.trim()) {
      setFormError('Please enter a valid product name.');
      return;
    }

    const selling = parseFloat(prodSellingPrice);
    const cost = parseFloat(prodUnitCost);
    const qty = parseInt(prodQuantity, 10);
    const threshold = parseInt(prodThreshold, 10);

    if (isNaN(selling) || selling <= 0) {
      setFormError('Please enter a valid positive selling price.');
      return;
    }

    if (isNaN(cost) || cost < 0) {
      setFormError('Please enter a valid unit cost price.');
      return;
    }

    const newProduct: Product = {
      id: editingId || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      businessId: business.id,
      name: prodName.trim(),
      sku: prodSku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      category: prodCategory,
      sellingPrice: selling,
      unitCost: cost,
      currentQuantity: isNaN(qty) ? 0 : qty,
      lowStockThreshold: isNaN(threshold) ? 5 : threshold,
      supplier: prodSupplier.trim() || undefined,
      description: prodDescription.trim() || undefined,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      storage.saveProduct(newProduct);
      onSuccess(`Product ${newProduct.name} saved successfully.`);
      setIsEditingProduct(false);
    } catch (err: any) {
      setFormError(err?.message || 'Error saving product.');
    }
  };

  const handleArchiveProduct = (product: Product) => {
    if (confirm(`Archive ${product.name}? It will no longer appear in your active catalogue.`)) {
      product.isArchived = true;
      storage.saveProduct(product);
      onSuccess(`Archived ${product.name}`);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-800" />
            <span>Products & Inventory Management</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time stock quantities, valuation at cost, reorder quantities, and audit trail movements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportInventoryCSV(business.name, activeProducts)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => onOpenQuickAdd('stock')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 text-xs font-bold rounded-xl transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
            <span>Adjust Stock</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Stock Valuation Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Inventory Value (Cost)</div>
          <div className="text-lg sm:text-xl font-extrabold text-stone-900 mt-1">{formatZAR(totalValuationCost)}</div>
          <div className="text-[10px] text-stone-500">What you paid suppliers</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Inventory Value (Retail)</div>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-950 mt-1">{formatZAR(totalValuationRetail)}</div>
          <div className="text-[10px] text-emerald-700 font-medium">Potential retail turnover</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider">Low Stock Warning</div>
          <div className="text-lg sm:text-xl font-extrabold text-amber-900 mt-1">{lowStockProducts.length} items</div>
          <div className="text-[10px] text-amber-700">At or below safe threshold</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-[10px] font-semibold text-red-800 uppercase tracking-wider">Out of Stock</div>
          <div className="text-lg sm:text-xl font-extrabold text-red-900 mt-1">{outOfStockProducts.length} items</div>
          <div className="text-[10px] text-red-700">Lost customer sales risk</div>
        </div>
      </div>

      {/* Sub Tabs: Inventory Catalogue vs Stock Movements Log */}
      <div className="flex items-center gap-2 border-b border-stone-200 text-xs font-semibold pb-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3 py-1.5 rounded-xl transition ${
            activeTab === 'inventory' ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Product Catalogue ({activeProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`px-3 py-1.5 rounded-xl transition ${
            activeTab === 'movements' ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Audit Stock Movements ({stockMovements.length})
        </button>
      </div>

      {/* TAB 1: PRODUCT CATALOGUE */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          
          {/* Search & Category Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search product name, SKU, supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs font-semibold">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'low', label: 'Low Stock' },
                { id: 'out', label: 'Out of Stock' },
                { id: 'healthy', label: 'Healthy Stock' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStockStatusFilter(f.id as any)}
                  className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition ${
                    stockStatusFilter === f.id ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50/80 text-stone-600 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="p-3.5">Product Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Current Stock</th>
                    <th className="p-3.5 text-right">Unit Cost</th>
                    <th className="p-3.5 text-right">Selling Price</th>
                    <th className="p-3.5 text-right">Margin</th>
                    <th className="p-3.5">Supplier</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredProducts.map((p) => {
                    const isOut = p.currentQuantity <= 0;
                    const isLow = p.currentQuantity > 0 && p.currentQuantity <= p.lowStockThreshold;
                    const margin = p.sellingPrice > 0 ? ((p.sellingPrice - p.unitCost) / p.sellingPrice) * 100 : 0;

                    return (
                      <tr key={p.id} className="hover:bg-stone-50/70 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-stone-900">{p.name}</div>
                          <div className="text-[10px] text-stone-400 font-mono">{p.sku}</div>
                        </td>
                        <td className="p-3.5 text-stone-600 whitespace-nowrap">
                          {p.category}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-stone-900 text-sm">{p.currentQuantity}</span>
                            <span className="text-[10px] text-stone-400">/ min {p.lowStockThreshold}</span>
                            {isOut ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                                Out
                              </span>
                            ) : isLow ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                Low
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800">
                                OK
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 text-right font-medium text-stone-600 whitespace-nowrap">
                          {formatZAR(p.unitCost)}
                        </td>
                        <td className="p-3.5 text-right font-extrabold text-stone-900 whitespace-nowrap">
                          {formatZAR(p.sellingPrice)}
                        </td>
                        <td className="p-3.5 text-right font-semibold text-emerald-800 whitespace-nowrap">
                          {margin.toFixed(0)}%
                        </td>
                        <td className="p-3.5 text-stone-500 whitespace-nowrap max-w-[140px] truncate">
                          {p.supplier || '—'}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                          <button
                            onClick={() => openEditModal(p)}
                            title="Edit Product"
                            className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-stone-100 rounded-lg transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleArchiveProduct(p)}
                            title="Archive Product"
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: AUDIT STOCK MOVEMENTS LOG */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Chronological Inventory Audit Trail
            </h3>
            <span className="text-[11px] text-stone-500">Every sale, restock, and adjustment is recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50/80 text-stone-600 font-semibold border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Action Type</th>
                  <th className="p-3.5 text-center">Change</th>
                  <th className="p-3.5">Before → After</th>
                  <th className="p-3.5">Reason / Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {stockMovements.map((sm) => (
                  <tr key={sm.id} className="hover:bg-stone-50/70 transition">
                    <td className="p-3.5 text-stone-500 whitespace-nowrap">
                      {formatDateTimeSA(sm.createdAt)}
                    </td>
                    <td className="p-3.5 font-bold text-stone-900 whitespace-nowrap">
                      {sm.productName}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {sm.type}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-extrabold whitespace-nowrap">
                      <span className={sm.quantityChange > 0 ? 'text-emerald-700' : 'text-red-600'}>
                        {sm.quantityChange > 0 ? `+${sm.quantityChange}` : sm.quantityChange}
                      </span>
                    </td>
                    <td className="p-3.5 text-stone-600 font-medium whitespace-nowrap">
                      {sm.previousQuantity} → <strong className="text-stone-900">{sm.newQuantity}</strong>
                    </td>
                    <td className="p-3.5 text-stone-600 max-w-sm truncate">
                      {sm.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRODUCT CREATE / EDIT MODAL */}
      {isEditingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
          <form onSubmit={handleSaveProduct} className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-sm font-bold text-stone-900">
                {editingId ? 'Edit Product Details' : 'Add New Product to Inventory'}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsEditingProduct(false)} 
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Albany Superior White Bread 700g"
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
                >
                  <option value="Bakery & Staples">Bakery & Fresh Bread</option>
                  <option value="Pantry & Groceries">Pantry & Cooking Essentials</option>
                  <option value="Dairy & Eggs">Dairy, Milk & Eggs</option>
                  <option value="Beverages">Cold Drinks & Beverages</option>
                  <option value="Household & Cleaning">Household & Cleaning</option>
                  <option value="Airtime & Services">Airtime & Mobile Vouchers</option>
                  <option value="Personal Care">Toiletries & Personal Care</option>
                  <option value="Other">Other Products</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  SKU or Reference Code
                </label>
                <input
                  type="text"
                  value={prodSku}
                  onChange={(e) => setProdSku(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Unit Cost Price (ZAR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="e.g. 15.00"
                  value={prodUnitCost}
                  onChange={(e) => setProdUnitCost(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Selling Price (ZAR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  placeholder="e.g. 19.50"
                  value={prodSellingPrice}
                  onChange={(e) => setProdSellingPrice(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-emerald-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Current Stock Quantity
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={prodQuantity}
                  onChange={(e) => setProdQuantity(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={prodThreshold}
                  onChange={(e) => setProdThreshold(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Supplier Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Metro Cash & Carry, Albany Depot"
                value={prodSupplier}
                onChange={(e) => setProdSupplier(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsEditingProduct(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
