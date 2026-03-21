# Product Requirements Document (PRD)
# Financial Tracker

**Version:** 1.0
**Date:** 2026-03-15
**Author:** Claude (AI Assistant)
**Status:** Draft - Pending Approval

---

## 1. Executive Summary

### 1.1 Problem Statement
Managing 7+ credit cards with different billing cycles using Google Sheets is time-consuming and error-prone. Manual data entry is tedious, and tracking spending across multiple cards with varying cut-off dates makes it difficult to maintain accurate financial oversight.

### 1.2 Solution
A shared web application for tracking credit card usage between two users (husband and wife) with features for receipt scanning, budget tracking, and monthly spending summaries. The app will support multiple cards with different billing cycles and provide clear visibility into spending patterns.

### 1.3 Target Users
- Primary: Husband and wife sharing household finances
- User accounts: Separate logins with shared access to all transaction data

---

## 2. Goals & Success Metrics

### 2.1 Goals
1. **Reduce time spent** on manual expense tracking compared to Google Sheets
2. **Improve accuracy** with receipt scanning and structured data entry
3. **Better visibility** into spending by card, category, and billing period
4. **Simplify collaboration** with real-time shared access

### 2.2 Success Metrics
- Time to log a transaction: < 30 seconds (manual), < 15 seconds (receipt scan)
- All transactions logged within 24 hours of occurrence
- Monthly summary available within 1 click
- Zero missed payment due dates (with alerts)

---

## 3. User Stories

### 3.1 Authentication & Access
| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| U1 | User | Create an account with email/password | I can securely access the app |
| U2 | User | Log in to my personal account | I can access shared transaction data |
| U3 | User | See which user added each transaction | We can track who logged what |

### 3.2 Credit Card Management
| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| C1 | User | Add a new credit card with name, bank, and last 4 digits | I can categorize transactions by card |
| C2 | User | Set billing cycle dates (cut-off and due date) for each card | I can track spending per statement period |
| C3 | User | Set credit limit for each card | I can monitor available credit |
| C4 | User | Assign card ownership (me, spouse, or shared) | We know whose card was used |
| C5 | User | Deactivate a card without losing history | Old cards don't clutter the interface |

### 3.3 Transaction Management
| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| T1 | User | Add a transaction with amount, date, merchant, card, and category | I have a complete record |
| T2 | User | Scan a receipt to auto-fill transaction details | Data entry is faster |
| T3 | User | Attach receipt images to transactions | I have proof of purchase |
| T4 | User | Add tags to transactions | I can filter by custom criteria |
| T5 | User | Mark transactions as recurring | I can track subscriptions |
| T6 | User | Edit or delete transactions | I can fix mistakes |
| T7 | User | See all transactions in a list with filters | I can find specific transactions |
| T8 | User | Filter transactions by card, category, date range, or tag | I can analyze specific spending |

### 3.4 Categories & Budgets
| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| B1 | User | See preset categories (Food, Transport, Shopping, Bills, Others) | I can categorize quickly |
| B2 | User | Set monthly budget limits per category | I can control spending |
| B3 | User | Receive alerts when approaching budget limits (80%, 100%) | I don't overspend |
| B4 | User | View budget vs actual spending per category | I know where I stand |

### 3.5 Billing & Statements
| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| S1 | User | View transactions grouped by billing period per card | I can reconcile with statements |
| S2 | User | See total amount due per card for current period | I know what to pay |
| S3 | User | Mark a statement period as paid | I can track payment status |
| S4 | User | Receive payment due date reminders | I never miss a payment |

### 3.6 Reports & Analytics
| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| R1 | User | View monthly spending summary by category | I understand spending patterns |
| R2 | User | View monthly spending summary by card | I know which cards are used most |
| R3 | User | Compare spending across months | I can track trends |
| R4 | User | See a dashboard with key metrics | I get quick financial overview |

---

## 4. Functional Requirements

### 4.1 Core Features (P1 - MVP)

#### 4.1.1 User Authentication
- Email/password registration and login
- Session management with JWT tokens
- Password reset functionality
- Two users sharing the same data household

