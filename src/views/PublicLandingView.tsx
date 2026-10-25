import React from 'react';
import { 
  ShoppingBag, 
  Receipt, 
  Boxes, 
  Users, 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Check, 
  ChevronRight, 
  Store, 
  Award, 
  Play, 
  Lock, 
  Layers, 
  Zap,
  DollarSign
} from 'lucide-react';
import { formatZAR } from '../utils/formatters';

interface PublicLandingViewProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onJudgeLogin: () => void;
}

export const PublicLandingView: React.FC<PublicLandingViewProps> = ({
  onOpenLogin,
  onOpenRegister,
  onJudgeLogin,
}) => {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-violet-600/10 rounded-full blur-[160px]" />
        <div className="absolute -bottom-40 left-1/3 w-[36rem] h-[36rem] bg-emerald-600/10 rounded-full blur-[180px]" />
      </div>

      {/* Top Floating Glass Navigation */}
      <header className="sticky top-0 z-50 px-4 sm:px-8 py-3.5 border-b border-white/[0.08] bg-[#030712]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 3v10m0 0l-3-3m3 3l3-3M5 19a7 7 0 0114 0H5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <circle cx="12" cy="18" r="1.5" className="fill-cyan-200"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                Khula<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Biz</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium -mt-1 hidden sm:block">
                FNB App of the Year 2026
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a>
            <a href="#south-africa" className="hover:text-cyan-400 transition-colors">Why South Africa</a>
            <a href="#security" className="hover:text-cyan-400 transition-colors">Security</a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Hackathon Judge Pill */}
            <button
              onClick={onJudgeLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/20 border border-amber-500/30 text-amber-300 hover:text-white text-xs font-bold transition hover:border-amber-400"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Judge Demo Access</span>
              <span className="sm:hidden">Judge</span>
            </button>

            <button
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              Log In
            </button>

            <button
              onClick={onOpenRegister}
              className="px-4 py-1.5 text-xs font-bold text-black bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-95 rounded-xl shadow-lg shadow-cyan-500/20 transition active:scale-95"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-6 max-w-6xl mx-auto text-center space-y-6">
        
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>FNB App of the Year Hackathon 2026 • Powered by Google Gemini</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          Build Smarter. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
            Grow Stronger.
          </span>
        </h1>

        {/* Supporting Copy */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
          Your business, your numbers, your next move. Manage your sales, expenses, and inventory while turning everyday township activity into smarter decisions with KhulaBiz.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <button
            onClick={onOpenRegister}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/35 transition active:scale-95"
          >
            <span>Start Growing Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#features"
            className="flex items-center gap-2 px-6 py-3 glass-panel text-slate-200 hover:text-white font-semibold text-xs sm:text-sm rounded-xl hover:border-cyan-500/40 transition"
          >
            <span>Explore Features</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </a>
        </div>

        {/* Live Metrics Trust Strip */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Zero Bank Login or ID Required</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400" />
            <span>South African Rand (ZAR) Native</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-violet-400" />
            <span>Real Gemini AI Intelligence</span>
          </div>
        </div>

        {/* FUTURISTIC LIQUID GLASS DASHBOARD PREVIEW */}
        <div className="mt-12 relative rounded-3xl p-2 sm:p-3 glass-panel-cyan cyan-glow-border shadow-2xl max-w-5xl mx-auto overflow-hidden">
          <div className="bg-[#070d1e] rounded-2xl p-4 sm:p-6 text-left border border-white/[0.08] space-y-5">
            
            {/* Window bar */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="text-slate-400 font-mono text-[11px] ml-2">Thabo's Corner Store • Orlando West, Soweto</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                Live Pulse Active
              </span>
            </div>

            {/* Dashboard Mock Header */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <div className="text-[10px] uppercase font-bold text-slate-400">Sales Today</div>
                <div className="text-lg font-extrabold text-white mt-0.5">R 300.40</div>
                <div className="text-[10px] text-emerald-400 font-medium">3 cash & card sales</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <div className="text-[10px] uppercase font-bold text-slate-400">Cash Float Reserve</div>
                <div className="text-lg font-extrabold text-cyan-400 mt-0.5">R 4,120.00</div>
                <div className="text-[10px] text-slate-400">Available till float</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <div className="text-[10px] uppercase font-bold text-slate-400">Est. Gross Margin</div>
                <div className="text-lg font-extrabold text-emerald-400 mt-0.5">23.8%</div>
                <div className="text-[10px] text-emerald-300">Healthy profit tier</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <div className="text-[10px] uppercase font-bold text-amber-400">Low Stock Alert</div>
                <div className="text-lg font-extrabold text-amber-300 mt-0.5">2 Items</div>
                <div className="text-[10px] text-amber-400 font-medium">Cooking Oil (~1.3d left)</div>
              </div>
            </div>

            {/* AI Business Pulse Preview Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-emerald-950/30 border border-cyan-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Business Pulse AI Insight</span>
                </div>
                <p className="text-xs text-slate-300">
                  "Sunfoil Sunflower Cooking Oil 2L is moving at ~2.2 bottles/day. Current 4 bottles will stock out by Saturday midday. Estimated restocking cost: R 432.00 from Metro Cash & Carry."
                </p>
              </div>

              <button
                onClick={onJudgeLogin}
                className="shrink-0 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition"
              >
                Test in Live Demo
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES BREAKDOWN SECTION */}
      <section id="features" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Comprehensive Management</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered for South African Micro-Commerce
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Everything your business needs to trade, manage cash flow, and build a bankable track record without complex bookkeeping software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl glass-panel glass-card-hover space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">2-Tap Till & Sales Ledger</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Record walk-in sales in seconds. Automatically decrements stock, supports cash, Yoco card tap, and instant EFT with WhatsApp receipts.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl glass-panel glass-card-hover space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Stock & Restock Velocity</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track Albany bread, maize meal, and cooking oil. Predictive velocity tells you how many days remain before staple goods run out.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl glass-panel glass-card-hover space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Expense & Overhead Tracker</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Log Eskom prepaid electricity vouchers, taxi haulage, shop rent, and LTE data to know your exact take-home operating cash float.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl glass-panel glass-card-hover space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Customer Credit Book</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Keep track of neighbour credit (such as SASSA accounts) separately from cash in till, with courteous WhatsApp reminder messages.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-2xl glass-panel glass-card-hover space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">KhulaBiz AI Advisor</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Powered by Google Gemini 3.8 Flash. Ask questions about your live numbers, discover margin improvements, and run what-if simulations.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-2xl glass-panel glass-card-hover space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Funding Readiness Workspace</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Printable monthly business statement formatted for landlords, suppliers, and FNB SME accounts, complete with operational disclaimers.
            </p>
          </div>

        </div>
      </section>

      {/* 3-STEP EXPLANATION SECTION */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-[#070d1e]/60 border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Simple 3-Step Flow</span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">How KhulaBiz Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl glass-panel space-y-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-extrabold text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="text-base font-bold text-white">Set Up Your Business</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter your shop name, town, and starting cash float. Pre-load staple South African items or start fresh in under two minutes.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel space-y-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="text-base font-bold text-white">Track Everyday Activity</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log quick counter sales, bakkie transport expenses, and restock deliveries. The system updates stock and cash balances in real time.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel space-y-3">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 font-extrabold text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="text-base font-bold text-white">Grow With Insights</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Business Pulse warns you of upcoming stockouts and cash pressure, while KhulaBiz AI suggests actionable moves to grow your margins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE FOR SOUTH AFRICAN ENTREPRENEURS */}
      <section id="south-africa" className="py-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
        <div className="p-8 rounded-3xl glass-panel-cyan space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">South African Township & Rural Context</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Why KhulaBiz Makes a Concrete Difference
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
            <div className="space-y-2">
              <strong className="text-white text-sm block">1. Prevents Fatal Weekend Stockouts</strong>
              <p>
                Spaza shops lose up to 35% of their weekly revenue when cooking oil, bread, or maize meal runs dry on Friday night. KhulaBiz calculates exact daily sales velocity so owners reorder before shelves empty.
              </p>
            </div>

            <div className="space-y-2">
              <strong className="text-white text-sm block">2. Protects Cash Flow from Book Debt</strong>
              <p>
                Informal neighbour credit is common across townships. KhulaBiz treats credit as unpaid debt instead of cash in hand, keeping your real cash float visible so you never bounce supplier deliveries.
              </p>
            </div>

            <div className="space-y-2">
              <strong className="text-white text-sm block">3. From Informal Trade to Bankable Records</strong>
              <p>
                Informal founders cannot access formal supplier accounts or FNB SME credit without documented trading history. KhulaBiz creates a verified operational trail ready for partner applications.
              </p>
            </div>

            <div className="space-y-2">
              <strong className="text-white text-sm block">4. Low-Data & Smartphone-Friendly</strong>
              <p>
                Designed for entry-level smartphones and variable township connectivity. Clean liquid glass surfaces maintain high text contrast without battery-draining visual bloat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 sm:px-6 border-t border-white/[0.08] text-xs text-slate-400 bg-[#020617]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="font-extrabold text-white text-sm">
              Khula<span className="text-cyan-400">Biz</span>
            </div>
            <p>Know your numbers. Spot your next move. Grow your business.</p>
            <p className="text-[11px] text-slate-400">FNB App of the Year Hackathon 2026 Entry • South Africa</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-300">
            <button onClick={onJudgeLogin} className="text-amber-400 hover:text-amber-300 font-semibold">Judge Demo Account</button>
            <button onClick={onOpenLogin} className="hover:text-white">Portal Sign In</button>
            <button onClick={onOpenRegister} className="hover:text-white">Create Account</button>
          </div>
        </div>
      </footer>

    </div>
  );
};
