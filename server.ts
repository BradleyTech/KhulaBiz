import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { db, hashPassword, UserRecord } from './server/db';
import { askKhulaBizAi, generateWeeklyActionPlan, simulateWhatIf } from './server/gemini';
import { Business, Product, Sale, Expense, Customer, Order, StockMovement, BusinessGoal, GrowthAction } from './src/types';
import { generateInvoiceNumber } from './src/utils/formatters';

dotenv.config();

const app = express();
app.use(express.json());

// Extend express Request to include authenticated user info
declare global {
  namespace Express {
    interface Request {
      user?: UserRecord;
      businessId?: string;
    }
  }
}

// Authentication Middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing authentication token' });
  }

  const token = authHeader.split(' ')[1];
  const session = db.findSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: invalid or expired session' });
  }

  const user = db.findUserById(session.userId);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: user not found' });
  }

  req.user = user;
  req.businessId = session.businessId || user.businessId;
  next();
}

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, businessName, businessType, townOrCity, province } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (db.findUserByEmail(email)) {
    return res.status(400).json({ error: 'An account with this email address already exists' });
  }

  const userId = `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const businessId = `biz_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);

  const newBusiness: Business = {
    id: businessId,
    name: businessName?.trim() || `${name}'s Business`,
    businessType: businessType || 'Spaza & Convenience',
    townOrCity: townOrCity?.trim() || 'Johannesburg',
    province: province || 'Gauteng',
    offerType: 'both',
    currency: 'ZAR',
    startingCashBalance: 2500,
    contactPhone: '',
    contactEmail: email,
    address: `${townOrCity || 'Township'}, ${province || 'Gauteng'}`,
    description: 'South African microbusiness workspace.',
    publicCatalogueSlug: (businessName || 'my-shop').toLowerCase().replace(/[^a-z0-9]/g, '-'),
    allowNegativeStock: false,
    createdAt: new Date().toISOString(),
    isDemo: false,
  };

  const newUser: UserRecord = {
    id: userId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    salt,
    businessId,
    role: 'owner',
    createdAt: new Date().toISOString(),
  };

  db.saveBusiness(newBusiness);
  db.createUser(newUser);

  const session = db.createSession(userId, businessId);

  res.status(201).json({
    token: session.token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    business: newBusiness,
  });
});

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const computedHash = hashPassword(password, user.salt);
  if (computedHash !== user.passwordHash) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const business = db.getBusiness(user.businessId);
  const session = db.createSession(user.id, user.businessId);

  res.json({
    token: session.token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    business,
  });
});

// 1-Click Judge Demo Login
app.post('/api/auth/judge-login', (req: Request, res: Response) => {
  const judgeEmail = 'judge@fnbhackathon2026.co.za';
  let judgeUser = db.findUserByEmail(judgeEmail);

  if (!judgeUser) {
    db.resetBenchmarkData();
    judgeUser = db.findUserByEmail(judgeEmail)!;
  }

  const business = db.getBusiness(judgeUser.businessId);
  const session = db.createSession(judgeUser.id, judgeUser.businessId);

  res.json({
    token: session.token,
    user: { id: judgeUser.id, name: judgeUser.name, email: judgeUser.email, role: judgeUser.role },
    business,
  });
});

// Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    db.deleteSession(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// Get Current User (Session verification)
app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  const business = db.getBusiness(req.businessId!);
  res.json({
    user: { id: req.user!.id, name: req.user!.name, email: req.user!.email, role: req.user!.role },
    business,
  });
});

// Password Reset Request
app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }
  const user = db.findUserByEmail(email);
  // Security standard: don't disclose whether user exists, but simulate dispatch
  res.json({
    success: true,
    message: `If an account with ${email} exists, password reset verification instructions have been dispatched.`,
  });
});

// ==========================================
// BUSINESS MANAGEMENT ROUTES
// ==========================================