#### 4.1.2 Credit Card Management
- CRUD operations for credit cards
- Fields:
  - Card name (e.g., "KBank Platinum")
  - Bank name
  - Last 4 digits
  - Card color (for visual identification)
  - Cut-off date (day of month, e.g., 25th)
  - Payment due date (day of month, e.g., 10th)
  - Credit limit (THB)
  - Owner (user reference)
  - Active/inactive status

#### 4.1.3 Transaction Management
- CRUD operations for transactions
- Fields:
  - Amount (THB, 2 decimal places)
  - Transaction date
  - Merchant name
  - Card reference
  - Category (enum)
  - Notes (optional)
  - Tags (array, optional)
  - Is recurring (boolean)
  - Recurring frequency (if recurring)
  - Receipt image URL (optional)
  - Created by (user reference)
  - Created at / Updated at

#### 4.1.4 Categories
- Preset categories:
  - Food & Dining
  - Transportation
  - Shopping
  - Bills & Utilities
  - Entertainment
  - Healthcare
  - Travel
  - Others

#### 4.1.5 Budget Management
- Set monthly budget per category
- Budget alert thresholds (80%, 100%)
- View budget vs actual

#### 4.1.6 Statement Period Tracking
- Auto-calculate statement periods based on card cut-off dates
- Group transactions by statement period
- Calculate statement total per card
- Payment status tracking (unpaid/paid)

#### 4.1.7 Monthly Summary Dashboard
- Total spending (current month)
- Spending by category (pie/bar chart)
- Spending by card
- Recent transactions list
- Upcoming payment due dates
- Budget status indicators

### 4.2 Enhanced Features (P2)

#### 4.2.1 Receipt Scanning (OCR)
- Upload receipt photo
- Extract: merchant name, amount, date
- User confirms/edits extracted data
- Store original image

#### 4.2.2 Recurring Transaction Templates
- Create templates for recurring expenses
- Auto-suggest when adding similar transactions
- Track subscription/recurring payment history

#### 4.2.3 Advanced Filtering & Search
- Full-text search on merchant/notes
- Multi-select filters (cards, categories, tags)
- Date range picker
- Export to CSV

### 4.3 Future Features (P3)

#### 4.3.1 Push Notifications
- Budget alerts
- Payment due reminders
- Weekly spending summary

#### 4.3.2 Multi-currency Support
- Track foreign currency transactions
- Auto-convert to THB

#### 4.3.3 Bank Statement Import
- CSV import from Thai banks
- Transaction matching/deduplication

---

## 5. Non-Functional Requirements

### 5.1 Performance
- Page load time: < 2 seconds
- API response time: < 500ms for standard queries
- OCR processing: < 5 seconds

### 5.2 Security
- HTTPS only
- Password hashing (bcrypt)
- JWT with secure expiration
- Input validation (Zod)
- SQL injection prevention (Prisma ORM)
- XSS protection

### 5.3 Availability
- 99% uptime target
- Automated PostgreSQL backups (daily)
- Error monitoring and logging

### 5.4 Usability
- Desktop-first, mobile responsive design
- Thai language primary, English secondary
- Accessible (WCAG 2.1 AA)

---

## 6. Technical Architecture

### 6.1 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vite 7 + React 19 + TypeScript 5 |
| Styling | Tailwind CSS 3 |
| State/Data | TanStack Query 5 |
| Routing | React Router DOM 6 |
| Validation | Zod 3 |
| Backend | Fastify 4 + TypeScript 5 |
| ORM | Prisma 5 |
| Database | PostgreSQL 15+ |
| OCR | Cloud Vision API or Tesseract.js |
| File Storage | Local filesystem or S3-compatible |
| Testing | Vitest + React Testing Library + Playwright |
| Deployment | Linode VPS + Terraform + Ansible |

### 6.2 Database Schema (Core Entities)

