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

const TOKEN_KEY = 'khulabiz_auth_token';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY);
  }

  public setToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  public getToken(): string | null {
    return this.token || localStorage.getItem(TOKEN_KEY);
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      console.warn(`API request to ${endpoint} failed:`, err.message);
      throw err;
    }
  }

  // Auth
  public async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: any; business: Business }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  public async judgeLogin() {
    const data = await this.request<{ token: string; user: any; business: Business }>('/api/auth/judge-login', {
      method: 'POST',
    });
    this.setToken(data.token);
    return data;
  }

  public async register(payload: { name: string; email: string; password: string; businessName?: string; businessType?: string; townOrCity?: string; province?: string }) {
    const data = await this.request<{ token: string; user: any; business: Business }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(data.token);
    return data;
  }

  public async getMe() {
    return this.request<{ user: any; business: Business }>('/api/auth/me');
  }

  public async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  public async resetPassword(email: string) {
    return this.request<{ success: boolean; message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Business
  public async getBusiness(): Promise<Business> {
    return this.request<Business>('/api/business');
  }

  public async updateBusiness(data: Partial<Business>): Promise<Business> {
    return this.request<Business>('/api/business', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Products
  public async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/api/products');
  }

  public async createProduct(data: Partial<Product>): Promise<Product> {
    return this.request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async adjustStock(id: string, quantityChange: number, reason: string): Promise<any> {
    return this.request(`/api/products/${id}/adjust-stock`, {
      method: 'POST',
      body: JSON.stringify({ quantityChange, reason }),
    });
  }

  // Sales
  public async getSales(): Promise<Sale[]> {
    return this.request<Sale[]>('/api/sales');
  }

  public async recordSale(saleData: any): Promise<Sale> {
    return this.request<Sale>('/api/sales', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
  }

  public async voidSale(id: string, reason: string): Promise<Sale> {
    return this.request<Sale>(`/api/sales/${id}/void`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Expenses
  public async getExpenses(): Promise<Expense[]> {
    return this.request<Expense[]>('/api/expenses');
  }

  public async recordExpense(expenseData: any): Promise<Expense> {
    return this.request<Expense>('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  }

  public async voidExpense(id: string, reason: string): Promise<Expense> {
    return this.request<Expense>(`/api/expenses/${id}/void`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Customers
  public async getCustomers(): Promise<Customer[]> {
    return this.request<Customer[]>('/api/customers');
  }

  public async createCustomer(data: Partial<Customer>): Promise<Customer> {
    return this.request<Customer>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Orders
  public async getOrders(): Promise<Order[]> {
    return this.request<Order[]>('/api/orders');
  }

  public async createOrder(data: any): Promise<Order> {
    return this.request<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateOrderStatus(id: string, status: string): Promise<Order> {
    return this.request<Order>(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Stock movements
  public async getStockMovements(): Promise<StockMovement[]> {
    return this.request<StockMovement[]>('/api/stock-movements');
  }

  // Goals & Actions
  public async getGoals(): Promise<BusinessGoal[]> {
    return this.request<BusinessGoal[]>('/api/goals');
  }

  public async createGoal(data: Partial<BusinessGoal>): Promise<BusinessGoal> {
    return this.request<BusinessGoal>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getGrowthActions(): Promise<GrowthAction[]> {
    return this.request<GrowthAction[]>('/api/actions');
  }

  public async toggleGrowthAction(id: string): Promise<GrowthAction> {
    return this.request<GrowthAction>(`/api/actions/${id}/toggle`, {
      method: 'POST',
    });
  }

  // Audit
  public async getAuditLogs(): Promise<AuditEvent[]> {
    return this.request<AuditEvent[]>('/api/audit');
  }

  // Demo reset
  public async resetDemo(): Promise<any> {
    return this.request('/api/demo/reset', { method: 'POST' });
  }

  // Gemini AI Endpoints
  public async askAi(message: string, history?: any[]): Promise<{ text: string; source: 'gemini' | 'rule-based' }> {
    return this.request<{ text: string; source: 'gemini' | 'rule-based' }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  }

  public async getAiWeeklyPlan(): Promise<{ plan: string }> {
    return this.request<{ plan: string }>('/api/ai/weekly-plan', {
      method: 'POST',
    });
  }

  public async runWhatIf(params: { priceChangePct: number; expenseCutPct: number; volumeChangePct: number }): Promise<{ analysis: string }> {
    return this.request<{ analysis: string }>('/api/ai/what-if', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

export const api = new ApiService();
