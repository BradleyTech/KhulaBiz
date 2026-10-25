import React, { useState } from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Circle, 
  ShieldAlert, 
  FileCheck, 
  Target, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  Award, 
  HelpCircle,
  Building2,
  Calendar,
  Check
} from 'lucide-react';
import { Business, BusinessGoal, GrowthAction, Sale, Expense, Product } from '../types';
import { formatZAR } from '../utils/formatters';
import { storage } from '../services/storage';

interface GrowthPlanViewProps {
  business: Business;
  goals: BusinessGoal[];
  growthActions: GrowthAction[];
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
  onSuccess: (msg: string) => void;
}

export const GrowthPlanView: React.FC<GrowthPlanViewProps> = ({
  business,
  goals,
  growthActions,
  sales,
  expenses,
  products,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'goals' | 'documents'>('checklist');
  const [newGoalTitle, setNewGoalTitle] = useState<string>('');
  const [newGoalCategory, setNewGoalCategory] = useState<BusinessGoal['category']>('sales');
  const [isAddingGoal, setIsAddingGoal] = useState<boolean>(false);

  // Funding Readiness Checklist items
  const [checklist, setChecklist] = useState([
    { id: 'c1', label: 'Registered Business with CIPC (Pty Ltd or Sole Prop)', ready: true, note: 'Provides legal trading standing' },
    { id: 'c2', label: 'Separated Business Bank Account (e.g. FNB Business)', ready: true, note: 'Prevents mixing household money with shop takings' },
    { id: 'c3', label: 'Over 60 Consecutive Days of Continuous Sales Records', ready: sales.length >= 10, note: `Recorded sales in KhulaBiz: ${sales.length} transactions` },
    { id: 'c4', label: 'Documented Cost of Goods Sold for All Staples', ready: products.every(p => p.unitCost > 0), note: 'Needed for reliable gross profit calculation' },
    { id: 'c5', label: 'Positive Monthly Cash Float Reserve (> R3,000)', ready: business.startingCashBalance > 3000, note: 'Demonstrates working capital resilience' },
    { id: 'c6', label: 'Documented Customer Credit Accounts & Book Debt', ready: true, note: 'Shows active neighbourhood customer relationship' },
    { id: 'c7', label: 'SARS Tax Compliance Status Pin (TCS)', ready: false, note: 'Required by formal funders and government grants' },
    { id: 'c8', label: 'Lease Agreement or Stand Permission from Landlord', ready: true, note: 'Proof of trading location premises' },
  ]);

  const completedChecklistCount = checklist.filter(c => c.ready).length;
  const readinessPct = Math.round((completedChecklistCount / checklist.length) * 100);

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(c => c.id === id ? { ...c, ready: !c.ready } : c));
  };

  const handleToggleAction = (actionId: string) => {
    storage.toggleGrowthAction(business.id, actionId);
    onSuccess('Action item updated!');
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const newGoal: BusinessGoal = {
      id: `goal_${Date.now()}`,
      businessId: business.id,
      title: newGoalTitle.trim(),
      category: newGoalCategory,
      targetDescription: 'Custom founder growth goal',
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    storage.saveGoal(newGoal);
    onSuccess(`Goal "${newGoal.title}" created.`);
    setNewGoalTitle('');
    setIsAddingGoal(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-800" />
            <span>Growth Plan & Funding Readiness</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Prepare your business records to qualify for formal wholesale credit, supplier accounts, and bank funding.
          </p>
        </div>

        <button
          onClick={() => setIsAddingGoal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Set Business Goal</span>
        </button>
      </div>

      {/* Funding Readiness Gauge Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-900 rounded-3xl p-6 text-white shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Award className="w-4 h-4" />
              <span>FNB & Supplier Funding-Readiness Index</span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1">
              Your Readiness Score: <span className="text-emerald-400">{readinessPct}%</span>
            </h2>
            <p className="text-xs text-stone-300 mt-0.5 max-w-lg">
              {completedChecklistCount} of {checklist.length} essential micro-business operational criteria are currently in order.
            </p>
          </div>

          <div className="w-32 bg-stone-800 rounded-full h-3 overflow-hidden border border-stone-700 shrink-0">
            <div 
              style={{ width: `${readinessPct}%` }}
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-3 bg-stone-800/80 rounded-2xl border border-stone-700/80 text-[11px] text-stone-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Honest Disclosure:</strong> KhulaBiz does not approve loans, guarantee funding, or represent FNB credit decisions. This checklist prepares your verifiable track record so you stand the strongest chance when applying.
          </span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 text-xs font-semibold pb-2">
        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-3.5 py-1.5 rounded-xl transition ${
            activeTab === 'checklist' ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Readiness Checklist ({checklist.length})
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`px-3.5 py-1.5 rounded-xl transition ${
            activeTab === 'goals' ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Founder Goals & Action Items ({growthActions.length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-3.5 py-1.5 rounded-xl transition ${
            activeTab === 'documents' ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Required Documents Guide
        </button>
      </div>

      {/* TAB 1: READINESS CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Interactive Compliance & Preparedness Rubric
            </h3>
            <span className="text-[11px] text-stone-400">Click items to update your progress</span>
          </div>

          <div className="space-y-2.5">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleChecklistItem(item.id)}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition ${
                  item.ready
                    ? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50'
                    : 'bg-stone-50 border-stone-200 hover:bg-stone-100/70'
                }`}
              >
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition ${
                  item.ready ? 'bg-emerald-600 text-white' : 'border border-stone-400 bg-white'
                }`}>
                  {item.ready && <Check className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-1">
                  <div className={`text-xs font-bold ${item.ready ? 'text-stone-900' : 'text-stone-700'}`}>
                    {item.label}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    {item.note}
                  </div>
                </div>

                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  item.ready ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                }`}>
                  {item.ready ? 'Ready' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: GOALS & ACTIONS */}
      {activeTab === 'goals' && (
        <div className="space-y-5">
          {/* Active Goals */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Active Business Goals
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {goals.map((goal) => (
                <div key={goal.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {goal.category}
                    </span>
                    <span className="text-stone-400 text-[10px]">Active</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-stone-900">
                    {goal.title}
                  </h4>
                  <p className="text-[11px] text-stone-600">
                    {goal.targetDescription}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items Checklist */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Immediate Growth Steps
            </h3>

            <div className="space-y-2.5">
              {growthActions.map((action) => (
                <div
                  key={action.id}
                  onClick={() => handleToggleAction(action.id)}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition ${
                    action.isCompleted
                      ? 'bg-stone-50/60 border-stone-200 opacity-60'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    action.isCompleted ? 'bg-emerald-600 text-white' : 'border border-stone-300'
                  }`}>
                    {action.isCompleted && <Check className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex-1">
                    <div className={`text-xs font-bold ${action.isCompleted ? 'line-through text-stone-500' : 'text-stone-900'}`}>
                      {action.title}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {action.description}
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    action.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-stone-100 text-stone-700'
                  }`}>
                    {action.priority} Priority
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REQUIRED DOCUMENTS GUIDE */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Document Dossier for Small Business Loan or Grant</h3>
            <p className="text-xs text-stone-500">What funders (FNB, SEFA, NYDA, township wholesale suppliers) typically request:</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: '1. CIPC Registration Certificate (COR14.3)', desc: 'Official proof that your business is registered with the Department of Trade, Industry & Competition.' },
              { title: '2. 3 to 6 Months Bank Statements', desc: 'Stamped bank statements showing steady trade deposits and supplier payments without reckless unauthorized overdrafts.' },
              { title: '3. South African ID Copy (Certified)', desc: 'Valid green barcoded ID book or smart ID card of the primary business founder/owner.' },
              { title: '4. KhulaBiz Monthly Business Statement', desc: 'Use our built-in "Print Monthly Summary" feature to show verified daily turnover, gross margin, and stock valuation.' },
              { title: '5. Lease Agreement / Municipal Trading Permit', desc: 'Proof that you have the right to operate from your spaza container, stand, or shop premises.' },
              { title: '6. SARS Tax Clearance Certificate', desc: 'Demonstrates good standing with SARS to participate in formal government or corporate supply chains.' },
            ].map((doc, idx) => (
              <div key={idx} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <h4 className="text-xs font-bold text-stone-900">{doc.title}</h4>
                <p className="text-[11px] text-stone-600 leading-relaxed">{doc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD GOAL MODAL */}
      {isAddingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <form onSubmit={handleCreateGoal} className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-stone-900">Define Founder Business Goal</h3>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Goal Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Maintain R5,000 cash float"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                required
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={newGoalCategory}
                onChange={(e) => setNewGoalCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
              >
                <option value="sales">Sales & Revenue Growth</option>
                <option value="margin">Margin & Pricing Improvement</option>
                <option value="stock">Stockout Reduction</option>
                <option value="records">Bookkeeping Consistency</option>
                <option value="funding">Funding & Bank Readiness</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingGoal(false)}
                className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition"
              >
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
