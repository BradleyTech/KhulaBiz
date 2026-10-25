
import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Plus, 
  Boxes, 
  Activity, 
  Receipt, 
  Users, 
  TrendingUp, 
  Store, 
  Settings, 
  Printer, 
  X, 
  Award,
  Share2,
  Sparkles,
  LogOut
} from 'lucide-react';
import { Business } from '../types';

interface BottomNavProps {
  activeView: string;
  onSelectView: (view: string) => void;
  onOpenQuickAdd: (tab?: 'sale' | 'expense' | 'stock') => void;
  onOpenPrintSummary: () => void;
  onOpenJudgeModal: () => void;
  onOpenPublicCatalogue: () => void;
  onLogout?: () => void;
  business: Business;
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeView,
  onSelectView,
  onOpenQuickAdd,
  onOpenPrintSummary,
  onOpenJudgeModal,
  onOpenPublicCatalogue,
  onLogout,
  business,
  isMobileMenuOpen,
  onCloseMobileMenu,
}) => {
  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070d1e]/95 backdrop-blur-xl border-t border-white/[0.08] px-2 py-1.5 shadow-2xl safe-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          
          {/* Overview */}
          <button
            onClick={() => onSelectView('overview')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition ${
              activeView === 'overview' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Overview</span>
          </button>

          {/* Sales */}
          <button
            onClick={() => onSelectView('sales')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition ${
              activeView === 'sales' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            <span>Sales</span>
          </button>

          {/* Floating Center Quick Add */}
          <button
            onClick={() => onOpenQuickAdd('sale')}
            className="flex flex-col items-center justify-center -mt-5"
            aria-label="Quick Record"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-emerald-500 to-indigo-600 hover:brightness-110 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 active:scale-95 transition border border-white/20">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-cyan-300 mt-0.5">Record</span>
          </button>

          {/* AI Advisor */}
          <button
            onClick={() => onSelectView('ai')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition relative ${
              activeView === 'ai' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 mb-0.5 text-cyan-400" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            </div>
            <span>AI Advisor</span>
          </button>

          {/* Business Pulse */}
          <button
            onClick={() => onSelectView('pulse')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition relative ${
              activeView === 'pulse' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Activity className="w-5 h-5 mb-0.5" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <span>Pulse</span>
          </button>
        </div>
      </nav>

      {/* Full Mobile Slide-in Drawer for Secondary Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            onClick={onCloseMobileMenu}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#0a1128] text-slate-200 border-r border-white/[0.08] shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-500 text-white flex items-center justify-center font-bold text-xs ring-1 ring-cyan-400/40">
                  KB
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{business.name}</h3>
                  <p className="text-[11px] text-slate-400">{business.townOrCity}</p>
                </div>
              </div>
              <button 
                onClick={onCloseMobileMenu}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b border-white/[0.08]">
              <button
                onClick={() => {
                  onCloseMobileMenu();
                  onOpenJudgeModal();
                }}
                className="w-full py-2 px-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center justify-between hover:bg-cyan-900/40 transition"
              >
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" />
                  Hackathon Deck & Pitch
                </span>
                <span className="text-[10px] uppercase tracking-wider bg-cyan-500/20 px-1.5 py-0.5 rounded text-cyan-300 font-bold border border-cyan-400/30">FNB</span>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs font-medium">
              {[
                { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
                { id: 'ai', label: 'KhulaBiz AI Advisor', icon: Sparkles, isAi: true },
                { id: 'pulse', label: 'Business Pulse Intelligence', icon: Activity, highlight: true },
                { id: 'sales', label: 'Sales Records', icon: ShoppingBag },
                { id: 'expenses', label: 'Expenses & Overheads', icon: Receipt },
                { id: 'products', label: 'Products & Inventory', icon: Boxes },
                { id: 'customers', label: 'Customers & Orders', icon: Users },
                { id: 'growth', label: 'Growth Plan & Funding Readiness', icon: TrendingUp },
                { id: 'profile', label: 'Business Profile & Storefront', icon: Store },
                { id: 'settings', label: 'Settings & Audit Trail', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectView(item.id);
                      onCloseMobileMenu();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                      isActive 
                        ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-semibold' 
                        : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${item.isAi ? 'text-cyan-400' : ''}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.highlight && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase">
                        AI
                      </span>
                    )}
                    {item.isAi && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold uppercase">
                        Gemini
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-white/[0.08] space-y-2">
              <button
                onClick={() => {
                  onCloseMobileMenu();
                  onOpenPublicCatalogue();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-white/[0.08] bg-white/[0.04] text-xs text-slate-200 hover:text-white hover:bg-white/[0.08]"
              >
                <Share2 className="w-4 h-4 text-cyan-400" />
                View Public Catalogue
              </button>
              <button
                onClick={() => {
                  onCloseMobileMenu();
                  onOpenPrintSummary();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-white/[0.08] bg-white/[0.04] text-xs text-slate-200 hover:text-white hover:bg-white/[0.08]"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                Print Monthly Summary
              </button>
              {onLogout && (
                <button
                  onClick={() => {
                    onCloseMobileMenu();
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-red-500/20 bg-red-500/10 text-xs text-red-300 hover:bg-red-500/20"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
