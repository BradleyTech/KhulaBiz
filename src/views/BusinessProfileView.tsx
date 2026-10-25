import React, { useState } from 'react';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Printer, 
  Share2, 
  Download, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Building2,
  Save,
  Globe
} from 'lucide-react';
import { Business, SAProvince, BusinessType } from '../types';
import { storage } from '../services/storage';

interface BusinessProfileViewProps {
  business: Business;
  onOpenPrintSummary: () => void;
  onOpenPublicCatalogue: () => void;
  onSuccess: (msg: string) => void;
}

export const BusinessProfileView: React.FC<BusinessProfileViewProps> = ({
  business,
  onOpenPrintSummary,
  onOpenPublicCatalogue,
  onSuccess,
}) => {
  const [name, setName] = useState<string>(business.name);
  const [businessType, setBusinessType] = useState<BusinessType>(business.businessType);
  const [townOrCity, setTownOrCity] = useState<string>(business.townOrCity);
  const [province, setProvince] = useState<SAProvince>(business.province);
  const [address, setAddress] = useState<string>(business.address || '');
  const [contactPhone, setContactPhone] = useState<string>(business.contactPhone || '');
  const [contactEmail, setContactEmail] = useState<string>(business.contactEmail || '');
  const [description, setDescription] = useState<string>(business.description || '');
  const [allowNegativeStock, setAllowNegativeStock] = useState<boolean>(business.allowNegativeStock);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Business = {
      ...business,
      name: name.trim(),
      businessType,
      townOrCity: townOrCity.trim(),
      province,
      address: address.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim(),
      description: description.trim(),
      allowNegativeStock,
    };

    storage.saveBusiness(updated);
    onSuccess('Business profile updated successfully!');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-800" />
            <span>Business Profile & Digital Storefront</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure your enterprise details, print monthly statements, and manage public catalogue access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPrintSummary}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition"
          >
            <Printer className="w-3.5 h-3.5 text-stone-600" />
            <span>Print Monthly Statement</span>
          </button>

          <button
            onClick={onOpenPublicCatalogue}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Storefront</span>
          </button>
        </div>
      </div>

      {/* Main Profile Form & Public Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Editor Form (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              Official Enterprise Information
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Business Trading Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Business Type
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
                >
                  <option value="Spaza & Convenience">Spaza & Convenience</option>
                  <option value="Food & Eatery">Food & Eatery</option>
                  <option value="Hair & Beauty Salon">Hair & Beauty Salon</option>
                  <option value="Independent Services">Independent Services</option>
                  <option value="Clothing & Retail">Clothing & Retail</option>
                  <option value="Artisan & Trade">Artisan & Trade</option>
                  <option value="Agriculture & Poultry">Agriculture & Poultry</option>
                  <option value="Other Microbusiness">Other Microbusiness</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Province
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value as SAProvince)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
                >
                  <option value="Gauteng">Gauteng</option>
                  <option value="Western Cape">Western Cape</option>
                  <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                  <option value="Eastern Cape">Eastern Cape</option>
                  <option value="Limpopo">Limpopo</option>
                  <option value="Mpumalanga">Mpumalanga</option>
                  <option value="Free State">Free State</option>
                  <option value="North West">North West</option>
                  <option value="Northern Cape">Northern Cape</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Town or City
                </label>
                <input
                  type="text"
                  value={townOrCity}
                  onChange={(e) => setTownOrCity(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Street / Stand Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Stand 402, Section B"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Contact Phone (Public WhatsApp)
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. +27 72 000 0000"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Contact Email (Optional)
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. info@mybusiness.co.za"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Business Description (Shown on Public Storefront)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Tell neighbourhood customers about your shop, fresh daily bread, operating hours..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Public Storefront Preview Card (1 col) */}
        <div className="space-y-4">
          <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Public Storefront Preview
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                Live Link
              </span>
            </div>

            <div className="p-4 bg-stone-800/80 rounded-2xl border border-stone-700 space-y-2">
              <h4 className="text-base font-extrabold text-white">{name}</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                {description || 'Neighbourhood grocery and daily essentials.'}
              </p>
              <div className="pt-2 border-t border-stone-700 text-[11px] text-stone-400 space-y-1">
                <div>📍 {address || `${townOrCity}, ${province}`}</div>
                <div>📞 {contactPhone || 'Available upon request'}</div>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-[11px] text-emerald-200 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Financial Leakage</span>
              </div>
              <p className="text-stone-300 leading-tight">
                Customers visiting your storefront can view products and submit orders, but <strong>never</strong> see your profits, costs, or internal financial ledger.
              </p>
            </div>

            <button
              onClick={onOpenPublicCatalogue}
              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Launch Storefront Preview</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
