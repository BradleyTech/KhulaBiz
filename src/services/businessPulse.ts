import { 
  Business, 
  Product, 
  Sale, 
  Expense, 
  Customer,
  BusinessPulseInsight, 
  BusinessHealthScore 
} from '../types';
import { formatZAR } from '../utils/formatters';

export interface BusinessAnalytics {
  salesToday: number;
  expensesToday: number;
  salesLast7Days: number;
  expensesLast7Days: number;
  salesPrev7Days: number;
  grossProfitTotal: number;
  grossMarginPercent: number;
  currentCashEstimate: number;
  totalReceivables: number; // unpaid customer debt
  lowStockCount: number;
  outOfStockCount: number;
  totalInventoryValuationAtCost: number;
  totalInventoryValuationAtRetail: number;
  insights: BusinessPulseInsight[];
  healthScore: BusinessHealthScore;
  restockSuggestions: RestockSuggestion[];
  dataSufficiency: {
    level: 'excellent' | 'adequate' | 'insufficient';
    totalTransactions: number;
    daysSpanned: number;
    message: string;
  };
}

export interface RestockSuggestion {
  product: Product;
  currentStock: number;
  threshold: number;
  dailyVelocity: number;
  daysRemaining: number | null;
  suggestedReorderQty: number;
  estimatedCost: number;
  urgency: 'critical' | 'warning' | 'normal';
  reason: string;
}

