import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  ShoppingBag, 
  Wallet, 
  Database, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X,
  Store,
  Layers,
  Coins
} from 'lucide-react';
import { Business, BusinessType, SAProvince } from '../types';
import { storage } from '../services/storage';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBusinessCreated: (business: Business) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onBusinessCreated,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form states
  const [businessName, setBusinessName] = useState<string>('');
  const [businessType, setBusinessType] = useState<BusinessType>('Spaza & Convenience');
  const [townOrCity, setTownOrCity] = useState<string>('');
  const [province, setProvince] = useState<SAProvince>('Gauteng');
  const [offerType, setOfferType] = useState<'products' | 'services' | 'both'>('products');
  const [startingCash, setStartingCash] = useState<string>('2500');
  const [loadSampleData, setLoadSampleData] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 2 && !businessName.trim()) {
      return;
    }
    if (step < 6) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const finishOnboarding = () => {
    const slug = (businessName.trim() || 'my-business')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');

    const newBusiness: Business = {
      id: `biz_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: businessName.trim() || 'My Business',
      businessType,
      townOrCity: townOrCity.trim() || 'Johannesburg',
      province,
      offerType,
      currency: 'ZAR',
      startingCashBalance: parseFloat(startingCash) || 0,
      contactPhone: '',
      contactEmail: '',
      address: `${townOrCity.trim() || 'Township'}, ${province}`,
      description: `South African microbusiness trading in ${townOrCity || 'Gauteng'}.`,
      publicCatalogueSlug: slug,
      allowNegativeStock: false,
      createdAt: new Date().toISOString(),
      isDemo: false,
    };

    storage.createNewBusiness(newBusiness, loadSampleData);
    onBusinessCreated(newBusiness);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Progress Bar */}
        <div className="bg-stone-100 h-1.5 w-full">
          <div 
            className="bg-emerald-600 h-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        {/* Modal Top Bar */}
        <div className="px-6 pt-5 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
              {step}
            </span>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Step {step} of 6
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Contents */}
        <div className="px-6 py-5">
          
          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 mx-auto flex items-center justify-center shadow-xs">
                <Store className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
                  Welcome to Khula<span className="text-emerald-600">Biz</span>
                </h2>
                <p className="text-xs text-emerald-800 font-semibold mt-1">
                  "Know your numbers. Spot your next move. Grow your business."
                </p>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed max-w-md mx-auto">
                KhulaBiz is built specifically for South African spaza shops, township traders, food sellers, and micro-entrepreneurs. Turn everyday sales into clear decisions without complicated accounting jargon.
              </p>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-left text-xs text-stone-700 space-y-1.5">
                <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  What you will get:
                </div>
                <div className="text-[11px] text-stone-600 space-y-1 pl-5">
                  <div>• Real-time cash runway and profit calculation in ZAR</div>
                  <div>• Business Pulse stockout warning before bread/oil runs out</div>
                  <div>• Customer credit book to track neighbour accounts</div>
                  <div>• Funding-readiness and printable monthly statement</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BUSINESS DETAILS */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-stone-900">Your Business Details</h3>
                <p className="text-xs text-stone-500">Tell us what your business is called and where you trade.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kopano Fresh Produce, Lindiwe Salon"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Business Type
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Spaza & Convenience">Spaza & Convenience Store</option>
                    <option value="Food & Eatery">Food, Bakery & Eatery</option>
                    <option value="Hair & Beauty Salon">Hair & Beauty Salon</option>
                    <option value="Clothing & Retail">Clothing & Retail</option>
                    <option value="Artisan & Trade">Artisan & Trade (Mechanic, Carpentry)</option>
                    <option value="Independent Services">Independent Services / Repairs</option>
                    <option value="Agriculture & Poultry">Agriculture & Poultry</option>
                    <option value="Other Microbusiness">Other Microbusiness</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Town or City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Soweto, Tembisa"
                      value={townOrCity}
                      onChange={(e) => setTownOrCity(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
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
              </div>
            </div>
          )}

          {/* STEP 3: OFFER TYPE */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-stone-900">What do you sell?</h3>
                <p className="text-xs text-stone-500">KhulaBiz tailors inventory and transaction prompts based on your offerings.</p>
              </div>

              <div className="space-y-2.5">
                {[
                  { id: 'products', title: 'Physical Products', desc: 'Groceries, bread, drinks, packaged items with stock counts' },
                  { id: 'services', title: 'Services & Labour', desc: 'Hair styling, phone repairs, taxi rides, tutoring, catering' },
                  { id: 'both', title: 'Both Products & Services', desc: 'e.g. A salon that sells hair treatments or a café selling food & soda' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setOfferType(item.id as any)}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-start justify-between transition ${
                      offerType === item.id
                        ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-stone-900">{item.title}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">{item.desc}</div>
                    </div>
                    {offerType === item.id && (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: STARTING CASH BALANCE */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-stone-900">Starting Cash in Hand</h3>
                <p className="text-xs text-stone-500">
                  How much cash is currently in your till, float, or shop bank account? (Optional)
                </p>
              </div>

              <div>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-sm font-bold text-stone-500">R</span>
                  <input
                    type="number"
                    step="50"
                    placeholder="2500"
                    value={startingCash}
                    onChange={(e) => setStartingCash(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-base font-extrabold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">
                  KhulaBiz uses this starting balance to compute your real-time cash runway: adding paid cash sales and subtracting cash expenses. You can change this anytime.
                </p>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                💡 <strong>Privacy Guarantee:</strong> KhulaBiz never asks for your bank password, PIN, or confidential ID. Your records stay local and under your control.
              </div>
            </div>
          )}

          {/* STEP 5: SAMPLE DATA OPT-IN */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-stone-900">Load Sample Products?</h3>
                <p className="text-xs text-stone-500">
                  Choose whether you want typical South African staple products pre-loaded or prefer a clean blank slate.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setLoadSampleData(true)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-start justify-between transition ${
                    loadSampleData
                      ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-stone-900">Pre-load popular South African staples</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Includes Albany bread, 2L cooking oil, 5kg maize meal, milk, eggs, cold drinks, and airtime vouchers with standard wholesale prices.
                    </div>
                  </div>
                  {loadSampleData && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setLoadSampleData(false)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-start justify-between transition ${
                    !loadSampleData
                      ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-stone-900">Start with a clean blank slate</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      I will add my own products and services from scratch.
                    </div>
                  </div>
                  {!loadSampleData && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: READY */}
          {step === 6 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center shadow-xs">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-stone-900">Your Workspace is Ready!</h3>
                <p className="text-xs text-stone-600 mt-1">
                  We've configured <strong className="text-stone-900">{businessName || 'Your Business'}</strong> for trading in {townOrCity || 'South Africa'}, {province}.
                </p>
              </div>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-left text-xs space-y-1.5 text-stone-700">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Business:</span>
                  <span className="font-semibold text-stone-900">{businessName || 'New Business'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Category:</span>
                  <span className="font-medium text-stone-800">{businessType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Starting Cash:</span>
                  <span className="font-medium text-emerald-800">R {parseFloat(startingCash || '0').toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Initial Products:</span>
                  <span className="font-medium text-stone-800">{loadSampleData ? '10 Staple Products' : 'Blank (0 items)'}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-stone-500 hover:text-stone-800 transition"
            >
              Explore Demo Instead
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={step === 2 && !businessName.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition active:scale-95"
          >
            <span>{step === 6 ? 'Open My Dashboard' : 'Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
