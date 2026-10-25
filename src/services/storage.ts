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
} from '../types';
import { 
  DEMO_BUSINESS, 
  DEMO_PRODUCTS, 
  DEMO_SALES, 
  DEMO_EXPENSES, 
  DEMO_CUSTOMERS, 
  DEMO_ORDERS, 
  DEMO_STOCK_MOVEMENTS, 
  DEMO_GOALS, 
  DEMO_GROWTH_ACTIONS, 
  DEMO_AUDIT_LOGS,
  DEMO_BUSINESS_ID 
} from './mockData';
import { api } from './api';
import { firestoreSync } from './firestoreSync';

const STORAGE_KEYS = {
  ACTIVE_BUSINESS_ID: 'khulabiz_active_business_id',
  BUSINESSES: 'khulabiz_businesses',
  PRODUCTS_PREFIX: 'khulabiz_products_',
  SALES_PREFIX: 'khulabiz_sales_',
  EXPENSES_PREFIX: 'khulabiz_expenses_',
  CUSTOMERS_PREFIX: 'khulabiz_customers_',
  ORDERS_PREFIX: 'khulabiz_orders_',
  STOCK_MOVEMENTS_PREFIX: 'khulabiz_stock_movements_',
  GOALS_PREFIX: 'khulabiz_goals_',
  ACTIONS_PREFIX: 'khulabiz_actions_',
  AUDIT_PREFIX: 'khulabiz_audit_',
};

class StorageService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.ensureInitialized();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public ensureInitialized(): void {
    try {
      const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_BUSINESS_ID);
      const businesses = this.getBusinesses();

