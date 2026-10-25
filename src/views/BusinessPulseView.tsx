import React, { useState } from 'react';
import { 
  Activity, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  Boxes, 
  Wallet, 
  ArrowRight, 
  Info, 
  CheckCircle2, 
  Clock, 
  Zap, 
  HelpCircle,
  Package,
  Layers,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { Business, Product, Sale, Expense, Customer } from '../types';
import { formatZAR, formatDateSA } from '../utils/formatters';
import { computeBusinessPulse, BusinessAnalytics, RestockSuggestion } from '../services/businessPulse';

interface BusinessPulseViewProps {
  business: Business;
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  customers: Customer[];
  onNavigate: (view: string) => void;
  onOpenQuickAdd: (tab?: 'sale' | 'expense' | 'stock') => void;
}

export const BusinessPulseView: React.FC<BusinessPulseViewProps> = ({
  business,
  products,
  sales,
  expenses,
  customers,
  onNavigate,
  onOpenQuickAdd,
}) => {
  const pulse: BusinessAnalytics = computeBusinessPulse(business, products, sales, expenses, customers);
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(pulse.insights[0]?.id || null);
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);

  const activeInsight = pulse.insights.find(i => i.id === selectedInsightId) || pulse.insights[0];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-950 rounded-3xl p-6 sm:p-7 text-white shadow-sm border border-emerald-900/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
                <Activity className="w-4 h-4 animate-pulse" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                The Business Pulse Engine
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-200 border border-emerald-700 font-semibold">
                Deterministic AI
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Intelligence & Proactive Next Moves
            </h1>
            <p className="text-xs text-stone-300 mt-1 max-w-xl leading-relaxed">
              KhulaBiz automatically cross-references your sales velocities, inventory levels, supplier costs, and cash outflows to tell you what needs your attention today.
            </p>
          </div>

          {/* Health Score Pill */}
          <div className="bg-stone-900/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0 shadow-lg">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                {pulse.healthScore.score}
              </div>
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                out of 100
              </div>
            </div>

            <div className="border-l border-stone-800 pl-4">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{pulse.healthScore.rating}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Composite Health Rating
              </p>
              <button
                onClick={() => setShowFormulaModal(true)}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-semibold mt-1 block"
              >
                Inspect Formula Rubric
              </button>
            </div>
          </div>
        </div>

        {/* Data Sufficiency Warning / Badge */}
        <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-300">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>{pulse.dataSufficiency.message}</span>
          </div>
          <span className="text-[11px] text-stone-400 hidden sm:inline">
            Zero hallucinations: pure mathematical audit
          </span>
        </div>
      </div>

      {/* HEALTH SCORE COMPONENT BREAKDOWN */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Health Index Formula Components</h3>
            <p className="text-xs text-stone-500">6 transparent diagnostic pillars scored against your live records</p>
          </div>
          <button
            onClick={() => setShowFormulaModal(true)}
            className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Calculation Rules</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Sales Consistency', comp: pulse.healthScore.components.salesConsistency },
            { label: 'Margin Health', comp: pulse.healthScore.components.marginHealth },
            { label: 'Stock Safety', comp: pulse.healthScore.components.stockRisk },
            { label: 'Expense Control', comp: pulse.healthScore.components.expenseControl },
            { label: 'Cash Runway', comp: pulse.healthScore.components.cashRunway },
            { label: 'Record Hygiene', comp: pulse.healthScore.components.recordCompleteness },
          ].map((item, idx) => {
            const pct = (item.comp.score / item.comp.max) * 100;
            return (
              <div key={idx} className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-stone-700 truncate">{item.label}</span>
                  <span className="font-extrabold text-stone-900">{item.comp.score}/{item.comp.max}</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full rounded-full ${pct >= 70 ? 'bg-emerald-600' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                  />
                </div>
                <div className="text-[10px] text-stone-500 truncate" title={item.comp.note}>
                  {item.comp.note}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-stone-600 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Disclaimer:</strong> This score is an internal diagnostic for operational planning and does not constitute an official credit rating, credit score, or lending commitment.
          </span>
        </div>
      </div>

      {/* INTELLIGENCE INSIGHTS: INTERACTIVE DETAILED EXPLORER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: List of Detected Pulse Findings */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
            Active System Detections ({pulse.insights.length})
          </div>

          <div className="space-y-2.5">
            {pulse.insights.map((insight) => {
              const isSelected = activeInsight.id === insight.id;
              const isCritical = insight.severity === 'critical';
              const isWarning = insight.severity === 'warning';
              const isPositive = insight.severity === 'positive';

              return (
                <div
                  key={insight.id}
                  onClick={() => setSelectedInsightId(insight.id)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      isCritical ? 'bg-red-100 text-red-800' : isWarning ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {insight.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">
                      Confidence: {insight.confidence}
                    </span>
                  </div>

                  <h4 className="text-xs font-extrabold text-stone-900 leading-snug">
                    {insight.title}
                  </h4>
                  <p className="text-[11px] text-stone-600 mt-1 line-clamp-2">
                    {insight.detectedMessage}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep-Dive Evidence & Action Panel (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs space-y-5">
          {activeInsight ? (
            <>
              <div className="border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    activeInsight.severity === 'critical' ? 'bg-red-500' : activeInsight.severity === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}></span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    System Diagnostic
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-stone-900 tracking-tight">
                  {activeInsight.title}
                </h3>
                <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                  {activeInsight.detectedMessage}
                </p>
              </div>

              {/* Evidence Box */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-stone-600" />
                  Evidence from Your Records
                </h4>
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                  {activeInsight.evidence.map((ev, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-stone-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why It Matters */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Why This Matters for Your Business
                </h4>
                <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl text-xs text-amber-950 leading-relaxed">
                  {activeInsight.whyItMatters}
                </div>
              </div>

              {/* Suggested Action Box & Route Button */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Recommended Action
                  </div>
                  <div className="text-xs font-bold text-stone-900 mt-0.5">
                    {activeInsight.suggestedAction}
                  </div>
                </div>

                <button
                  onClick={() => onNavigate(activeInsight.actionRoute)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 shrink-0"
                >
                  <span>Take Action Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-stone-400 text-xs">
              Select an insight on the left to inspect its evidence and action plan.
            </div>
          )}
        </div>

      </div>

      {/* RESTOCK URGENCY PLANNER (Section 13.D) */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-amber-700" />
              <span>Restock Urgency Priority Queue</span>
            </h3>
            <p className="text-xs text-stone-500">
              Ranked by sales velocity, current shelf stock, and predicted stockout dates.
            </p>
          </div>

          <button
            onClick={() => onOpenQuickAdd('stock')}
            className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition"
          >
            Record Restock Delivery
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3">Daily Velocity</th>
                <th className="p-3">Days Remaining</th>
                <th className="p-3">Suggested Reorder</th>
                <th className="p-3 text-right">Estimated Cost</th>
                <th className="p-3">Urgency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {pulse.restockSuggestions.map((r, i) => (
                <tr key={i} className="hover:bg-stone-50 transition">
                  <td className="p-3">
                    <div className="font-bold text-stone-900">{r.product.name}</div>
                    <div className="text-[10px] text-stone-400">{r.product.supplier || 'Wholesale supplier'}</div>
                  </td>
                  <td className="p-3 font-semibold text-stone-800">
                    {r.currentStock} units
                  </td>
                  <td className="p-3 text-stone-600">
                    ~{r.dailyVelocity} / day
                  </td>
                  <td className="p-3 font-bold">
                    {r.daysRemaining !== null ? (
                      <span className={r.daysRemaining <= 2 ? 'text-red-600' : r.daysRemaining <= 4 ? 'text-amber-700' : 'text-stone-700'}>
                        ~{r.daysRemaining} days
                      </span>
                    ) : (
                      <span className="text-stone-400">Low sales velocity</span>
                    )}
                  </td>
                  <td className="p-3 font-extrabold text-stone-900">
                    +{r.suggestedReorderQty} units
                  </td>
                  <td className="p-3 text-right font-extrabold text-stone-900">
                    {formatZAR(r.estimatedCost)}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      r.urgency === 'critical' ? 'bg-red-100 text-red-800' : r.urgency === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-800'
                    }`}>
                      {r.urgency}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORMULA RUBRIC MODAL */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-sm font-bold text-stone-900">KhulaBiz Health Score Rubric (100 Points)</h3>
              <button onClick={() => setShowFormulaModal(false)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              The Health Score is computed mathematically without artificial black-boxes. Here is the exact transparent allocation:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex justify-between">
                <div>
                  <strong>1. Sales Consistency (20 pts):</strong>
                  <div className="text-[11px] text-stone-500">Regular daily sales logged vs irregular gaps.</div>
                </div>
                <span className="font-bold text-stone-900 shrink-0">Max 20</span>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex justify-between">
                <div>
                  <strong>2. Margin & Cost Health (20 pts):</strong>
                  <div className="text-[11px] text-stone-500">Gross margin percentage across recorded wholesale costs.</div>
                </div>
                <span className="font-bold text-stone-900 shrink-0">Max 20</span>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex justify-between">
                <div>
                  <strong>3. Stockout Risk (20 pts):</strong>
                  <div className="text-[11px] text-stone-500">Number of staples near stockout vs healthy inventory.</div>
                </div>
                <span className="font-bold text-stone-900 shrink-0">Max 20</span>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex justify-between">
                <div>
                  <strong>4. Operating Expense Ratio (15 pts):</strong>
                  <div className="text-[11px] text-stone-500">Ratio of overhead expenses to recorded turnover.</div>
                </div>
                <span className="font-bold text-stone-900 shrink-0">Max 15</span>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex justify-between">
                <div>
                  <strong>5. Cash Runway Buffer (15 pts):</strong>
                  <div className="text-[11px] text-stone-500">Ability of float to cover upcoming 7-day expenses.</div>
                </div>
                <span className="font-bold text-stone-900 shrink-0">Max 15</span>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex justify-between">
                <div>
                  <strong>6. Record Completeness (10 pts):</strong>
                  <div className="text-[11px] text-stone-500">Data sufficiency and audit logging continuity.</div>
                </div>
                <span className="font-bold text-stone-900 shrink-0">Max 10</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-4 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800 transition"
              >
                Close Rubric
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