app.get('/api/business', requireAuth, (req: Request, res: Response) => {
  const business = db.getBusiness(req.businessId!);
  if (!business) return res.status(404).json({ error: 'Business not found' });
  res.json(business);
});

app.put('/api/business', requireAuth, (req: Request, res: Response) => {
  const existing = db.getBusiness(req.businessId!);
  if (!existing) return res.status(404).json({ error: 'Business not found' });

  const updated: Business = {
    ...existing,
    ...req.body,
    id: existing.id, // prevent ID change
  };

  db.saveBusiness(updated);
  db.addAuditLog(existing.id, 'BUSINESS_UPDATED', 'business', existing.id, `Updated details for ${updated.name}`);
  res.json(updated);
});

// ==========================================
// PRODUCTS & INVENTORY ROUTES
// ==========================================

app.get('/api/products', requireAuth, (req: Request, res: Response) => {
  const products = db.getProducts(req.businessId!);
  res.json(products);
});

app.post('/api/products', requireAuth, (req: Request, res: Response) => {
  const { name, sku, category, sellingPrice, unitCost, currentQuantity, lowStockThreshold, supplier, description } = req.body;

  if (!name || sellingPrice === undefined || unitCost === undefined) {
    return res.status(400).json({ error: 'Name, selling price, and unit cost are required' });
  }

  const newProduct: Product = {
    id: `prod_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
    businessId: req.businessId!,
    name: name.trim(),
    sku: sku?.trim() || `SKU-${Date.now().toString().slice(-4)}`,
    category: category || 'Pantry & Groceries',
    sellingPrice: Number(sellingPrice),
    unitCost: Number(unitCost),
    currentQuantity: Number(currentQuantity || 0),
    lowStockThreshold: Number(lowStockThreshold || 5),
    supplier: supplier?.trim() || undefined,
    description: description?.trim() || undefined,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.saveProduct(newProduct);
  db.addAuditLog(req.businessId!, 'PRODUCT_CREATED', 'product', newProduct.id, `Added ${newProduct.name}`);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', requireAuth, (req: Request, res: Response) => {
  const prod = db.getProduct(req.businessId!, req.params.id);
  if (!prod) return res.status(404).json({ error: 'Product not found' });

  const updated: Product = {
    ...prod,
    ...req.body,
    id: prod.id,
    businessId: prod.businessId,
    updatedAt: new Date().toISOString(),
  };

  db.saveProduct(updated);
  db.addAuditLog(req.businessId!, 'PRODUCT_UPDATED', 'product', prod.id, `Updated ${prod.name}`);
  res.json(updated);
});

app.post('/api/products/:id/adjust-stock', requireAuth, (req: Request, res: Response) => {
  const { quantityChange, reason, type } = req.body;
  const prod = db.getProduct(req.businessId!, req.params.id);
  if (!prod) return res.status(404).json({ error: 'Product not found' });

  const delta = parseInt(quantityChange, 10);
  if (isNaN(delta) || delta === 0) {
    return res.status(400).json({ error: 'Invalid quantity change' });
  }

  const business = db.getBusiness(req.businessId!);
  const previousQty = prod.currentQuantity;
  const newQty = previousQty + delta;

  if (business && !business.allowNegativeStock && newQty < 0) {
    return res.status(400).json({ error: `Negative stock prevented. Available: ${previousQty}, requested change: ${delta}.` });
  }

  prod.currentQuantity = newQty;
  prod.updatedAt = new Date().toISOString();
  db.saveProduct(prod);

  const movement: StockMovement = {
    id: `sm_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
    businessId: req.businessId!,
    productId: prod.id,
    productName: prod.name,
    type: type || (delta > 0 ? 'restock' : 'adjustment'),
    quantityChange: delta,
    previousQuantity: previousQty,
    newQuantity: newQty,
    reason: reason || 'Manual stock update',
    createdAt: new Date().toISOString(),
  };
  db.addStockMovement(movement);
  db.addAuditLog(req.businessId!, 'STOCK_ADJUSTED', 'stock', prod.id, `${prod.name}: ${previousQty} -> ${newQty} (${delta > 0 ? '+' : ''}${delta})`);

  res.json({ product: prod, movement });
});

