import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { api } from './services/api';
import { 
  Business, 
  Product, 
  Sale, 
  Expense, 
  Customer, 
  Order, 
  StockMovement, 
  BusinessGoal, 
  GrowthAction, 
  AuditEvent 
} from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { QuickAddModal } from './components/QuickAddModal';
import { OnboardingModal } from './components/OnboardingModal';
import { HackathonJudgeModal } from './components/HackathonJudgeModal';
import { PrintableSummaryModal } from './components/PrintableSummaryModal';
import { AuthModal } from './components/AuthModal';
import { PublicLandingView } from './views/PublicLandingView';
import { KhulaBizAiView } from './views/KhulaBizAiView';
import { OverviewView } from './views/OverviewView';
import { SalesView } from './views/SalesView';
import { ExpensesView } from './views/ExpensesView';
import { ProductsView } from './views/ProductsView';
import { CustomersView } from './views/CustomersView';
import { BusinessPulseView } from './views/BusinessPulseView';
import { GrowthPlanView } from './views/GrowthPlanView';
import { BusinessProfileView } from './views/BusinessProfileView';
import { SettingsView } from './views/SettingsView';
import { PublicCatalogueView } from './views/PublicCatalogueView';
import { CheckCircle2, X, Award, Sparkles, ShieldCheck, RotateCcw } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<string>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Auth state
  const [user, setUser] = useState<any | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Storage synced states
  const [business, setBusiness] = useState<Business>(() => storage.getActiveBusiness());
  const [businesses, setBusinesses] = useState<Business[]>(() => storage.getBusinesses());
  const [products, setProducts] = useState<Product[]>(() => storage.getProducts());
  const [sales, setSales] = useState<Sale[]>(() => storage.getSales());
  const [expenses, setExpenses] = useState<Expense[]>(() => storage.getExpenses());
  const [customers, setCustomers] = useState<Customer[]>(() => storage.getCustomers());
  const [orders, setOrders] = useState<Order[]>(() => storage.getOrders());
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => storage.getStockMovements());
  const [goals, setGoals] = useState<BusinessGoal[]>(() => storage.getGoals());
  const [growthActions, setGrowthActions] = useState<GrowthAction[]>(() => storage.getGrowthActions());
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(() => storage.getAuditLogs());

  // Modal triggers
  const [quickAddTab, setQuickAddTab] = useState<'sale' | 'expense' | 'stock'>('sale');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState<boolean>(false);
  const [isPrintSummaryOpen, setIsPrintSummaryOpen] = useState<boolean>(false);

  // Success Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Check existing session on load
  useEffect(() => {
    const checkAuth = async () => {
      if (api.isAuthenticated()) {
        try {
          const res = await api.getMe();
          if (res?.user) {
            setUser(res.user);
            if (res.business) {
              storage.setActiveBusinessId(res.business.id);
              setBusiness(res.business);
            }
          }
        } catch {
          api.setToken(null);
          setUser(null);
        }
      }
      setIsAuthChecking(false);
    };
    checkAuth();
  }, []);

  // Sync state on storage updates
  useEffect(() => {
    const refreshData = () => {
      setBusiness(storage.getActiveBusiness());
      setBusinesses(storage.getBusinesses());
      setProducts(storage.getProducts());
      setSales(storage.getSales());
      setExpenses(storage.getExpenses());
      setCustomers(storage.getCustomers());
      setOrders(storage.getOrders());
      setStockMovements(storage.getStockMovements());
      setGoals(storage.getGoals());
      setGrowthActions(storage.getGrowthActions());
      setAuditLogs(storage.getAuditLogs());
    };

    return storage.subscribe(refreshData);
  }, []);

  const handleSelectBusiness = (id: string) => {
    storage.setActiveBusinessId(id);
    setBusiness(storage.getActiveBusiness());
    showToast(`Switched active workspace to ${storage.getActiveBusiness().name}`);
  };

  const handleResetDemo = async () => {
    try {
      await api.resetDemo();
    } catch {
      // Ignore API reset error if offline
    }
    storage.resetDemoData();
    showToast("Thabo's Corner Store restored to clean hackathon benchmark dataset.");
  };

  const handleOpenQuickAdd = (tab: 'sale' | 'expense' | 'stock' = 'sale') => {
    setQuickAddTab(tab);
    setIsQuickAddOpen(true);
  };

  const handleJudgeLogin = async () => {
    try {
      const res = await api.judgeLogin();
      setUser(res.user);
      if (res.business) {
        storage.setActiveBusinessId(res.business.id);
        setBusiness(res.business);
      }
      showToast("Authenticated as FNB Hackathon Judge. Orlando West benchmark dataset loaded.");
      setActiveView('overview');
    } catch (err: any) {
      showToast(err.message || 'Judge authentication failed.');
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    showToast("Signed out. Public showcase mode active.");
  };

  // If in public catalogue preview mode (accessible both when logged in and public):
  if (activeView === 'catalogue') {
    return (
      <PublicCatalogueView
        business={business}
        products={products}
        onBackToApp={() => setActiveView(user ? 'overview' : 'landing')}
      />
    );
  }

  // If initial auth check is ongoing, render smooth loader
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-cyan-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Loading KhulaBiz...</span>
        </div>
      </div>
    );
  }

  // If user is unauthenticated, show public homepage
  if (!user) {
    return (
      <>
        <PublicLandingView
          onOpenLogin={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
          onOpenRegister={() => {
            setAuthModalMode('register');
            setIsAuthModalOpen(true);
          }}
          onJudgeLogin={handleJudgeLogin}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
          onAuthSuccess={(loggedUser, loggedBiz) => {
            setUser(loggedUser);
            if (loggedBiz) {
              storage.setActiveBusinessId(loggedBiz.id);
              setBusiness(loggedBiz);
            }
            setIsAuthModalOpen(false);
            showToast(`Welcome back, ${loggedUser.name}!`);
            setActiveView('overview');
          }}
        />

        {/* Global Toast for Public Experience */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0a1128] text-white px-4 py-3 rounded-2xl shadow-2xl border border-cyan-500/30 flex items-center gap-3 animate-in slide-in-from-bottom duration-200">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-200">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </>
    );
  }

  const activeSales = sales.filter(s => !s.isVoided);
  const totalSalesRevenue = activeSales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      
      {/* Hackathon Judge Sandbox Banner if active */}
      {user.role === 'judge' && (
        <div className="bg-gradient-to-r from-cyan-950 via-[#07132e] to-indigo-950 border-b border-cyan-500/30 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-extrabold text-cyan-300">FNB Hackathon 2026 Sandbox:</span>
            <span className="text-slate-300 hidden sm:inline">Logged in as Evaluator ({user.email}) • Active Store: <strong>{business.name}</strong> ({business.townOrCity})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('ai')}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 font-semibold border border-cyan-500/30 flex items-center gap-1.5 transition text-[11px]"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Launch Gemini AI</span>
            </button>
            <button
              onClick={handleResetDemo}
              className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-medium border border-white/10 flex items-center gap-1 transition text-[11px]"
              title="Reset sample data back to standard benchmark"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        business={business}
        businesses={businesses}
        user={user}
        onSelectBusiness={handleSelectBusiness}
        onOpenQuickAdd={handleOpenQuickAdd}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenJudgeModal={() => setIsJudgeModalOpen(true)}
        onResetDemo={handleResetDemo}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onLogout={handleLogout}
        activeView={activeView}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop Sidebar */}
        <Sidebar
          activeView={activeView}
          onSelectView={setActiveView}
          business={business}
          user={user}
          onOpenPrintSummary={() => setIsPrintSummaryOpen(true)}
          onOpenPublicCatalogue={() => setActiveView('catalogue')}
          onLogout={handleLogout}
        />

        {/* Primary Main Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-24 lg:pb-8">
          <div className="max-w-6xl mx-auto">
            {activeView === 'overview' && (
              <OverviewView
                business={business}
                sales={sales}
                expenses={expenses}
                products={products}
                customers={customers}
                onOpenQuickAdd={handleOpenQuickAdd}
                onNavigate={setActiveView}
              />
            )}

            {activeView === 'ai' && (
              <KhulaBizAiView
                business={business}
                products={products}
                sales={sales}
                expenses={expenses}
                customers={customers}
              />
            )}

            {activeView === 'sales' && (
              <SalesView
                business={business}
                sales={sales}
                products={products}
                customers={customers}
                onOpenQuickAdd={handleOpenQuickAdd}
                onSuccess={showToast}
              />
            )}

            {activeView === 'expenses' && (
              <ExpensesView
                business={business}
                expenses={expenses}
                totalSales={totalSalesRevenue}
                onOpenQuickAdd={handleOpenQuickAdd}
                onSuccess={showToast}
              />
            )}

            {activeView === 'products' && (
              <ProductsView
                business={business}
                products={products}
                stockMovements={stockMovements}
                onOpenQuickAdd={handleOpenQuickAdd}
                onSuccess={showToast}
              />
            )}

            {activeView === 'customers' && (
              <CustomersView
                business={business}
                customers={customers}
                orders={orders}
                products={products}
                onOpenPublicCatalogue={() => setActiveView('catalogue')}
                onSuccess={showToast}
              />
            )}

            {activeView === 'pulse' && (
              <BusinessPulseView
                business={business}
                products={products}
                sales={sales}
                expenses={expenses}
                customers={customers}
                onNavigate={setActiveView}
                onOpenQuickAdd={handleOpenQuickAdd}
              />
            )}

            {activeView === 'growth' && (
              <GrowthPlanView
                business={business}
                goals={goals}
                growthActions={growthActions}
                sales={sales}
                expenses={expenses}
                products={products}
                onSuccess={showToast}
              />
            )}

            {activeView === 'profile' && (
              <BusinessProfileView
                business={business}
                onOpenPrintSummary={() => setIsPrintSummaryOpen(true)}
                onOpenPublicCatalogue={() => setActiveView('catalogue')}
                onSuccess={showToast}
              />
            )}

            {activeView === 'settings' && (
              <SettingsView
                business={business}
                auditLogs={auditLogs}
                onResetDemo={handleResetDemo}
                onSuccess={showToast}
              />
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation & Slide-in Drawer */}
      <BottomNav
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenQuickAdd={handleOpenQuickAdd}
        onOpenPrintSummary={() => setIsPrintSummaryOpen(true)}
        onOpenJudgeModal={() => setIsJudgeModalOpen(true)}
        onOpenPublicCatalogue={() => setActiveView('catalogue')}
        onLogout={handleLogout}
        business={business}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      {/* Global Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialTab={quickAddTab}
        products={products}
        customers={customers}
        businessId={business.id}
        onSuccess={showToast}
      />

      {/* Onboarding Wizard Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onBusinessCreated={(newBiz) => {
          setBusiness(newBiz);
          showToast(`Welcome! Workspace "${newBiz.name}" created.`);
          setActiveView('overview');
        }}
      />

      {/* Hackathon Judge Center & Pitch Deck Modal */}
      <HackathonJudgeModal
        isOpen={isJudgeModalOpen}
        onClose={() => setIsJudgeModalOpen(false)}
        onSelectView={setActiveView}
      />

      {/* Printable Monthly Statement Modal */}
      <PrintableSummaryModal
        isOpen={isPrintSummaryOpen}
        onClose={() => setIsPrintSummaryOpen(false)}
        business={business}
        sales={sales}
        expenses={expenses}
        products={products}
        customers={customers}
      />

      {/* Success Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 bg-[#0a1128] text-white px-4 py-3 rounded-2xl shadow-2xl border border-cyan-500/40 flex items-center gap-3 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-200">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
