export type BusinessType = 
  | 'Spaza & Convenience'
  | 'Food & Eatery'
  | 'Hair & Beauty Salon'
  | 'Independent Services'
  | 'Artisan & Trade'
  | 'Clothing & Retail'
  | 'Agriculture & Poultry'
  | 'Other Microbusiness';

export type SAProvince = 
  | 'Gauteng'
  | 'Western Cape'
  | 'KwaZulu-Natal'
  | 'Eastern Cape'
  | 'Limpopo'
  | 'Mpumalanga'
  | 'Free State'
  | 'North West'
  | 'Northern Cape';

export type PaymentStatus = 'paid' | 'partial' | 'unpaid';
export type PaymentMethod = 'cash' | 'eft' | 'card' | 'other';
export type OrderStatus = 'new' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Business {
  id: string;
  name: string;
  businessType: BusinessType;
  townOrCity: string;
  province: SAProvince;
  offerType: 'products' | 'services' | 'both';
  currency: 'ZAR';
  startingCashBalance: number;
  contactPhone: string;
  contactEmail: string;
  address: string;
  description: string;
  publicCatalogueSlug: string;
  allowNegativeStock: boolean;
  createdAt: string;
  isDemo: boolean;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  sku: string;
  category: string;
  sellingPrice: number;
  unitCost: number;
  currentQuantity: number;
  lowStockThreshold: number;
  supplier?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  total: number;
}

export interface Sale {
  id: string;
  businessId: string;
  invoiceNumber: string;
  date: string; // ISO string YYYY-MM-DD
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  isVoided: boolean;
  voidReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory = 
  | 'Stock purchases'
  | 'Transport'
  | 'Electricity & utilities'
  | 'Rent'
  | 'Data & connectivity'
  | 'Packaging'
  | 'Equipment'
  | 'Marketing'
  | 'Staff & labour'
  | 'Other';

export interface Expense {
  id: string;
  businessId: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  supplier?: string;
  notes?: string;
  receiptReference?: string;
  isVoided: boolean;
  voidReason?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  outstandingBalance: number; // unpaid amounts
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  businessId: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryNotes?: string;
  orderDate: string;
  createdAt: string;
}

export type StockMovementType = 
  | 'sale' 
  | 'sale_void' 
  | 'restock' 
  | 'adjustment' 
  | 'damage' 
  | 'return';

export interface StockMovement {
  id: string;
  businessId: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  createdAt: string;
}

export interface BusinessGoal {
  id: string;
  businessId: string;
  title: string;
  category: 'sales' | 'margin' | 'stock' | 'records' | 'funding';
  targetDescription: string;
  targetValue?: number;
  currentValue?: number;
  isCompleted: boolean;
  createdAt: string;
}

export interface GrowthAction {
  id: string;
  businessId: string;
  goalId?: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  isCompleted: boolean;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  businessId: string;
  action: string;
  entityType: 'sale' | 'expense' | 'product' | 'order' | 'customer' | 'stock' | 'business';
  entityId: string;
  details: string;
  timestamp: string;
}

export interface BusinessPulseInsight {
  id: string;
  type: 'low_stock' | 'sales_trend' | 'cash_warning' | 'restock_urgency' | 'margin_leak' | 'data_sufficiency';
  title: string;
  detectedMessage: string;
  evidence: string[];
  whyItMatters: string;
  suggestedAction: string;
  actionRoute: string; // view identifier
  confidence: 'high' | 'medium' | 'low';
  severity: 'info' | 'warning' | 'critical' | 'positive';
}

export interface BusinessHealthScore {
  score: number; // 0-100
  rating: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical Review';
  components: {
    salesConsistency: { score: number; max: number; note: string };
    marginHealth: { score: number; max: number; note: string };
    stockRisk: { score: number; max: number; note: string };
    expenseControl: { score: number; max: number; note: string };
    cashRunway: { score: number; max: number; note: string };
    recordCompleteness: { score: number; max: number; note: string };
  };
  summary: string;
}