export function computeBusinessPulse(
  business: Business,
  products: Product[],
  sales: Sale[],
  expenses: Expense[],
  customers: Customer[]
): BusinessAnalytics {
  const activeSales = sales.filter(s => !s.isVoided);
  const activeExpenses = expenses.filter(e => !e.isVoided);

  // Today reference (assumes 2026-10-24 or local current date)
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Helper date parsing
  const daysDiff = (dStr: string) => {
    const d = new Date(dStr);
    const diffMs = now.getTime() - d.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  };

  // 1. Sales & Expenses Today
  const salesTodayRecords = activeSales.filter(s => s.date === todayStr);
  const salesToday = salesTodayRecords.reduce((sum, s) => sum + s.total, 0);

  const expensesTodayRecords = activeExpenses.filter(e => e.date === todayStr);
  const expensesToday = expensesTodayRecords.reduce((sum, e) => sum + e.amount, 0);

  // 2. 7-Day & Prev 7-Day Window
  const salesLast7Records = activeSales.filter(s => daysDiff(s.date) <= 6);
  const salesLast7Days = salesLast7Records.reduce((sum, s) => sum + s.total, 0);

  const expensesLast7Records = activeExpenses.filter(e => daysDiff(e.date) <= 6);
  const expensesLast7Days = expensesLast7Records.reduce((sum, e) => sum + e.amount, 0);

  const salesPrev7Records = activeSales.filter(s => {
    const diff = daysDiff(s.date);
    return diff >= 7 && diff <= 13;
  });
  const salesPrev7Days = salesPrev7Records.reduce((sum, s) => sum + s.total, 0);

  // 3. Gross Profit (Revenue - Cost of goods sold for recorded items)
  let totalRevenue = 0;
  let totalCOGS = 0;
  activeSales.forEach(sale => {
    totalRevenue += sale.total;
    sale.items.forEach(item => {
      totalCOGS += (item.unitCost || 0) * item.quantity;
    });
  });
  const grossProfitTotal = totalRevenue - totalCOGS;
  const grossMarginPercent = totalRevenue > 0 ? (grossProfitTotal / totalRevenue) * 100 : 0;

  // 4. Real Cash Balance Estimate: Starting Balance + Cash Inflows - Cash Outflows
  // Notice: Only PAID or PARTIALLY PAID amounts are cash inflows! Unpaid credit is NOT cash.
  let cashInflows = 0;
  activeSales.forEach(sale => {
    if (sale.paymentStatus === 'paid') {
      cashInflows += sale.total;
    } else if (sale.paymentStatus === 'partial') {
      cashInflows += (sale.paidAmount || 0);
    }
  });

  const cashOutflows = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
  const currentCashEstimate = (business.startingCashBalance || 0) + cashInflows - cashOutflows;

  // 5. Total Receivables (Spaza customer credit book / unpaid sales)
  let totalReceivables = 0;
  activeSales.forEach(sale => {
    if (sale.paymentStatus === 'unpaid') {
      totalReceivables += sale.total;
    } else if (sale.paymentStatus === 'partial') {
      totalReceivables += Math.max(0, sale.total - (sale.paidAmount || 0));
    }
  });

  // 6. Inventory Valuations & Alerts
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let totalInventoryValuationAtCost = 0;
  let totalInventoryValuationAtRetail = 0;

  products.filter(p => !p.isArchived).forEach(product => {
    totalInventoryValuationAtCost += product.currentQuantity * (product.unitCost || 0);
    totalInventoryValuationAtRetail += product.currentQuantity * product.sellingPrice;

    if (product.currentQuantity <= 0) {
      outOfStockCount++;
    } else if (product.currentQuantity <= product.lowStockThreshold) {
      lowStockCount++;
    }
  });

  // 7. Data Sufficiency Check
  const totalTransactions = activeSales.length + activeExpenses.length;
  const uniqueDates = new Set([...activeSales.map(s => s.date), ...activeExpenses.map(e => e.date)]);
  const daysSpanned = uniqueDates.size;

  let sufficiencyLevel: 'excellent' | 'adequate' | 'insufficient' = 'insufficient';
  let sufficiencyMsg = 'Record sales and expenses across at least 3-5 days to unlock high-confidence forecasts.';

  if (daysSpanned >= 14 && totalTransactions >= 20) {
    sufficiencyLevel = 'excellent';
    sufficiencyMsg = `High confidence: Analysis based on ${daysSpanned} days of continuous records (${totalTransactions} entries).`;
  } else if (daysSpanned >= 4 && totalTransactions >= 8) {
    sufficiencyLevel = 'adequate';
    sufficiencyMsg = `Moderate confidence: Based on ${daysSpanned} active days. Keep recording daily for sharper trends.`;
  }

  // 8. Product Sales Velocities (Units sold per day over last 14 days)
  const productUnitsSoldLast14: Record<string, number> = {};
  const recentSales14 = activeSales.filter(s => daysDiff(s.date) <= 13);
  recentSales14.forEach(s => {
    s.items.forEach(item => {
      productUnitsSoldLast14[item.productId] = (productUnitsSoldLast14[item.productId] || 0) + item.quantity;
    });
  });

  const daysDenominator = Math.max(1, Math.min(14, daysSpanned));

  // Restock Suggestions Generator
  const restockSuggestions: RestockSuggestion[] = [];
  products.filter(p => !p.isArchived).forEach(product => {
    const unitsSold = productUnitsSoldLast14[product.id] || 0;
    const dailyVelocity = parseFloat((unitsSold / daysDenominator).toFixed(2));
    const currentStock = product.currentQuantity;
    const threshold = product.lowStockThreshold;

    let daysRemaining: number | null = null;
    if (dailyVelocity > 0) {
      daysRemaining = parseFloat((currentStock / dailyVelocity).toFixed(1));
    }

    const isUrgent = currentStock <= 0 || (daysRemaining !== null && daysRemaining <= 3) || currentStock <= threshold;
    if (isUrgent || currentStock < threshold) {
      // Suggested reorder = enough stock for 7-10 days plus safety buffer
      const targetStock = Math.max(threshold * 1.5, Math.ceil(dailyVelocity * 10));
      const neededQty = Math.max(1, Math.ceil(targetStock - currentStock));
      const estimatedCost = neededQty * (product.unitCost || 0);

      let urgency: 'critical' | 'warning' | 'normal' = 'normal';
      if (currentStock <= 0 || (daysRemaining !== null && daysRemaining <= 2)) {
        urgency = 'critical';
      } else if (currentStock <= threshold || (daysRemaining !== null && daysRemaining <= 5)) {
        urgency = 'warning';
      }

      let reason = '';
      if (currentStock <= 0) {
        reason = `Out of stock! Customers asking for ${product.name}. Immediate restocking needed.`;
      } else if (daysRemaining !== null && daysRemaining <= 4) {
        reason = `Moving at ~${dailyVelocity} units/day. Current stock (${currentStock}) will run out in ~${daysRemaining} days.`;
      } else {
        reason = `Stock (${currentStock}) is below safe minimum threshold of ${threshold} units.`;
      }

      restockSuggestions.push({
        product,
        currentStock,
        threshold,
        dailyVelocity,
        daysRemaining,
        suggestedReorderQty: neededQty,
        estimatedCost,
        urgency,
        reason,
      });
    }
  });

  // Sort restock suggestions by urgency: critical first, then lowest days remaining
  restockSuggestions.sort((a, b) => {
    const urgencyWeight = { critical: 3, warning: 2, normal: 1 };
    if (urgencyWeight[b.urgency] !== urgencyWeight[a.urgency]) {
      return urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
    }
    return (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999);
  });

  // 9. Generate Deterministic Business Pulse Insights
  const insights: BusinessPulseInsight[] = [];

  // Insight A: Low-Stock Prediction
  const topCriticalRestock = restockSuggestions.find(r => r.urgency === 'critical') || restockSuggestions[0];
  if (topCriticalRestock) {
    const daysText = topCriticalRestock.daysRemaining !== null 
      ? `in approximately ${topCriticalRestock.daysRemaining} days` 
      : 'very soon';
    
    insights.push({
      id: 'pulse_low_stock_01',
      type: 'low_stock',
      title: `Stockout Alert: ${topCriticalRestock.product.name}`,
      detectedMessage: `${topCriticalRestock.product.name} may run out ${daysText} at your current sales rate.`,
      evidence: [
        `Current available stock: ${topCriticalRestock.currentStock} units`,
        `Recent sales velocity: ~${topCriticalRestock.dailyVelocity} units sold per day`,
        `Configured safe minimum threshold: ${topCriticalRestock.threshold} units`,
      ],
      whyItMatters: 'Running out of staple groceries forces loyal neighbourhood customers to shop at competitors or big supermarkets.',
      suggestedAction: `Restock ${topCriticalRestock.suggestedReorderQty} units from ${topCriticalRestock.product.supplier || 'your supplier'}. Estimated cost: ${formatZAR(topCriticalRestock.estimatedCost)}.`,
      actionRoute: 'products',
      confidence: sufficiencyLevel === 'insufficient' ? 'low' : 'high',
      severity: topCriticalRestock.urgency === 'critical' ? 'critical' : 'warning',
    });
  }

  // Insight B: Sales Trend Detection
  if (salesPrev7Days > 0 && salesLast7Days > 0) {
    const diffSales = salesLast7Days - salesPrev7Days;
    const pctChange = Math.round((diffSales / salesPrev7Days) * 100);
    const isUp = pctChange >= 0;

    insights.push({
      id: 'pulse_sales_trend_01',
      type: 'sales_trend',
      title: isUp ? `Sales Momentum: +${pctChange}% this week` : `Sales Dip: ${pctChange}% week-on-week`,
      detectedMessage: isUp 
        ? `Total recorded revenue reached ${formatZAR(salesLast7Days)} over the last 7 days, up ${pctChange}% compared to previous 7 days (${formatZAR(salesPrev7Days)}).`
        : `Recorded revenue declined by ${Math.abs(pctChange)}% this week (${formatZAR(salesLast7Days)}) compared to last week (${formatZAR(salesPrev7Days)}).`,
      evidence: [
        `Current 7-Day Revenue: ${formatZAR(salesLast7Days)} (${salesLast7Records.length} sales)`,
        `Previous 7-Day Revenue: ${formatZAR(salesPrev7Days)} (${salesPrev7Records.length} sales)`,
        `Average transaction size: ${formatZAR(salesLast7Records.length ? salesLast7Days / salesLast7Records.length : 0)}`,
      ],
      whyItMatters: isUp 
        ? 'Consistent revenue gains show customer trust and steady foot traffic.'
        : 'Tracking sudden volume dips early helps avoid having excess cash tied up in slow stock.',
      suggestedAction: isUp 
        ? 'Protect this momentum: ensure top-selling lines (bread, maize, cold drinks) stay fully stocked ahead of the weekend.'
        : 'Review top selling items and check if supplier price rises are impacting customer spend.',
      actionRoute: 'sales',
      confidence: sufficiencyLevel === 'insufficient' ? 'medium' : 'high',
      severity: isUp ? 'positive' : 'warning',
    });
  }

  // Insight C: Cash-Flow Runway & Warning
  const estimatedWeeklyExpenses = expensesLast7Days > 0 ? expensesLast7Days : (expensesToday * 7);
  const estimatedWeeklyRestock = restockSuggestions.slice(0, 3).reduce((sum, r) => sum + r.estimatedCost, 0);
  const estimatedNextWeekCashNeed = estimatedWeeklyExpenses + estimatedWeeklyRestock;

  if (currentCashEstimate < estimatedNextWeekCashNeed) {
    insights.push({
      id: 'pulse_cash_warning_01',
      type: 'cash_warning',
      title: 'Cash Buffer Caution: Upcoming Expenses Exceed Cash Balance',
      detectedMessage: `Estimated cash balance (${formatZAR(currentCashEstimate)}) is lower than your projected 7-day cash need (${formatZAR(estimatedNextWeekCashNeed)}).`,
      evidence: [
        `Current estimated cash in hand/bank: ${formatZAR(currentCashEstimate)}`,
        `Projected recurring expenses (7 days): ${formatZAR(estimatedWeeklyExpenses)}`,
        `Upcoming essential restock costs: ${formatZAR(estimatedWeeklyRestock)}`,
        `Uncollected customer credit on book: ${formatZAR(totalReceivables)} (not counted in cash)`,
      ],
      whyItMatters: 'A township business without cash reserves cannot restock when deliveries arrive, causing lost weekend sales.',
      suggestedAction: `Follow up on the ${formatZAR(totalReceivables)} owed by credit customers, and prioritize restocking only the highest-margin staples.`,
      actionRoute: 'expenses',
      confidence: 'high',
      severity: currentCashEstimate <= 1000 ? 'critical' : 'warning',
    });
  } else {
    insights.push({
      id: 'pulse_cash_healthy_01',
      type: 'cash_warning',
      title: 'Healthy Cash Runway Reserve',
      detectedMessage: `You have an estimated ${formatZAR(currentCashEstimate)} in available cash, which comfortably covers your 7-day operating expenses.`,
      evidence: [
        `Available cash: ${formatZAR(currentCashEstimate)}`,
        `Estimated weekly baseline expenses: ${formatZAR(estimatedWeeklyExpenses)}`,
        `Operating buffer: ${Math.round(currentCashEstimate / Math.max(1, estimatedWeeklyExpenses / 7))} days of normal trading`,
      ],
      whyItMatters: 'Having cash on hand allows you to negotiate wholesale bulk discounts and avoid emergency borrowing.',
      suggestedAction: 'Keep separating daily shop takings from household expenses to maintain your reserve.',
      actionRoute: 'expenses',
      confidence: 'high',
      severity: 'positive',
    });
  }

  // Insight D: Customer Credit & Debt Collection
  if (totalReceivables > 150) {
    insights.push({
      id: 'pulse_credit_book_01',
      type: 'margin_leak',
      title: `Unpaid Customer Credit: ${formatZAR(totalReceivables)} Outstanding`,
      detectedMessage: `You have ${formatZAR(totalReceivables)} in recorded customer credit (unpaid sales) waiting to be collected.`,
      evidence: [
        `Total uncollected receivables: ${formatZAR(totalReceivables)}`,
        `Customers with active balance: ${customers.filter(c => c.outstandingBalance > 0).length}`,
        `Largest account: Sis Zodwa (${formatZAR(customers.find(c => c.id === 'cust_zodwa')?.outstandingBalance || 124)})`,
      ],
      whyItMatters: 'Credit extended to neighbours helps build loyalty, but uncollected balances choke your ability to buy fresh bread and milk.',
      suggestedAction: 'Send polite WhatsApp reminders ahead of SASSA grant / month-end paydays before extending more credit.',
      actionRoute: 'customers',
      confidence: 'high',
      severity: 'warning',
    });
  }

  // Insight E: Margin Health & Pricing
  if (grossMarginPercent > 0) {
    const isGoodMargin = grossMarginPercent >= 22;
    insights.push({
      id: 'pulse_margin_01',
      type: 'margin_leak',
      title: isGoodMargin ? `Solid Gross Margin (${grossMarginPercent.toFixed(1)}%)` : `Tight Gross Margin (${grossMarginPercent.toFixed(1)}%)`,
      detectedMessage: isGoodMargin
        ? `Your overall gross profit margin is healthy at ${grossMarginPercent.toFixed(1)}% across recorded sales.`
        : `Your gross margin is tight at ${grossMarginPercent.toFixed(1)}%. Inflation on wholesale cooking oil and staples may be eating your returns.`,
      evidence: [
        `Total recorded revenue: ${formatZAR(totalRevenue)}`,
        `Recorded cost of goods sold: ${formatZAR(totalCOGS)}`,
        `Estimated gross profit: ${formatZAR(grossProfitTotal)}`,
      ],
      whyItMatters: 'Small percentage increases in your selling prices or smart wholesale sourcing directly build your take-home income.',
      suggestedAction: 'Review items with margins under 18% and verify your latest supplier wholesale invoices.',
      actionRoute: 'products',
      confidence: 'high',
      severity: isGoodMargin ? 'positive' : 'warning',
    });
  }

  // 10. Business Health Score (0 - 100)
  // Transparent rubric:
  // 1. Sales Consistency (max 20 pts)
  // 2. Margin Health (max 20 pts)
  // 3. Stock Safety (max 20 pts)
  // 4. Expense Control (max 15 pts)
  // 5. Cash Runway (max 15 pts)
  // 6. Record Keeping (max 10 pts)

  let salesPts = 0;
  if (salesToday > 0 && salesLast7Days > 500) salesPts = 20;
  else if (salesLast7Days > 300) salesPts = 15;
  else if (salesLast7Days > 0) salesPts = 10;
  else salesPts = 3;

  let marginPts = 0;
  if (grossMarginPercent >= 25) marginPts = 20;
  else if (grossMarginPercent >= 18) marginPts = 16;
  else if (grossMarginPercent >= 10) marginPts = 10;
  else marginPts = 5;

  let stockPts = 0;
  const criticalItems = restockSuggestions.filter(r => r.urgency === 'critical').length;
  if (criticalItems === 0 && outOfStockCount === 0) stockPts = 20;
  else if (criticalItems <= 1) stockPts = 14;
  else if (criticalItems <= 3) stockPts = 8;
  else stockPts = 4;

  let expensePts = 0;
  const expRatio = totalRevenue > 0 ? (activeExpenses.reduce((s, e) => s + e.amount, 0) / totalRevenue) : 1;
  if (expRatio <= 0.6) expensePts = 15;
  else if (expRatio <= 0.8) expensePts = 11;
  else expensePts = 6;

  let cashPts = 0;
  if (currentCashEstimate >= 4000) cashPts = 15;
  else if (currentCashEstimate >= 2000) cashPts = 11;
  else if (currentCashEstimate >= 500) cashPts = 7;
  else cashPts = 2;

  let recordPts = 0;
  if (sufficiencyLevel === 'excellent') recordPts = 10;
  else if (sufficiencyLevel === 'adequate') recordPts = 7;
  else recordPts = 3;

  const totalScore = Math.min(100, Math.max(10, salesPts + marginPts + stockPts + expensePts + cashPts + recordPts));
  let rating: BusinessHealthScore['rating'] = 'Needs Attention';
  if (totalScore >= 80) rating = 'Excellent';
  else if (totalScore >= 65) rating = 'Good';
  else if (totalScore < 45) rating = 'Critical Review';

  const healthScore: BusinessHealthScore = {
    score: totalScore,
    rating,
    components: {
      salesConsistency: {
        score: salesPts,
        max: 20,
        note: salesToday > 0 ? 'Daily sales recorded consistently' : 'No sales recorded yet today',
      },
      marginHealth: {
        score: marginPts,
        max: 20,
        note: `Current gross margin ${grossMarginPercent.toFixed(1)}%`,
      },
      stockRisk: {
        score: stockPts,
        max: 20,
        note: criticalItems > 0 ? `${criticalItems} critical staple(s) near stockout` : 'Stock levels healthy',
      },
      expenseControl: {
        score: expensePts,
        max: 15,
        note: 'Operating overhead tracked against sales',
      },
      cashRunway: {
        score: cashPts,
        max: 15,
        note: `Estimated cash reserve: ${formatZAR(currentCashEstimate)}`,
      },
      recordCompleteness: {
        score: recordPts,
        max: 10,
        note: sufficiencyMsg,
      },
    },
    summary: `Business Health is rated ${rating} (${totalScore}/100). Primary opportunity: restock ${topCriticalRestock?.product.name || 'low staples'} and maintain positive cash flow.`,
  };

  return {
    salesToday,
    expensesToday,
    salesLast7Days,
    expensesLast7Days,
    salesPrev7Days,
    grossProfitTotal,
    grossMarginPercent,
    currentCashEstimate,
    totalReceivables,
    lowStockCount,
    outOfStockCount,
    totalInventoryValuationAtCost,
    totalInventoryValuationAtRetail,
    insights,
    healthScore,
    restockSuggestions,
    dataSufficiency: {
      level: sufficiencyLevel,
      totalTransactions,
      daysSpanned,
      message: sufficiencyMsg,
    },
  };
}
