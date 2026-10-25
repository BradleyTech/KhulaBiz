# KhulaBiz — South African Small Business Companion
**Competition Entry for the FNB App of the Year Hackathon 2026**  
*Challenge: Youth Entrepreneurship and Small-Business Growth*

> **"Know your numbers. Spot your next move. Grow your business."**

---

## 1. Executive Summary & Problem Statement

South Africa's township and rural economy represents over **R150+ billion in annual trade** and provides livelihoods for millions of households. Yet, more than **70% of township micro-enterprises and spaza shops struggle with cash flow**, run out of high-turnover staples during critical weekend trading hours, lose money to untracked customer book debt, and remain excluded from formal banking (such as FNB SME accounts) due to the absence of verifiable financial records.

Traditional accounting software (e.g. QuickBooks, Xero) is costly, desktop-heavy, and full of complex accounting jargon that does not fit the fast counter-service reality of a township spaza shop, street food vendor, or hair salon.

**KhulaBiz** is a mobile-first digital business companion specifically engineered for South African micro-businesses. It turns everyday sales, expenses, stock movements, and customer orders into actionable next moves through its signature **Business Pulse Intelligence Engine**.

---

## 2. Core Value Proposition & Differentiator

Unlike static accounting tools or speculative AI chatbots that hallucinate numbers, KhulaBiz delivers:

1. **2-Tap Fast Counter Transactions**: Log multi-item sales in seconds with automatic stock deduction, discount support, and instant payment categorization (Cash, Card/Yoco, Instant EFT, or Unpaid Credit).
2. **Business Pulse Intelligence Engine**: Deterministic, auditable algorithms that calculate:
   - **Low-Stock Predictions**: Forecasts exactly how many days remain before staple goods (bread, cooking oil, maize meal) run out based on recent sales velocity.
   - **Sales Trend Detection**: Period-over-period comparisons (last 7 days vs previous 7 days) and volume changes.
   - **Cash-Flow Warning**: Real cash float calculation (`starting balance + paid cash inflows - cash outflows`), excluding unpaid credit, with 7-day operating runway alerts.
   - **Restock Urgency Planner**: Prioritised restocking queue with estimated wholesale cost.
   - **Transparent 0-100 Business Health Score**: Evaluated across 6 diagnostic pillars (Sales consistency, margin health, stock safety, expense control, cash runway, record hygiene).
3. **Township Customer Credit Book**: Tracks informal neighbour book credit (e.g. SASSA grant accounts) with 1-click WhatsApp payment reminders.
4. **Isolated Public Digital Storefront**: Generates a shareable public catalogue (`/store/:slug`) where customers can view products and submit WhatsApp pre-orders without exposing any internal financial records, costs, or margins.
5. **Printable Monthly Business Statement**: Generates an official performance report ready for landlords, suppliers, and FNB business account managers (with mandatory operational disclaimer).
6. **Funding-Readiness Checklist**: Step-by-step guidance on CIPC registration, SARS compliance, separated business bank accounts, and gross profit tracking.

---

## 3. Technology Stack

- **Frontend & Framework**: React 19, TypeScript, Vite 8
- **Styling & UI**: Tailwind CSS v4, Lucide React icons, Plus Jakarta Sans typography
- **Data Persistence**: Resilient local-storage state engine with schema validation, transactional rollbacks, and multi-tenant business workspace isolation
- **Calculations & Math**: Fixed decimal financial arithmetic (no floating-point rounding errors)
- **Formatting**: South African Rand (`ZAR` - `R 1,250.00`) and standard South African date formats (`en-ZA`)
- **Security & POPIA**: Zero collection of sensitive identity or banking credentials; strict public storefront boundary isolation; immutable audit trail logging

---

## 4. Application Architecture & Data Flow