```
┌─────────────────┐     ┌─────────────────┐
│     Users       │     │   Households    │
├─────────────────┤     ├─────────────────┤
│ id              │────<│ id              │
│ email           │     │ name            │
│ password_hash   │     │ created_at      │
│ name            │     └─────────────────┘
│ household_id    │──────────────┘
│ created_at      │
└─────────────────┘
         │
         │ created_by
         ▼
┌─────────────────┐     ┌─────────────────┐
│   CreditCards   │     │  Transactions   │
├─────────────────┤     ├─────────────────┤
│ id              │────<│ id              │
│ household_id    │     │ card_id         │>────┘
│ name            │     │ amount          │
│ bank            │     │ merchant        │
│ last_four       │     │ category        │
│ color           │     │ date            │
│ cutoff_day      │     │ notes           │
│ due_day         │     │ receipt_url     │
│ credit_limit    │     │ is_recurring    │
│ owner_id        │     │ created_by      │
│ is_active       │     │ created_at      │
│ created_at      │     └─────────────────┘
└─────────────────┘              │
                                 │
┌─────────────────┐     ┌────────┴────────┐
│     Budgets     │     │ TransactionTags │
├─────────────────┤     ├─────────────────┤
│ id              │     │ transaction_id  │
│ household_id    │     │ tag_id          │
│ category        │     └─────────────────┘
│ monthly_limit   │              │
│ created_at      │     ┌────────┴────────┐
└─────────────────┘     │      Tags       │
                        ├─────────────────┤
┌─────────────────┐     │ id              │
│   Statements    │     │ household_id    │
├─────────────────┤     │ name            │
│ id              │     └─────────────────┘
│ card_id         │
│ period_start    │
│ period_end      │
│ total_amount    │
│ is_paid         │
│ paid_at         │
└─────────────────┘
```

### 6.3 API Endpoints (Core)

```
Authentication:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me

Credit Cards:
GET    /api/cards
POST   /api/cards
GET    /api/cards/:id
PUT    /api/cards/:id
DELETE /api/cards/:id

Transactions:
GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/:id
PUT    /api/transactions/:id
DELETE /api/transactions/:id
POST   /api/transactions/scan-receipt

Categories & Budgets:
GET    /api/categories
GET    /api/budgets
POST   /api/budgets
PUT    /api/budgets/:id

Statements:
GET    /api/statements
GET    /api/statements/:cardId/current
PUT    /api/statements/:id/mark-paid

Analytics:
GET    /api/analytics/monthly-summary
GET    /api/analytics/by-category
GET    /api/analytics/by-card
```

### 6.4 Project Structure

```
financial-tracker/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Reusable UI components
│   │   │   ├── cards/           # Credit card components
│   │   │   ├── transactions/    # Transaction components
│   │   │   └── analytics/       # Charts and reports
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Transactions.tsx
│   │   │   ├── Cards.tsx
│   │   │   ├── Budgets.tsx
│   │   │   ├── Analytics.tsx
│   │   │   └── Settings.tsx
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── types/
│   │   └── i18n/
│   ├── e2e/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── plugins/
│   │   ├── types/
│   │   └── utils/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── package.json
│
├── deploy/
│   ├── terraform/
│   ├── ansible/
│   └── scripts/
│
├── docs/
│   └── PRD.md
│
└── docker-compose.yml
```

---

## 7. User Interface Wireframes

