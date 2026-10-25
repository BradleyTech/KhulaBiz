import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Receipt, 
  Wallet, 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  Sparkles, 
  Calendar, 
  ArrowRight, 
  Plus, 
  Boxes,
  Users,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Business, Sale, Expense, Product, Customer } from '../types';
import { formatZAR, formatDateSA } from '../utils/formatters';
import { computeBusinessPulse, BusinessAnalytics } from '../services/businessPulse';

interface OverviewViewProps {
  business: Business;
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
  customers: Customer[];
  onOpenQuickAdd: (tab?: 'sale' | 'expense' | 'stock') => void;
  onNavigate: (view: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  business,
  sales,
  expenses,
  products,
  customers,
  onOpenQuickAdd,
  onNavigate,
}) => {
  const [period, setPeriod] = useState<'today' | '7days' | '30days'>('7days');
  const pulse: BusinessAnalytics = computeBusinessPulse(business, products, sales, expenses, customers);

  const activeSales = sales.filter(s => !s.isVoided);
  const activeExpenses = expenses.filter(e => !e.isVoided);

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Sawubona (Good morning)';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Top Pulse Recommendation
  const topInsight = pulse.insights[0];

  // 7-day trend chart calculation
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const daySales = activeSales.filter(s => s.date === dStr).reduce((sum, s) => sum + s.total, 0);
    const dayExp = activeExpenses.filter(e => e.date === dStr).reduce((sum, e) => sum + e.amount, 0);
    const label = d.toLocaleDateString('en-ZA', { weekday: 'short' });
    return { date: dStr, label, sales: daySales, expenses: dayExp };
  });

  const maxDailyValue = Math.max(100, ...last7DaysData.map(d => Math.max(d.sales, d.expenses)));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      
      {/* Top Welcome & Quick Actions Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-stone-900 rounded-3xl p-5 sm:p-7 text-white shadow-sm relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs text-emerald-300 font-semibold">{getGreeting()}</span>
              <span className="text-stone-400">•</span>
              <span className="text-xs text-stone-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                {new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {business.name}
            </h1>
            <p className="text-xs text-stone-300 mt-1 max-w-lg">
              {business.townOrCity}, {business.province} • {business.businessType}
            </p>
          </div>

          {/* Quick Buttons on Banner */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenQuickAdd('sale')}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs rounded-xl shadow-xs transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Record Sale</span>
            </button>
            <button
              onClick={() => onOpenQuickAdd('expense')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-800/80 hover:bg-stone-800 text-stone-200 border border-stone-700 font-semibold text-xs rounded-xl transition"
            >
              <Receipt className="w-3.5 h-3.5 text-stone-400" />
              <span>Add Expense</span>
            </button>
            <button
              onClick={() => onOpenQuickAdd('stock')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-800/80 hover:bg-stone-800 text-stone-200 border border-stone-700 font-semibold text-xs rounded-xl transition"
            >
              <Boxes className="w-3.5 h-3.5 text-amber-400" />
              <span>Update Stock</span>
            </button>
          </div>
        </div>

        {/* Data Sufficiency Pill on Banner */}
        <div className="mt-4 pt-3 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${pulse.dataSufficiency.level === 'excellent' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className="text-stone-300 font-medium">{pulse.dataSufficiency.message}</span>
          </div>
          <button
            onClick={() => onNavigate('pulse')}
            className="text-emerald-300 hover:text-emerald-200 font-semibold flex items-center gap-1 text-[11px]"
          >
            <span>Health Score: {pulse.healthScore.score}/100</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TOP 4 KEY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Sales Today */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs hover:border-emerald-200 transition">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sales Today</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            {formatZAR(pulse.salesToday)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
            <span>7-Day Total:</span>
            <strong className="text-stone-800">{formatZAR(pulse.salesLast7Days)}</strong>
          </div>
        </div>

        {/* Card 2: Expenses Today */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs hover:border-stone-300 transition">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Expenses Today</span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            {formatZAR(pulse.expensesToday)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
            <span>7-Day Outflows:</span>
            <strong className="text-stone-800">{formatZAR(pulse.expensesLast7Days)}</strong>
          </div>
        </div>

        {/* Card 3: Est. Gross Profit */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs hover:border-emerald-200 transition">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Est. Gross Profit</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-900 tracking-tight">
            {formatZAR(pulse.grossProfitTotal)}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            {pulse.grossMarginPercent.toFixed(1)}% Gross Margin
          </div>
        </div>

        {/* Card 4: Cash Balance Estimate */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs hover:border-emerald-200 transition">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cash Balance Float</span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-extrabold tracking-tight ${pulse.currentCashEstimate < 1000 ? 'text-amber-700' : 'text-stone-900'}`}>
            {formatZAR(pulse.currentCashEstimate)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 truncate">
            Float + Inflows - Cash Expenses
          </div>
        </div>

      </div>

      {/* SECONDARY ROW: Pulse Highlight & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Business Pulse Signature Recommendation Card (2 cols on lg) */}
        <div className="lg:col-span-2 bg-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-sm border border-emerald-900 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Activity className="w-4 h-4 animate-pulse" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Business Pulse Intelligence
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-300 border border-emerald-800">
                Confidence: {topInsight?.confidence || 'High'}
              </span>
            </div>

            {topInsight ? (
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {topInsight.title}
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {topInsight.detectedMessage}
                </p>

                <div className="bg-emerald-900/60 rounded-xl p-3 border border-emerald-800/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Why it matters:
                  </div>
                  <div className="text-xs text-stone-200">
                    {topInsight.whyItMatters}
                  </div>
                </div>

                <div className="text-xs text-emerald-200 font-semibold flex items-center gap-1.5 pt-1">
                  <span>Suggested Next Move:</span>
                  <span className="text-white underline decoration-emerald-500">{topInsight.suggestedAction}</span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-xs text-stone-400">
                All metrics are healthy. Log your upcoming transactions to maintain sharp predictions.
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-emerald-900 flex items-center justify-between">
            <span className="text-[11px] text-stone-400">
              Deterministic calculations based on your live records.
            </span>
            <button
              onClick={() => onNavigate(topInsight?.actionRoute || 'pulse')}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
            >
              <span>Open Action Centre</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Health & Risk Summary Column */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Operational Risks
              </h3>
              <button 
                onClick={() => onNavigate('pulse')}
                className="text-[11px] text-emerald-700 font-semibold hover:underline"
              >
                View Details
              </button>
            </div>

            <div className="space-y-2.5">
              
              {/* Low Stock Alert */}
              <div 
                onClick={() => onNavigate('products')}
                className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-amber-100/50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Boxes className="w-4 h-4 text-amber-700" />
                  <div>
                    <div className="text-xs font-bold text-amber-950">
                      {pulse.lowStockCount + pulse.outOfStockCount} Low / Out Items
                    </div>
                    <div className="text-[10px] text-amber-800">
                      {pulse.restockSuggestions[0]?.product.name || 'Check inventory counts'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-700" />
              </div>

              {/* Outstanding Receivables */}
              <div 
                onClick={() => onNavigate('customers')}
                className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-stone-100 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-stone-700" />
                  <div>
                    <div className="text-xs font-bold text-stone-900">
                      {formatZAR(pulse.totalReceivables)} Credit on Book
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Unpaid customer debt to collect
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </div>

              {/* Weekly Trend Indicator */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-stone-900">
                    Week-on-Week Sales
                  </div>
                  <div className="text-[10px] text-stone-500">
                    7d: {formatZAR(pulse.salesLast7Days)} vs prev: {formatZAR(pulse.salesPrev7Days)}
                  </div>
                </div>
                {pulse.salesPrev7Days > 0 ? (
                  <span className={`text-xs font-extrabold ${pulse.salesLast7Days >= pulse.salesPrev7Days ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {pulse.salesLast7Days >= pulse.salesPrev7Days ? '+' : ''}
                    {Math.round(((pulse.salesLast7Days - pulse.salesPrev7Days) / pulse.salesPrev7Days) * 100)}%
                  </span>
                ) : (
                  <span className="text-xs text-stone-500 font-medium">New</span>
                )}
              </div>

            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span>Stock Value (Cost):</span>
            <strong className="text-stone-900">{formatZAR(pulse.totalInventoryValuationAtCost)}</strong>
          </div>
        </div>

      </div>

      {/* 7-DAY REVENUE & EXPENSE CHART */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-stone-900">7-Day Revenue & Cash Activity</h3>
            <p className="text-xs text-stone-500">Daily recorded sales vs recorded expenses in South African Rand (ZAR)</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-stone-700">
              <span className="w-3 h-3 rounded bg-emerald-600"></span> Sales
            </span>
            <span className="flex items-center gap-1.5 font-medium text-stone-700">
              <span className="w-3 h-3 rounded bg-stone-300"></span> Expenses
            </span>
          </div>
        </div>

        {/* SVG Bar Chart */}
        <div className="h-48 w-full flex items-end justify-between gap-2 pt-4 px-2">
          {last7DaysData.map((d, idx) => {
            const salesHeight = (d.sales / maxDailyValue) * 100;
            const expHeight = (d.expenses / maxDailyValue) * 100;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                {/* Tooltip on hover */}
                <div className="text-[10px] text-stone-500 font-semibold mb-1 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  {formatZAR(d.sales)}
                </div>

                <div className="w-full flex items-end justify-center gap-1 h-36">
                  {/* Sales bar */}
                  <div
                    style={{ height: `${Math.max(4, salesHeight)}%` }}
                    className="w-1/2 max-w-[24px] bg-emerald-600 rounded-t-md hover:bg-emerald-700 transition"
                    title={`Sales on ${d.label}: ${formatZAR(d.sales)}`}
                  />
                  {/* Expense bar */}
                  <div
                    style={{ height: `${Math.max(4, expHeight)}%` }}
                    className="w-1/2 max-w-[24px] bg-stone-300 rounded-t-md hover:bg-stone-400 transition"
                    title={`Expenses on ${d.label}: ${formatZAR(d.expenses)}`}
                  />
                </div>

                {/* Day label */}
                <div className="text-[11px] font-bold text-stone-600 mt-2">
                  {d.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