// ==========================================
// SALES ROUTES
// ==========================================

app.get('/api/sales', requireAuth, (req: Request, res: Response) => {
  const sales = db.getSales(req.businessId!);
  res.json(sales);
});

app.post('/api/sales', requireAuth, (req: Request, res: Response) => {
  const { items, customerId, customerName, customerPhone, subtotal, discount, total, paidAmount, paymentStatus, paymentMethod, notes, date } = req.body;

  if (!items || !items.length || total <= 0) {
    return res.status(400).json({ error: 'Sale must contain items and a valid total amount' });
  }

  const salesCount = db.getSales(req.businessId!).length;
  const invoiceNumber = generateInvoiceNumber(salesCount + 1);

  const newSale: Sale = {
    id: `sale_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
    businessId: req.businessId!,
    invoiceNumber,
    date: date || new Date().toISOString().split('T')[0],
    customerId,
    customerName: customerName || 'Walk-in Customer',
    customerPhone,
    items,
    subtotal: Number(subtotal || total),
    discount: Number(discount || 0),
    total: Number(total),
    paidAmount: Number(paidAmount !== undefined ? paidAmount : total),
    paymentStatus: paymentStatus || 'paid',
    paymentMethod: paymentMethod || 'cash',
    notes,
    isVoided: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.saveSale(newSale);

  // Deduct stock for all tracked items
  items.forEach((item: any) => {
    const prod = db.getProduct(req.businessId!, item.productId);
    if (prod) {
      const prev = prod.currentQuantity;
      prod.currentQuantity -= item.quantity;
      prod.updatedAt = new Date().toISOString();
      db.saveProduct(prod);

      const sm: StockMovement = {
        id: `sm_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
        businessId: req.businessId!,
        productId: prod.id,
        productName: prod.name,
        type: 'sale',
        quantityChange: -item.quantity,
        previousQuantity: prev,
        newQuantity: prod.currentQuantity,
        reason: `Customer sale #${invoiceNumber}`,
        createdAt: new Date().toISOString(),
      };
      db.addStockMovement(sm);
    }
  });

  // Track customer credit if unpaid/partial
  if (customerId && paymentStatus !== 'paid') {
    const cust = db.getCustomers(req.businessId!).find(c => c.id === customerId);
    if (cust) {
      const debt = newSale.total - (newSale.paidAmount || 0);
      cust.outstandingBalance = Math.max(0, (cust.outstandingBalance || 0) + debt);
      db.saveCustomer(cust);
    }
  }

  db.addAuditLog(req.businessId!, 'SALE_RECORDED', 'sale', newSale.id, `Sale #${invoiceNumber} for R ${newSale.total.toFixed(2)}`);
  res.status(201).json(newSale);
});

app.post('/api/sales/:id/void', requireAuth, (req: Request, res: Response) => {
  const { reason } = req.body;
  if (!reason?.trim()) {
    return res.status(400).json({ error: 'A valid reason is required to void a sale' });
  }

  const voided = db.voidSale(req.businessId!, req.params.id, reason.trim());
  if (!voided) {
    return res.status(404).json({ error: 'Sale not found or already voided' });
  }

  // Restore inventory
  voided.items.forEach(item => {
    const prod = db.getProduct(req.businessId!, item.productId);
    if (prod) {
      const prev = prod.currentQuantity;
      prod.currentQuantity += item.quantity;
      prod.updatedAt = new Date().toISOString();
      db.saveProduct(prod);

      const sm: StockMovement = {
        id: `sm_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
        businessId: req.businessId!,
        productId: prod.id,
        productName: prod.name,
        type: 'sale_void',
        quantityChange: item.quantity,
        previousQuantity: prev,
        newQuantity: prod.currentQuantity,
        reason: `Restored from voided sale #${voided.invoiceNumber}: ${reason}`,
        createdAt: new Date().toISOString(),
      };
      db.addStockMovement(sm);
    }
  });

  // Reverse customer credit if needed
  if (voided.customerId && voided.paymentStatus !== 'paid') {
    const cust = db.getCustomers(req.businessId!).find(c => c.id === voided.customerId);
    if (cust) {
      const debt = voided.total - (voided.paidAmount || 0);
      cust.outstandingBalance = Math.max(0, (cust.outstandingBalance || 0) - debt);
      db.saveCustomer(cust);
    }
  }

  db.addAuditLog(req.businessId!, 'SALE_VOIDED', 'sale', voided.id, `Voided Sale #${voided.invoiceNumber}. Reason: ${reason}`);
  res.json(voided);
});