      if (!activeId || businesses.length === 0) {
        this.resetDemoData();
      }
    } catch {
      // In case of restricted storage environments
    }
  }

  public resetDemoData(): void {
    try {
      // Store demo business
      const businesses: Business[] = [DEMO_BUSINESS];
      localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(businesses));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_BUSINESS_ID, DEMO_BUSINESS_ID);

      // Store demo collections
      localStorage.setItem(STORAGE_KEYS.PRODUCTS_PREFIX + DEMO_BUSINESS_ID, JSON.stringify(DEMO_PRODUCTS));
      localStorage.setItem(STORAGE_KEYS.SALES_PREFIX + DEMO_BUSINESS_ID, JSON.stringify(DEMO_SALES));
      localStorage.setItem(STORAGE_KEYS.EXPENSES_PREFIX + DEMO_BUSINESS_ID, JSON.stringify(DEMO_EXPENSES));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS_PREFIX + DEMO_BUSINESS_ID, JSON.stringify(DEMO_CUSTOMERS));
      localStorage.setItem(STORAGE_KEYS.ORDERS_PREFIX + DEMO_BUSINESS_ID, JSON.stringify(DEMO_ORDERS));
      localStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS_PREFIX + DEMO_BUSINESS_ID, JSON.stringify(DEMO_STOCK_MOVEMENTS));
      localStorage.setItem(STORAGE_KEYS.GOALS_PREFIX + DEMO_BUSINESS_ID, JSON.stringify(DEMO_GOALS));
      localStorage.setItem(STORAGE_KEYS.ACTIONS_PREFIX + DEMO_BUSINESS_ID, JSON.stringify(DEMO_GROWTH_ACTIONS));
      localStorage.setItem(STORAGE_KEYS.AUDIT_PREFIX + DEMO_BUSINESS_ID, JSON.stringify(DEMO_AUDIT_LOGS));

      this.notify();
    } catch (e) {
      console.error('Error resetting demo data', e);
    }
  }

  // Active Business
  public getActiveBusinessId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_BUSINESS_ID) || DEMO_BUSINESS_ID;
  }

  public setActiveBusinessId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_BUSINESS_ID, id);
    this.notify();
  }

  public getBusinesses(): Business[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUSINESSES);
      return data ? JSON.parse(data) : [DEMO_BUSINESS];
    } catch {
      return [DEMO_BUSINESS];
    }
  }

  public getActiveBusiness(): Business {
    const id = this.getActiveBusinessId();
    const businesses = this.getBusinesses();
    const found = businesses.find((b) => b.id === id);
    return found || DEMO_BUSINESS;
  }

  public saveBusiness(business: Business): void {
    const businesses = this.getBusinesses();
    const idx = businesses.findIndex((b) => b.id === business.id);
    if (idx >= 0) {
      businesses[idx] = business;
    } else {
      businesses.push(business);
    }
    localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(businesses));
    this.addAuditLog(business.id, 'BUSINESS_UPDATED', 'business', business.id, `Updated details for ${business.name}`);
    this.notify();
  }

  public createNewBusiness(business: Business, loadSampleData: boolean = false): void {
    const businesses = this.getBusinesses();
    businesses.push(business);
    localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(businesses));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_BUSINESS_ID, business.id);

    if (loadSampleData) {
      // Re-map demo items with the new business ID
      const newProducts = DEMO_PRODUCTS.map(p => ({ ...p, id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, businessId: business.id }));
      const newCustomers = DEMO_CUSTOMERS.map(c => ({ ...c, id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, businessId: business.id }));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS_PREFIX + business.id, JSON.stringify(newProducts));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS_PREFIX + business.id, JSON.stringify(newCustomers));
      localStorage.setItem(STORAGE_KEYS.SALES_PREFIX + business.id, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.EXPENSES_PREFIX + business.id, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ORDERS_PREFIX + business.id, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS_PREFIX + business.id, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.GOALS_PREFIX + business.id, JSON.stringify(DEMO_GOALS.map(g => ({ ...g, id: `g_${Date.now()}`, businessId: business.id }))));
      localStorage.setItem(STORAGE_KEYS.ACTIONS_PREFIX + business.id, JSON.stringify(DEMO_GROWTH_ACTIONS.map(a => ({ ...a, id: `a_${Date.now()}`, businessId: business.id }))));
    } else {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS_PREFIX + business.id, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS_PREFIX + business.id, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.SALES_PREFIX + business.id, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.EXPENSES_PREFIX + business.id, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ORDERS_PREFIX + business.id, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS_PREFIX + business.id, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.GOALS_PREFIX + business.id, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ACTIONS_PREFIX + business.id, JSON.stringify([]));
    }

    this.addAuditLog(business.id, 'BUSINESS_CREATED', 'business', business.id, `Created workspace ${business.name} in ${business.townOrCity}, ${business.province}`);
    this.notify();
  }

  // Products & Stock
  public getProducts(businessId?: string): Product[] {
    const id = businessId || this.getActiveBusinessId();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS_PREFIX + id);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveProduct(product: Product): void {
    const products = this.getProducts(product.businessId);
    const idx = products.findIndex(p => p.id === product.id);
    const isNew = idx === -1;
    if (isNew) {
      products.unshift(product);
    } else {
      products[idx] = product;
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS_PREFIX + product.businessId, JSON.stringify(products));
    this.addAuditLog(
      product.businessId,
      isNew ? 'PRODUCT_CREATED' : 'PRODUCT_UPDATED',
      'product',
      product.id,
      `${isNew ? 'Added' : 'Updated'} ${product.name} (Qty: ${product.currentQuantity}, Selling: R${product.sellingPrice})`
    );
    this.notify();
  }

  public adjustStock(
    businessId: string, 
    productId: string, 
    quantityChange: number, 
    reason: string, 
    movementType: StockMovement['type'] = 'adjustment'
  ): void {
    const products = this.getProducts(businessId);
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const previousQty = product.currentQuantity;
    const newQty = previousQty + quantityChange;

    const business = this.getActiveBusiness();
    if (!business.allowNegativeStock && newQty < 0) {
      throw new Error(`Negative stock is prevented. Available: ${previousQty}, requested reduction: ${Math.abs(quantityChange)}.`);
    }

    product.currentQuantity = newQty;
    product.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.PRODUCTS_PREFIX + businessId, JSON.stringify(products));

    // Record Stock Movement
    const movements = this.getStockMovements(businessId);
    const newMovement: StockMovement = {
      id: `sm_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      businessId,
      productId,
      productName: product.name,
      type: movementType,
      quantityChange,
      previousQuantity: previousQty,
      newQuantity: newQty,
      reason,
      createdAt: new Date().toISOString(),
    };
    movements.unshift(newMovement);
    localStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS_PREFIX + businessId, JSON.stringify(movements));

    this.addAuditLog(
      businessId,
      'STOCK_ADJUSTED',
      'stock',
      productId,
      `${product.name}: ${previousQty} -> ${newQty} (${quantityChange > 0 ? '+' : ''}${quantityChange}) Reason: ${reason}`
    );
    this.notify();
  }

  public getStockMovements(businessId?: string): StockMovement[] {
    const id = businessId || this.getActiveBusinessId();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STOCK_MOVEMENTS_PREFIX + id);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Sales
  public getSales(businessId?: string): Sale[] {
    const id = businessId || this.getActiveBusinessId();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SALES_PREFIX + id);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public recordSale(sale: Sale): void {
    const sales = this.getSales(sale.businessId);
    sales.unshift(sale);
    localStorage.setItem(STORAGE_KEYS.SALES_PREFIX + sale.businessId, JSON.stringify(sales));

    // Deduct stock for all items
    sale.items.forEach(item => {
      try {
        this.adjustStock(
          sale.businessId, 
          item.productId, 
          -item.quantity, 
          `Sale #${sale.invoiceNumber}`,
          'sale'
        );
      } catch (err) {
        console.warn(`Could not adjust stock for ${item.productName}:`, err);
      }
    });

    // Update customer outstanding balance if unpaid or partial
    if (sale.customerId && sale.paymentStatus !== 'paid') {
      const remainingDebt = sale.total - (sale.paidAmount || 0);
      if (remainingDebt > 0) {
        this.adjustCustomerDebt(sale.businessId, sale.customerId, remainingDebt);
      }
    }

    this.addAuditLog(
      sale.businessId,
      'SALE_RECORDED',
      'sale',
      sale.id,
      `Sale #${sale.invoiceNumber} recorded for R ${sale.total.toFixed(2)} (${sale.paymentMethod.toUpperCase()}, Status: ${sale.paymentStatus})`
    );

    // Sync with backend API if user is logged in
    if (api.isAuthenticated()) {
      api.recordSale(sale).catch((err) => {
        console.debug('Background backend sync notice for sale:', err);
      });
    }

    // Real-time Firestore sync
    firestoreSync.saveSale(sale);

    this.notify();
  }

  public voidSale(businessId: string, saleId: string, reason: string): void {
    const sales = this.getSales(businessId);
    const sale = sales.find(s => s.id === saleId);
    if (!sale || sale.isVoided) return;

    sale.isVoided = true;
    sale.voidReason = reason;
    sale.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.SALES_PREFIX + businessId, JSON.stringify(sales));

    // Restore stock
    sale.items.forEach(item => {
      try {
        this.adjustStock(
          businessId,
          item.productId,
          item.quantity,
          `Restored from voided sale #${sale.invoiceNumber}: ${reason}`,
          'sale_void'
        );
      } catch (err) {
        console.warn('Could not restore stock on void:', err);
      }
    });

    // Restore customer debt if this sale was recorded as credit
    if (sale.customerId && sale.paymentStatus !== 'paid') {
      const remainingDebt = sale.total - (sale.paidAmount || 0);
      if (remainingDebt > 0) {
        this.adjustCustomerDebt(businessId, sale.customerId, -remainingDebt);
      }
    }

    this.addAuditLog(
      businessId,
      'SALE_VOIDED',
      'sale',
      saleId,
      `Voided Sale #${sale.invoiceNumber} for R ${sale.total.toFixed(2)}. Reason: ${reason}`
    );
    this.notify();
  }

  // Expenses
  public getExpenses(businessId?: string): Expense[] {
    const id = businessId || this.getActiveBusinessId();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES_PREFIX + id);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public recordExpense(expense: Expense): void {
    const expenses = this.getExpenses(expense.businessId);
    expenses.unshift(expense);
    localStorage.setItem(STORAGE_KEYS.EXPENSES_PREFIX + expense.businessId, JSON.stringify(expenses));

    this.addAuditLog(
      expense.businessId,
      'EXPENSE_RECORDED',
      'expense',
      expense.id,
      `Recorded ${expense.category} expense: "${expense.description}" of R ${expense.amount.toFixed(2)} (${expense.paymentMethod.toUpperCase()})`
    );

    // Sync with backend API if user is logged in
    if (api.isAuthenticated()) {
      api.recordExpense(expense).catch((err) => {
        console.debug('Background backend sync notice for expense:', err);
      });
    }

    // Real-time Firestore sync
    firestoreSync.saveExpense(expense);

    this.notify();
  }

  public voidExpense(businessId: string, expenseId: string, reason: string): void {
    const expenses = this.getExpenses(businessId);
    const exp = expenses.find(e => e.id === expenseId);
    if (!exp || exp.isVoided) return;

    exp.isVoided = true;
    exp.voidReason = reason;
    localStorage.setItem(STORAGE_KEYS.EXPENSES_PREFIX + businessId, JSON.stringify(expenses));

    this.addAuditLog(
      businessId,
      'EXPENSE_VOIDED',
      'expense',
      expenseId,
      `Voided expense "${exp.description}" for R ${exp.amount.toFixed(2)}. Reason: ${reason}`
    );
    this.notify();
  }

  // Customers
  public getCustomers(businessId?: string): Customer[] {
    const id = businessId || this.getActiveBusinessId();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS_PREFIX + id);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveCustomer(customer: Customer): void {
    const customers = this.getCustomers(customer.businessId);
    const idx = customers.findIndex(c => c.id === customer.id);
    if (idx >= 0) {
      customers[idx] = customer;
    } else {
      customers.unshift(customer);
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS_PREFIX + customer.businessId, JSON.stringify(customers));
    this.notify();
  }

  public adjustCustomerDebt(businessId: string, customerId: string, delta: number): void {
    const customers = this.getCustomers(businessId);
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return;
    cust.outstandingBalance = Math.max(0, (cust.outstandingBalance || 0) + delta);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS_PREFIX + businessId, JSON.stringify(customers));
    this.notify();
  }

  // Orders
  public getOrders(businessId?: string): Order[] {
    const id = businessId || this.getActiveBusinessId();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS_PREFIX + id);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveOrder(order: Order): void {
    const orders = this.getOrders(order.businessId);
    const idx = orders.findIndex(o => o.id === order.id);
    if (idx >= 0) {
      orders[idx] = order;
    } else {
      orders.unshift(order);
    }
    localStorage.setItem(STORAGE_KEYS.ORDERS_PREFIX + order.businessId, JSON.stringify(orders));
    this.addAuditLog(order.businessId, 'ORDER_SAVED', 'order', order.id, `Order #${order.orderNumber} updated. Status: ${order.status}`);
    this.notify();
  }

  // Goals & Growth Actions
  public getGoals(businessId?: string): BusinessGoal[] {
    const id = businessId || this.getActiveBusinessId();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GOALS_PREFIX + id);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveGoal(goal: BusinessGoal): void {
    const goals = this.getGoals(goal.businessId);
    const idx = goals.findIndex(g => g.id === goal.id);
    if (idx >= 0) {
      goals[idx] = goal;
    } else {
      goals.unshift(goal);
    }
    localStorage.setItem(STORAGE_KEYS.GOALS_PREFIX + goal.businessId, JSON.stringify(goals));
    this.notify();
  }

  public getGrowthActions(businessId?: string): GrowthAction[] {
    const id = businessId || this.getActiveBusinessId();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIONS_PREFIX + id);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public toggleGrowthAction(businessId: string, actionId: string): void {
    const actions = this.getGrowthActions(businessId);
    const action = actions.find(a => a.id === actionId);
    if (action) {
      action.isCompleted = !action.isCompleted;
      localStorage.setItem(STORAGE_KEYS.ACTIONS_PREFIX + businessId, JSON.stringify(actions));
      this.notify();
    }
  }

  public addGrowthAction(action: GrowthAction): void {
    const actions = this.getGrowthActions(action.businessId);
    actions.unshift(action);
    localStorage.setItem(STORAGE_KEYS.ACTIONS_PREFIX + action.businessId, JSON.stringify(actions));
    this.notify();
  }

  // Audit Logs
  public getAuditLogs(businessId?: string): AuditEvent[] {
    const id = businessId || this.getActiveBusinessId();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_PREFIX + id);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private addAuditLog(
    businessId: string, 
    action: string, 
    entityType: AuditEvent['entityType'], 
    entityId: string, 
    details: string
  ): void {
    const logs = this.getAuditLogs(businessId);
    const log: AuditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      businessId,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(log);
    // Keep max 200 logs per business
    const trimmed = logs.slice(0, 200);
    localStorage.setItem(STORAGE_KEYS.AUDIT_PREFIX + businessId, JSON.stringify(trimmed));
  }
}

export const storage = new StorageService();
