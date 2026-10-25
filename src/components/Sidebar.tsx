import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Receipt, 
  Boxes, 
  Users, 
  Activity, 
  TrendingUp, 
  Store, 
  Settings, 
  Printer, 
  Share2,
  Sparkles,
  ExternalLink,
  Sliders,
  LogOut,
  Bot
} from 'lucide-react';
import { Business } from '../types';

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  business: Business;
  user: any;
  onOpenPrintSummary: () => void;
  onOpenPublicCatalogue: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  business,
  user,
  onOpenPrintSummary,
  onOpenPublicCatalogue,
  onLogout,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'sales', label: 'Sales & Till', icon: ShoppingBag },
    { id: 'expenses', label: 'Expenses & Overheads', icon: Receipt },
    { id: 'products', label: 'Products & Inventory', icon: Boxes },
    { id: 'customers', label: 'Customers & Credit Book', icon: Users },
    { 
      id: 'pulse', 
      label: 'Business Pulse', 
      icon: Activity, 
      isPulse: true 
    },
    { 
      id: 'ai', 
      label: 'KhulaBiz AI Advisor', 
      icon: Sparkles,
      isAi: true,
    },
    { id: 'growth', label: 'Growth & Funding Plan', icon: TrendingUp },
    { id: 'profile', label: 'Storefront & Profile', icon: Store },
    { id: 'settings', label: 'Settings & Security', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#070d1e] text-slate-300 border-r border-white/[0.08] shrink-0 select-none">
      
      {/* Business Workspace Badge */}
      <div className="p-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-sm shadow-xs">
            {business.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h2 className="text-xs font-bold text-white truncate">{business.name}</h2>
            <p className="text-[10px] text-slate-400 truncate">{business.townOrCity}</p>
          </div>
        </div>

        {/* Public Storefront Pill */}
        <button
          onClick={onOpenPublicCatalogue}
          className="mt-3 w-full py-1.5 px-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-[11px] text-cyan-400 flex items-center justify-between font-medium transition group"
        >
          <span className="flex items-center gap-1.5 truncate">
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate">Public Storefront</span>
          </span>
          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-cyan-400 shrink-0" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/10 border border-cyan-500/40 text-cyan-300 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.label}</span>
              </div>

              {item.isPulse && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  Pulse
                </span>
              )}

              {item.isAi && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Gemini
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User / Bottom Actions */}
      <div className="p-3 border-t border-white/[0.08] bg-black/40 space-y-2">
        <button
          onClick={onOpenPrintSummary}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] rounded-xl transition"
        >
          <Printer className="w-4 h-4 text-slate-400" />
          <span>Print Monthly Summary</span>
        </button>

        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between px-2">
          <div className="truncate pr-2">
            <div className="text-xs font-semibold text-white truncate">{user?.name || 'Entrepreneur'}</div>
            <div className="text-[10px] text-slate-400 truncate">{user?.email || 'Logged in'}</div>
          </div>
          <button
            onClick={onLogout}
            title="Log out of account"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/[0.05] transition shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
