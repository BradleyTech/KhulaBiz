import React, { useState } from 'react';
import { 
  Store, 
  MapPin, 
  Phone, 
  Send, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Search, 
  ArrowLeft, 
  ShieldCheck, 
  Check, 
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { Business, Product } from '../types';
import { formatZAR } from '../utils/formatters';

interface PublicCatalogueViewProps {
  business: Business;
  products: Product[];
  onBackToApp: () => void;
}

export const PublicCatalogueView: React.FC<PublicCatalogueViewProps> = ({
  business,
  products,
  onBackToApp,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const activeProducts = products.filter(p => !p.isArchived);
  const categories = Array.from(new Set(activeProducts.map(p => p.category)));

  const filteredProducts = activeProducts.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
    }
    return true;
  });

  const cartItemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [pId, qty]) => {
    const prod = products.find(p => p.id === pId);
    return sum + (prod ? prod.sellingPrice * qty : 0);
  }, 0);

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[productId] > 1) {
        updated[productId] -= 1;
      } else {
        delete updated[productId];
      }
      return updated;
    });
  };

  const sendWhatsAppOrder = () => {
    const itemsText = Object.entries(cart).map(([pId, qty]) => {
      const p = products.find(prod => prod.id === pId);
      return `• ${qty}x ${p?.name} (${formatZAR(p ? p.sellingPrice * qty : 0)})`;
    }).join('\n');

    const msg = `*Customer Enquiry / Pre-Order*\nFrom: KhulaBiz Digital Catalogue\nShop: *${business.name}*\n\nHello, I would like to order the following items:\n${itemsText}\n\n*Estimated Total:* ${formatZAR(cartTotal)}\n\nPlease let me know when these will be ready for collection. Thank you!`;
    const cleanPhone = (business.contactPhone || '').replace(/[^0-9]/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans">
      
      {/* Top Banner (Navigation & Privacy Indicator) */}
      <div className="sticky top-0 z-30 bg-stone-900 text-stone-200 px-4 py-2.5 shadow-md flex items-center justify-between">
        <button
          onClick={onBackToApp}
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Preview (Back to Portal)</span>
        </button>

        <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Public Storefront Mode (Financial ledger hidden)</span>
          <span className="sm:hidden">Public View</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-900 text-white py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-sm border border-white/20">
              {business.name.charAt(0)}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              {business.businessType}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{business.name}</h1>
          <p className="text-xs sm:text-sm text-stone-200 max-w-xl leading-relaxed">
            {business.description || 'Welcome to our local storefront. Browse our current stock and place orders directly via WhatsApp.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-300 pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {business.address || `${business.townOrCity}, ${business.province}`}
            </span>
            {business.contactPhone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                {business.contactPhone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Search & Categories */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search products, bread, drinks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                selectedCategory === 'all' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              All Items ({activeProducts.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                  selectedCategory === cat ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => {
            const isOutOfStock = p.currentQuantity <= 0;
            const inCartQty = cart[p.id] || 0;

            return (
              <div 
                key={p.id} 
                className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs flex flex-col justify-between hover:shadow-xs transition"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-stone-400 font-semibold uppercase">
                    <span>{p.category}</span>
                    {isOutOfStock ? (
                      <span className="text-red-600 font-bold">Sold Out</span>
                    ) : (
                      <span className="text-emerald-700 font-bold">In Stock</span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 leading-snug">
                    {p.name}
                  </h3>

                  {p.description && (
                    <p className="text-[11px] text-stone-500 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between">
                  <div className="text-base font-black text-stone-900">
                    {formatZAR(p.sellingPrice)}
                  </div>

                  {inCartQty > 0 ? (
                    <div className="flex items-center gap-1.5 bg-stone-100 rounded-xl p-1">
                      <button
                        onClick={() => removeFromCart(p.id)}
                        className="w-6 h-6 rounded-lg bg-white shadow-2xs flex items-center justify-center text-stone-700 hover:bg-stone-200"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-stone-900">{inCartQty}</span>
                      <button
                        onClick={() => addToCart(p.id)}
                        className="w-6 h-6 rounded-lg bg-emerald-700 text-white shadow-2xs flex items-center justify-center hover:bg-emerald-800"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(p.id)}
                      disabled={isOutOfStock}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-2xs transition active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Floating Bottom Cart / WhatsApp Order Bar */}
      {cartItemCount > 0 && (
        <div className="sticky bottom-0 bg-stone-900 text-white p-4 shadow-2xl border-t border-stone-800 z-40">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-stone-400 font-semibold">
                {cartItemCount} item{cartItemCount > 1 ? 's' : ''} in enquiry list
              </div>
              <div className="text-base font-extrabold text-white">
                Total: <span className="text-emerald-400">{formatZAR(cartTotal)}</span>
              </div>
            </div>

            <button
              onClick={sendWhatsAppOrder}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Send Pre-Order via WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-stone-200/60 py-6 px-4 text-center text-xs text-stone-500">
        Powered by KhulaBiz — South African Small Business Platform • Orlando West, Soweto
      </footer>

    </div>
  );
};