// ==========================================
// EXPENSES ROUTES
// ==========================================

app.get('/api/expenses', requireAuth, (req: Request, res: Response) => {
  const expenses = db.getExpenses(req.businessId!);
  res.json(expenses);
});

app.post('/api/expenses', requireAuth, (req: Request, res: Response) => {
  const { description, amount, category, date, paymentMethod, supplier, notes } = req.body;

  if (!description || !amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Description and a positive amount are required' });
  }

  const newExp: Expense = {
    id: `exp_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
    businessId: req.businessId!,
    description: description.trim(),
    amount: Number(amount),
    category: category || 'Stock purchases',
    date: date || new Date().toISOString().split('T')[0],
    paymentMethod: paymentMethod || 'cash',
    supplier: supplier?.trim() || undefined,
    notes: notes?.trim() || undefined,
    isVoided: false,
    createdAt: new Date().toISOString(),
  };

  db.saveExpense(newExp);
  db.addAuditLog(req.businessId!, 'EXPENSE_RECORDED', 'expense', newExp.id, `Expense of R ${newExp.amount.toFixed(2)} (${newExp.category})`);
  res.status(201).json(newExp);
});

app.post('/api/expenses/:id/void', requireAuth, (req: Request, res: Response) => {
  const { reason } = req.body;
  if (!reason?.trim()) {
    return res.status(400).json({ error: 'A valid reason is required to void an expense' });
  }

  const voided = db.voidExpense(req.businessId!, req.params.id, reason.trim());
  if (!voided) {
    return res.status(404).json({ error: 'Expense not found or already voided' });
  }

  db.addAuditLog(req.businessId!, 'EXPENSE_VOIDED', 'expense', voided.id, `Voided expense "${voided.description}". Reason: ${reason}`);
  res.json(voided);
});

// ==========================================
// CUSTOMERS & ORDERS ROUTES
// ==========================================

app.get('/api/customers', requireAuth, (req: Request, res: Response) => {
  const customers = db.getCustomers(req.businessId!);
  res.json(customers);
});

app.post('/api/customers', requireAuth, (req: Request, res: Response) => {
  const { name, phone, email, notes } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Customer name is required' });

  const newCust: Customer = {
    id: `cust_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
    businessId: req.businessId!,
    name: name.trim(),
    phone: phone?.trim() || undefined,
    email: email?.trim() || undefined,
    notes: notes?.trim() || undefined,
    outstandingBalance: 0,
    createdAt: new Date().toISOString(),
  };

  db.saveCustomer(newCust);
  res.status(201).json(newCust);
});

app.get('/api/orders', requireAuth, (req: Request, res: Response) => {
  const orders = db.getOrders(req.businessId!);
  res.json(orders);
});