### 7.1 Dashboard (Desktop)
```
┌────────────────────────────────────────────────────────────────┐
│  [Logo] Financial Tracker Dashboard | Transactions | Cards     │
│                                              [User ▼] [+ Add]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ This Month   │ │ Due Soon     │ │ Budget       │            │
│  │ ฿45,230.00   │ │ 3 cards      │ │ 68% used     │            │
│  │ ↑12% vs last │ │ Next: Mar 20 │ │ Food: 85%    │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                │
│  ┌─────────────────────────────┐ ┌──────────────────────────┐  │
│  │ Spending by Category        │ │ Recent Transactions      │  │
│  │ [Pie Chart]                 │ │ ───────────────────────  │  │
│  │ ● Food      35%  ฿15,830    │ │ Today                    │  │
│  │ ● Shopping  28%  ฿12,664    │ │ ☕ Starbucks    ฿185      │  │
│  │ ● Transport 20%  ฿9,046     │ │ 🛒 Tops        ฿1,245    │  │
│  │ ● Bills     12%  ฿5,428     │ │ ───────────────────────  │  │
│  │ ● Others     5%  ฿2,262     │ │ Yesterday                │  │
│  └─────────────────────────────┘ │ ⛽ Shell       ฿1,500    │  │
│                                  └──────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Cards Overview                                          │   │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │   │
│  │ │ KBank   │ │ SCB     │ │ Citi    │ │ AMEX    │  ...    │   │
│  │ │ •••4521 │ │ •••7892 │ │ •••3456 │ │ •••9012 │         │   │
│  │ │ ฿12,450 │ │ ฿8,230  │ │ ฿15,100 │ │ ฿9,450  │         │   │
│  │ │ Due: 10 │ │ Due: 15 │ │ Due: 20 │ │ Due: 25 │         │   │
│  │ └─────────┘ └─────────┘ └─────────┘ └─────────┘         │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### 7.2 Add Transaction Modal
```
┌───────────────────────────────────────────┐
│ Add Transaction                      [X]  │
├───────────────────────────────────────────┤
│                                           │
│  Amount *                                 │
│  ┌─────────────────────────────────────┐  │
│  │ ฿ 1,250.00                          │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  Date *                Merchant *         │
│  ┌──────────────────┐ ┌────────────────┐  │
│  │ 15 Mar 2026      │ │ Tops Market    │  │
│  └──────────────────┘ └────────────────┘  │
│                                           │
│  Card *                                   │
│  ┌─────────────────────────────────────┐  │
│  │ [🔵] KBank Platinum •••4521      ▼  │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  Category *                               │
│  ┌─────────────────────────────────────┐  │
│  │ 🛒 Shopping                       ▼ │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  Tags                                     │
│  ┌─────────────────────────────────────┐  │
│  │ [groceries] [weekly] [+]            │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  Notes                                    │
│  ┌─────────────────────────────────────┐  │
│  │ Weekly grocery shopping             │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  ☐ Recurring transaction                  │
│                                           │
│  📷 Scan Receipt  |  📎 Attach Image      │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │           Save Transaction          │  │
│  └─────────────────────────────────────┘  │
└───────────────────────────────────────────┘
```

---

## 8. Implementation Phases

### Phase 1: Foundation (MVP)
**Scope:**
- User authentication (register, login)
- Household setup (invite spouse)
- Credit card CRUD
- Transaction CRUD (manual entry)
- Basic category assignment
- Transaction list with filters
- Simple monthly summary

**Deliverables:**
- Working app with core functionality
- Test coverage > 80%
- Deployed to Linode

### Phase 2: Enhanced Features
**Scope:**
- Budget management with alerts
- Statement period tracking
- Payment due reminders
- Receipt image upload (no OCR yet)
- Tags for transactions
- Recurring transaction flag
- Dashboard improvements

### Phase 3: Intelligence
**Scope:**
- Receipt OCR scanning
- Auto-categorization suggestions
- Trend analysis
- CSV export
- Advanced search

### Phase 4: Polish
**Scope:**
- Push notifications
- Thai/English language toggle
- Mobile PWA optimization
- Performance optimization
- Bank CSV import

---

## 9. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| OCR accuracy issues | Medium | High | Start with manual entry; add OCR as enhancement |
| Complex billing cycle logic | Medium | Medium | Thorough testing; handle edge cases |
| Data loss | High | Low | Daily backups; PostgreSQL reliability |
| Scope creep | Medium | Medium | Strict phase boundaries; MVP focus |

---

## 10. Open Questions

1. **OCR Provider:** Use Google Cloud Vision API (cost per request) or Tesseract.js (free, less accurate)?
2. **Notifications:** Email only, or implement push notifications from start?
3. **Invitation Flow:** How should the spouse be invited? Email link? Shared code?
4. **Data Retention:** How long to keep transaction history? Forever?

---

## 11. Appendix

### A. Category Icons (Suggested)
| Category | Emoji |
|----------|-------|
| Food & Dining | 🍽️ |
| Transportation | 🚗 |
| Shopping | 🛒 |
| Bills & Utilities | 📱 |
| Entertainment | 🎬 |
| Healthcare | 🏥 |
| Travel | ✈️ |
| Others | 📦 |

### B. Thai Banks (Common)
- KBank (Kasikorn)
- SCB (Siam Commercial)
- Bangkok Bank
- Krungsri (Bank of Ayudhya)
- Krungthai
- TMB Thanachart (ttb)
- Citibank
- UOB
- HSBC
- AMEX

---

**Document Status:** Ready for Review
**Next Steps:** Await stakeholder approval before implementation
