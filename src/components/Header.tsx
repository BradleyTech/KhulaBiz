import React, { useState } from 'react';
import { 
  Building2, 
  RotateCcw, 
  Plus, 
  Award, 
  Menu, 
  ChevronDown, 
  LogOut,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Business } from '../types';

interface HeaderProps {
  business: Business;
  businesses: Business[];
  user: any;
  onSelectBusiness: (id: string) => void;
  onOpenQuickAdd: (tab?: 'sale' | 'expense' | 'stock') => void;
  onOpenOnboarding: () => void;
  onOpenJudgeModal: () => void;
  onResetDemo: () => void;
  onOpenMobileMenu: () => void;
  onLogout: () => void;
  activeView: string;
}

export const Header: React.FC<HeaderProps> = ({
  business,
  businesses,
  user,
  onSelectBusiness,
  onOpenQuickAdd,
  onOpenOnboarding,
  onOpenJudgeModal,
  onResetDemo,
  onOpenMobileMenu,
  onLogout,
}) => {
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#070d1e]/90 backdrop-blur-xl border-b border-white/[0.08] px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left Brand & Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 -ml-1 text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-xl focus:outline-none"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Wordmark & Growth Emblem */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/40">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 3v10m0 0l-3-3m3 3l3-3M5 19a7 7 0 0114 0H5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <circle cx="12" cy="18" r="1.5" className="fill-cyan-200"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-white">Khula<span className="text-cyan-400">Biz</span></span>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                    Pro
                  </span>
                </div>
                <span className="hidden sm:block text-[10px] text-slate-400 font-medium -mt-0.5">
                  FNB App of the Year 2026
                </span>
              </div>
            </div>

            {/* Workspace Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] transition text-left text-xs font-semibold text-slate-200 max-w-[150px] sm:max-w-[210px] truncate"
              >
                <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">{business.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-auto" />
              </button>

              {showSwitchDropdown && (
                <div className="absolute left-0 mt-1.5 w-64 bg-[#0a1128] rounded-2xl shadow-2xl border border-white/[0.12] py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-white/[0.06] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Workspaces
                  </div>
                  {businesses.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        onSelectBusiness(b.id);
                        setShowSwitchDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-white/[0.06] transition ${
                        b.id === business.id ? 'bg-cyan-500/15 text-cyan-300 font-bold' : 'text-slate-300'
                      }`}
                    >
                      <div className="truncate">
                        <div className="truncate font-semibold">{b.name}</div>
                        <div className="text-[10px] text-slate-400">{b.townOrCity}, {b.province}</div>
                      </div>
                      {b.isDemo && (
                        <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold ml-2">
                          Demo
                        </span>
                      )}
                    </button>
                  ))}
                  <div className="border-t border-white/[0.06] mt-1 pt-1">
                    <button
                      onClick={() => {
                        setShowSwitchDropdown(false);
                        onOpenOnboarding();
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-cyan-400 hover:bg-cyan-500/10 font-bold flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add New Business Workspace
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Demo indicator & Reset */}
            {business.isDemo && (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>Demo Mode</span>
                </div>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  title="Reset benchmark demo data"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.06] text-xs font-semibold transition"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Reset Demo</span>
                </button>
              </div>
            )}

            {/* Hackathon Judge Center Button */}
            <button
              onClick={onOpenJudgeModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition text-xs font-semibold shadow-xs"
            >
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Hackathon Pitch & Deck</span>
              <span className="md:hidden">Pitch</span>
            </button>

            {/* Quick Record Button */}
            <button
              onClick={() => onOpenQuickAdd('sale')}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-95 text-slate-950 text-xs sm:text-sm font-extrabold shadow-lg shadow-cyan-500/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Quick Record</span>
              <span className="sm:hidden">Record</span>
            </button>

            {/* Sign Out Button */}
            <button
              onClick={onLogout}
              title="Sign out"
              className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/[0.06] transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Demo Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0a1128] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-amber-500/30 animate-in zoom-in-95 duration-150 text-slate-100 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Reset Benchmark Data?</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                This will restore all sales, inventory levels, overhead expenses, and orders for <strong className="text-white">Thabo's Corner Store</strong> back to its clean initial hackathon benchmark dataset.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetDemo();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition shadow-md"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