```
┌────────────────────────────────────────────────────────┐
│               Mobile & Desktop Client                  │
│       React 19 + TypeScript + Tailwind CSS v4          │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│          Storage & Domain Management Layer             │
│        (Scoped multi-tenant Business Workspaces)       │
├──────────────────────────┬─────────────────────────────┤
│ • Sales Ledger           │ • Inventory & Stock Log     │
│ • Expense Ledger         │ • Customer Credit Book      │
│ • Advance Orders         │ • Immutable Audit Trail     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│        Business Pulse Deterministic Analytics          │
│ • Sales Velocity Analysis (Units/Day)                  │
│ • Stockout Forecasting (Current Qty / Velocity)        │
│ • Cash Float Runway & Upcoming Need Simulation         │
│ • Transparent 100-Point Health Index Scoring           │
└──────────────────────────┬─────────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
┌───────────────────────┐   ┌────────────────────────────┐
│ Authenticated Portal  │   │ Public Storefront Gateway  │
│ Full financials,      │   │ Sanitized public catalog,  │
│ stock control, pulse, │   │ prices, WhatsApp order     │
│ and audit trail       │   │ (Zero financial leakage)   │
└───────────────────────┘   └────────────────────────────┘
```

---

## 5. Live Demonstration & Judge Access Instructions

For the hackathon judges, KhulaBiz is loaded with **Thabo's Corner Store** (Orlando West, Soweto, Gauteng) — a realistic South African microbusiness dataset spanning 30 days of trading:

- **Quick Demo Access**: The app opens directly into Thabo's Corner Store in Demo Mode.
- **Realistic South African Products**: Albany White Bread, Blue Ribbon Brown Bread, Sunfoil Cooking Oil 2L, Iwisa Maize Meal 5kg, Clover Fresh Milk 2L, Golden Delight Rice, Nulaid Eggs 30s, Coca-Cola 330ml, and Vodacom Airtime vouchers.
- **Live Test Scenarios**:
  1. **Record a Sale**: Click `Quick Record` → Select products → Notice stock decrease and cash float update in real time.
  2. **Inspect Business Pulse**: Navigate to `Business Pulse` → View why Sunfoil Cooking Oil is flagged with ~1.3 days remaining stock.
  3. **Void a Sale**: Open `Sales` → Void transaction `KB-2610-0114` with a reason → Notice inventory is restored and cash balance adjusted.
  4. **Customer Credit**: Open `Customers` → Sis Zodwa's SASSA book credit is tracked separately from received cash.
  5. **Reset Demo Benchmark**: Click `Reset Demo` in the top bar to restore pristine benchmark data at any time.

---

## 6. How to Run & Build Locally

```bash
# 1. Clone repository
git clone https://github.com/your-username/khulabiz.git
cd khulabiz

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build for production
npm run build

# 5. Type checking & linting
npm run lint
```

---

## 7. Lean Business Canvas Summary

- **Problem**: 70%+ of township micro-businesses lack cash flow visibility, experience frequent stockouts on weekend staples, and cannot access formal supplier or bank credit.
- **Customer Segments**: Township spaza shop owners, rural general dealers, street food traders, home bakeries, youth entrepreneurs.
- **Unique Value Proposition**: "Know your numbers. Spot your next move. Grow your business." Plain-language, mobile-first business companion with deterministic stock and cash warnings.
- **Revenue Model**:
  - *Free Tier*: Core sales, expenses, and inventory for micro-traders.
  - *KhulaBiz Pro (R99/month)*: Multi-till staff logins, automated WhatsApp customer statements, accountant CSV exports.
  - *Partnerships*: Bank SME onboarding referrals (FNB) and wholesale distributor discounts (Metro Cash & Carry).

---

## 8. Responsible AI & POPIA Compliance

- **No Hallucinations**: Business Pulse relies on verifiable mathematical formulas.
- **Data Minimisation**: No ID numbers, bank logins, or card numbers are requested or stored.
- **Public Isolation**: The public storefront exposes only approved public items and contact details.

*KhulaBiz is dedicated to unlocking the potential of South Africa's vibrant township economy.*