app.post('/api/orders', requireAuth, (req: Request, res: Response) => {
  const { customerName, customerPhone, items, total, status, paymentStatus, deliveryNotes, orderDate } = req.body;
  if (!customerName || !items || !items.length) {
    return res.status(400).json({ error: 'Customer name and items are required' });
  }

  const count = db.getOrders(req.businessId!).length;
  const orderNumber = `ORD-${Date.now().toString().slice(-4)}-${String(count + 1).padStart(3, '0')}`;

  const newOrder: Order = {
    id: `ord_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
    businessId: req.businessId!,
    orderNumber,
    customerName: customerName.trim(),
    customerPhone: customerPhone?.trim() || '',
    items,
    total: Number(total),
    status: status || 'confirmed',
    paymentStatus: paymentStatus || 'unpaid',
    deliveryNotes,
    orderDate: orderDate || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };

  db.saveOrder(newOrder);
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id/status', requireAuth, (req: Request, res: Response) => {
  const { status } = req.body;
  const orders = db.getOrders(req.businessId!);
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.status = status;
  db.saveOrder(order);
  res.json(order);
});

// ==========================================
// STOCK MOVEMENTS & AUDIT
// ==========================================

app.get('/api/stock-movements', requireAuth, (req: Request, res: Response) => {
  res.json(db.getStockMovements(req.businessId!));
});

app.get('/api/audit', requireAuth, (req: Request, res: Response) => {
  res.json(db.getAuditLogs(req.businessId!));
});

// Demo Reset
app.post('/api/demo/reset', requireAuth, (req: Request, res: Response) => {
  db.resetBenchmarkData();
  res.json({ success: true, message: 'Benchmark demo data restored to pristine initial state' });
});

// ==========================================
// GOALS & ACTIONS
// ==========================================

app.get('/api/goals', requireAuth, (req: Request, res: Response) => {
  res.json(db.getGoals(req.businessId!));
});

app.post('/api/goals', requireAuth, (req: Request, res: Response) => {
  const { title, category, targetDescription, targetValue } = req.body;
  const newGoal: BusinessGoal = {
    id: `goal_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
    businessId: req.businessId!,
    title: title.trim(),
    category: category || 'sales',
    targetDescription: targetDescription || 'Founder business objective',
    targetValue: targetValue ? Number(targetValue) : undefined,
    currentValue: 0,
    isCompleted: false,
    createdAt: new Date().toISOString(),
  };
  db.saveGoal(newGoal);
  res.status(201).json(newGoal);
});

app.get('/api/actions', requireAuth, (req: Request, res: Response) => {
  res.json(db.getGrowthActions(req.businessId!));
});

app.post('/api/actions/:id/toggle', requireAuth, (req: Request, res: Response) => {
  const actions = db.getGrowthActions(req.businessId!);
  const act = actions.find(a => a.id === req.params.id);
  if (!act) return res.status(404).json({ error: 'Action not found' });
  act.isCompleted = !act.isCompleted;
  db.saveGrowthAction(act);
  res.json(act);
});

// ==========================================
// GOOGLE GEMINI AI ASSISTANT ENDPOINTS
// ==========================================

app.post('/api/ai/chat', requireAuth, async (req: Request, res: Response) => {
  const { message, history } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message prompt is required' });
  }

  try {
    const result = await askKhulaBizAi(req.businessId!, message.trim(), history);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'AI request failed' });
  }
});

app.post('/api/ai/weekly-plan', requireAuth, async (req: Request, res: Response) => {
  try {
    const plan = await generateWeeklyActionPlan(req.businessId!);
    res.json({ plan });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Plan generation failed' });
  }
});

app.post('/api/ai/what-if', requireAuth, async (req: Request, res: Response) => {
  const { priceChangePct = 0, expenseCutPct = 0, volumeChangePct = 0 } = req.body;
  try {
    const analysis = await simulateWhatIf(req.businessId!, {
      priceChangePct: Number(priceChangePct),
      expenseCutPct: Number(expenseCutPct),
      volumeChangePct: Number(volumeChangePct),
    });
    res.json({ analysis });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Simulation failed' });
  }
});

// ==========================================
// VITE MIDDLEWARE (DEV) & STATIC (PROD)
// ==========================================

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    // Dynamic import for Vite in dev mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KhulaBiz full-stack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
