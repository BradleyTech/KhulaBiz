import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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
} from '../src/types';
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
} from '../src/services/mockData';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  businessId: string;
  role: 'owner' | 'manager' | 'judge';
  createdAt: string;
}

export interface SessionRecord {
  token: string;
  userId: string;
  businessId: string;
  expiresAt: string;
  createdAt: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  sessions: SessionRecord[];
  businesses: Business[];
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  customers: Customer[];
  orders: Order[];
  stockMovements: StockMovement[];
  goals: BusinessGoal[];
  growthActions: GrowthAction[];
  auditLogs: AuditEvent[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export class JsonDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to load database from disk, re-initializing', e);
    }

    const initial = this.createInitialSeed();
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmp = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmp, DB_FILE);
    } catch (e) {
      console.error('Failed to persist database file', e);
    }
  }

  public persist(): void {
    this.saveData(this.data);
  }

  private createInitialSeed(): DatabaseSchema {
    // Seed Judge User
    const judgeSalt = crypto.randomBytes(16).toString('hex');
    const judgeHash = hashPassword('FNBJudge2026!', judgeSalt);

    const judgeUser: UserRecord = {
      id: 'usr_fnb_judge_01',
      name: 'FNB Hackathon Judge',
      email: 'judge@fnbhackathon2026.co.za',
      passwordHash: judgeHash,
      salt: judgeSalt,
      businessId: DEMO_BUSINESS_ID,
      role: 'judge',
      createdAt: '2026-10-24T06:00:00Z',
    };

    return {
      users: [judgeUser],
      sessions: [],
      businesses: [DEMO_BUSINESS],
      products: [...DEMO_PRODUCTS],
      sales: [...DEMO_SALES],
      expenses: [...DEMO_EXPENSES],
      customers: [...DEMO_CUSTOMERS],
      orders: [...DEMO_ORDERS],
      stockMovements: [...DEMO_STOCK_MOVEMENTS],
      goals: [...DEMO_GOALS],
      growthActions: [...DEMO_GROWTH_ACTIONS],
      auditLogs: [...DEMO_AUDIT_LOGS],
    };
  }

  public resetBenchmarkData(): void {
    // Restore benchmark data for DEMO_BUSINESS_ID without wiping other registered users
    this.data.businesses = this.data.businesses.filter(b => b.id !== DEMO_BUSINESS_ID);
    this.data.businesses.push(DEMO_BUSINESS);

    this.data.products = this.data.products.filter(p => p.businessId !== DEMO_BUSINESS_ID).concat(DEMO_PRODUCTS);
    this.data.sales = this.data.sales.filter(s => s.businessId !== DEMO_BUSINESS_ID).concat(DEMO_SALES);
    this.data.expenses = this.data.expenses.filter(e => e.businessId !== DEMO_BUSINESS_ID).concat(DEMO_EXPENSES);
    this.data.customers = this.data.customers.filter(c => c.businessId !== DEMO_BUSINESS_ID).concat(DEMO_CUSTOMERS);
    this.data.orders = this.data.orders.filter(o => o.businessId !== DEMO_BUSINESS_ID).concat(DEMO_ORDERS);
    this.data.stockMovements = this.data.stockMovements.filter(m => m.businessId !== DEMO_BUSINESS_ID).concat(DEMO_STOCK_MOVEMENTS);
    this.data.goals = this.data.goals.filter(g => g.businessId !== DEMO_BUSINESS_ID).concat(DEMO_GOALS);
    this.data.growthActions = this.data.growthActions.filter(a => a.businessId !== DEMO_BUSINESS_ID).concat(DEMO_GROWTH_ACTIONS);
    this.data.auditLogs = this.data.auditLogs.filter(l => l.businessId !== DEMO_BUSINESS_ID).concat(DEMO_AUDIT_LOGS);

    this.persist();
  }

  // User & Session queries
  public findUserByEmail(email: string): UserRecord | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): UserRecord | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(user: UserRecord): void {
    this.data.users.push(user);
    this.persist();
  }

  public createSession(userId: string, businessId: string): SessionRecord {
    const token = `kb_sess_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(); // 7 days
    const session: SessionRecord = {
      token,
      userId,
      businessId,
      expiresAt,
      createdAt: new Date().toISOString(),
    };
    this.data.sessions.push(session);
    this.persist();
    return session;
  }

  public findSession(token: string): SessionRecord | undefined {
    const session = this.data.sessions.find(s => s.token === token);
    if (!session) return undefined;
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      this.deleteSession(token);
      return undefined;
    }
    return session;
  }

  public deleteSession(token: string): void {
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    this.persist();
  }

  // Business queries
  public getBusiness(businessId: string): Business | undefined {
    return this.data.businesses.find(b => b.id === businessId);
  }

  public saveBusiness(business: Business): void {
    const idx = this.data.businesses.findIndex(b => b.id === business.id);
    if (idx >= 0) {
      this.data.businesses[idx] = business;
    } else {
      this.data.businesses.push(business);
    }
    this.persist();
  }

  // Product queries
  public getProducts(businessId: string): Product[] {
    return this.data.products.filter(p => p.businessId === businessId && !p.isArchived);
  }

  public getProduct(businessId: string, productId: string): Product | undefined {
    return this.data.products.find(p => p.businessId === businessId && p.id === productId);
  }

  public saveProduct(product: Product): void {
    const idx = this.data.products.findIndex(p => p.id === product.id && p.businessId === product.businessId);
    if (idx >= 0) {
      this.data.products[idx] = product;
    } else {
      this.data.products.unshift(product);
    }
    this.persist();
  }

  // Sales queries
  public getSales(businessId: string): Sale[] {
    return this.data.sales.filter(s => s.businessId === businessId);
  }

  public saveSale(sale: Sale): void {
    this.data.sales.unshift(sale);
    this.persist();
  }

  public voidSale(businessId: string, saleId: string, reason: string): Sale | undefined {
    const sale = this.data.sales.find(s => s.id === saleId && s.businessId === businessId);
    if (!sale || sale.isVoided) return undefined;
    sale.isVoided = true;
    sale.voidReason = reason;
    sale.updatedAt = new Date().toISOString();
    this.persist();
    return sale;
  }

  // Expenses queries
  public getExpenses(businessId: string): Expense[] {
    return this.data.expenses.filter(e => e.businessId === businessId);
  }

  public saveExpense(expense: Expense): void {
    this.data.expenses.unshift(expense);
    this.persist();
  }

  public voidExpense(businessId: string, expenseId: string, reason: string): Expense | undefined {
    const exp = this.data.expenses.find(e => e.id === expenseId && e.businessId === businessId);
    if (!exp || exp.isVoided) return undefined;
    exp.isVoided = true;
    exp.voidReason = reason;
    this.persist();
    return exp;
  }

  // Customers
  public getCustomers(businessId: string): Customer[] {
    return this.data.customers.filter(c => c.businessId === businessId);
  }

  public saveCustomer(customer: Customer): void {
    const idx = this.data.customers.findIndex(c => c.id === customer.id && c.businessId === customer.businessId);
    if (idx >= 0) {
      this.data.customers[idx] = customer;
    } else {
      this.data.customers.unshift(customer);
    }
    this.persist();
  }

  // Orders
  public getOrders(businessId: string): Order[] {
    return this.data.orders.filter(o => o.businessId === businessId);
  }

  public saveOrder(order: Order): void {
    const idx = this.data.orders.findIndex(o => o.id === order.id && o.businessId === order.businessId);
    if (idx >= 0) {
      this.data.orders[idx] = order;
    } else {
      this.data.orders.unshift(order);
    }
    this.persist();
  }

  // Stock Movements
  public getStockMovements(businessId: string): StockMovement[] {
    return this.data.stockMovements.filter(m => m.businessId === businessId);
  }

  public addStockMovement(movement: StockMovement): void {
    this.data.stockMovements.unshift(movement);
    this.persist();
  }

  // Goals & Actions
  public getGoals(businessId: string): BusinessGoal[] {
    return this.data.goals.filter(g => g.businessId === businessId);
  }

  public saveGoal(goal: BusinessGoal): void {
    const idx = this.data.goals.findIndex(g => g.id === goal.id && g.businessId === goal.businessId);
    if (idx >= 0) {
      this.data.goals[idx] = goal;
    } else {
      this.data.goals.unshift(goal);
    }
    this.persist();
  }

  public getGrowthActions(businessId: string): GrowthAction[] {
    return this.data.growthActions.filter(a => a.businessId === businessId);
  }

  public saveGrowthAction(action: GrowthAction): void {
    const idx = this.data.growthActions.findIndex(a => a.id === action.id && a.businessId === action.businessId);
    if (idx >= 0) {
      this.data.growthActions[idx] = action;
    } else {
      this.data.growthActions.unshift(action);
    }
    this.persist();
  }

  // Audit
  public getAuditLogs(businessId: string): AuditEvent[] {
    return this.data.auditLogs.filter(l => l.businessId === businessId);
  }

  public addAuditLog(businessId: string, action: string, entityType: AuditEvent['entityType'], entityId: string, details: string): void {
    const log: AuditEvent = {
      id: `audit_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      businessId,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.persist();
  }
}

export const db = new JsonDatabase();
