# KhulaBiz — Security and Secure Development Lifecycle (SSDLC)
**FNB App of the Year Hackathon 2026**

---

### 1. What Data the App Collects
- **Business Identity**: Business name, category, town/city, province, optional address, optional public contact phone number.
- **Transactional Records**: Sales invoices, item line totals, quantities, payment status (paid, partial, unpaid), payment methods (cash, EFT, card, other), and optional transaction notes.
- **Operating Overheads**: Expense amounts, dates, categories (e.g. stock purchases, electricity, transport, rent), supplier names, and notes.
- **Inventory Records**: Product names, SKU codes, categories, unit cost prices, selling prices, stock quantities, and low-stock thresholds.
- **Customer CRM**: Customer names, optional contact phone numbers, and informal credit balances (e.g. SASSA book credit).
- **Audit Events**: Chronological system event logs (action, entity, details, timestamp).
- **NON-COLLECTION GUARANTEE**: KhulaBiz **never** collects national identity numbers (ID/passport), banking passwords, PIN codes, payment card numbers (PAN/CVV), or biometrics.

---

### 2. Where Data is Stored
- **Multi-Tenant Local/Workspace Storage**: Data is partitioned by `businessId` in isolated storage keys. Each business workspace's products, sales, expenses, and customer records are isolated from other businesses on the device.
- **Public Gateway Sanitization**: When rendering the public catalogue (`/store/:slug`), only public items, retail prices, and approved contact numbers are retrieved. Internal financial records (costs, margins, receivables, audit events) are never queried or sent to the public view.

---

### 3. Authentication and Authorization
- **Workspace Scoping**: Every write and read operation is strictly scoped to the active `businessId`.
- **Role Isolation**: Prevents unauthorized access or cross-tenant data contamination.
- **Public vs Private Route Protection**: The authenticated dashboard routes and administrative modals require an active workspace context, while public catalogue routes operate in a sandboxed, read-only mode.

---

### 4. Database Access Policies & Row-Level Isolation
- Data access methods enforce business ID ownership checks before executing mutations.
- Stock decrementing, void operations, and credit balance updates execute transactionally: if a sale is voided, both the inventory restoration and the customer debt reversal occur atomically with an audit log entry.

---

### 5. Input Validation & Numeric Hygiene
- **Monetary Validation**: All monetary inputs (selling prices, unit costs, expense amounts, discounts) are validated as positive numeric values. Negative values are rejected.
- **Negative Stock Protection**: Configurable setting prevents sales or manual reductions from creating accidental negative inventory balances.
- **Void Mandatory Reason**: Void operations on sales or expenses require an explicit audit explanation string.

---

### 6. Handling of Secrets
- Zero API keys, database credentials, or secret service tokens are exposed in the client-side bundle.
- Public URLs do not include access tokens or private identifiers.

---

### 7. Main Threats and Mitigations
| Threat | Mitigation |
|---|---|
| **Data leakage to public storefront** | Public catalogue component accepts only sanitized product list and basic contact info. Internal financial records, costs, and customer books are completely decoupled. |
| **Tampering with financial totals** | Financial totals are calculated dynamically from source line items rather than trusting client-submitted aggregates. |
| **Accidental data loss in demo** | Dedicated `Reset Demo Benchmark` restores pristine benchmark dataset without corrupting user-created workspaces. |
| **POPIA non-compliance** | Data minimisation strictly adhered to; zero collection of unnecessary personal identifiers. |

---

### 8. Testing Performed
- **End-to-End Workflow Verification**: Tested multi-item sales creation, stock decrementing, receipt generation, sale voiding with inventory restoration, expense recording, and cash balance calculation.
- **Business Pulse Intelligence Validation**: Verified low-stock velocity calculation against actual dated transactions (Albany bread, Sunfoil 2L cooking oil, Clover milk).
- **Input Validation**: Verified handling of invalid monetary values, missing customer details, and negative numbers.
- **Responsive Layout Testing**: Tested across desktop viewports, tablet screens, and mobile smartphone views.
- **Build & Lint Verification**: TypeScript strict mode (`tsc --noEmit`) and Vite production bundle build (`npm run build`) passing with zero errors.

---

### 9. Remaining Security Limitations
- In the prototype environment, data is persisted in browser local storage. For enterprise multi-device production rollout, a hardened PostgreSQL backend with Supabase Row Level Security (RLS) and JWT authentication should be connected as documented in the deployment guide.
