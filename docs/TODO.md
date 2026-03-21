# Financial Tracker - TODO

## Summary

| Phase | Scope | Approach |
|-------|-------|----------|
| 1. TDD Foundation | Add tests to existing code | Full stack (backend + frontend) |
| 2. UX Improvements | Checkbox, dropdown, settings | Apply with TDD |
| 3. Savings/Reserve | New feature | Separate from FixedCosts, build with TDD |

---

## Phase 1: TDD Foundation

### Current State
- **Vitest**: Configured for both frontend and backend
- **Playwright**: Dependencies installed, needs config file
- **Backend mocks**: Prisma mock ready at `backend/src/__mocks__/prisma.ts`
- **Frontend setup**: `frontend/src/__tests__/setup.ts` with localStorage/matchMedia mocks
- **Tests written**: None

### 1.1 Create Playwright Config
**File to create**: `frontend/playwright.config.ts`

### 1.2 Backend Service Tests
Start with simpler services, then complex ones:

| Priority | Service | File to Create |
|----------|---------|----------------|
| 1 | Tags | `backend/src/services/tags.service.test.ts` |
| 2 | Budgets | `backend/src/services/budgets.service.test.ts` |
| 3 | Cards | `backend/src/services/cards.service.test.ts` |
| 4 | FixedCosts | `backend/src/services/fixed-costs.service.test.ts` |
| 5 | Installments | `backend/src/services/installments.service.test.ts` |
| 6 | Transactions | `backend/src/services/transactions.service.test.ts` |
| 7 | Analytics | `backend/src/services/analytics.service.test.ts` |

### 1.3 Frontend Hook Tests
| Hook | File to Create |
|------|----------------|
| useAuth | `frontend/src/hooks/useAuth.test.ts` |
| useCards | `frontend/src/hooks/useCards.test.ts` |
| useTransactions | `frontend/src/hooks/useTransactions.test.ts` |
| useInstallments | `frontend/src/hooks/useInstallments.test.ts` |
| useFixedCosts | `frontend/src/hooks/useFixedCosts.test.ts` |

### 1.4 Frontend Component Tests
| Component | File to Create |
|-----------|----------------|
| Modal | `frontend/src/components/common/Modal.test.tsx` |
| ConfirmDialog | `frontend/src/components/common/ConfirmDialog.test.tsx` |
| MonthSelector | `frontend/src/components/MonthSelector.test.tsx` |
| CategoryBadge | `frontend/src/components/CategoryBadge.test.tsx` |

---

## Phase 2: UX Improvements

### 2.1 Checkbox Size
**Problem**: `h-4 w-4` (16px) too small
**Solution**: Increase to `h-5 w-5` (20px)

**Files to modify**:
- `frontend/src/pages/TransactionFormPage.tsx`
- `frontend/src/pages/CardFormPage.tsx`
- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/pages/FixedCostsPage.tsx`
- `frontend/src/pages/InstallmentsPage.tsx`

### 2.2 Dropdown Height
**Problem**: Select elements appear shorter than text inputs
**Solution**: Add explicit styling to match input-field height

**Files to modify**:
- `frontend/src/index.css` - add select-specific styling or verify `.input-field` works

### 2.3 Settings Page Layout
**Problem**: Categories list causes excessive scrolling
**Solution**: Add collapsible sections

**File to modify**: `frontend/src/pages/SettingsPage.tsx`

**Implementation**:
- Wrap each section (Profile, Household, Categories) in collapsible panels
- Categories section collapsed by default when many items
- Or: Add tabs for Profile/Household vs Categories

---

## Phase 3: Savings/Reserve Feature (NEW)

### Concept
Track **savings pools** that accumulate over time:
- Set monthly target contribution
- Some months deposit, some months skip
- Track accumulated balance
- Withdraw when funds are used

### Examples
| Reserve | Target/Month | Purpose |
|---------|-------------|---------|
| Facility Fees | ฿500 | Condo maintenance fund |
| Emergency Fund | ฿2,000 | Rainy day savings |
| Car Maintenance | ฿1,000 | Repairs/insurance reserve |

### Data Model
```prisma
model SavingsReserve {
  id             String   @id @default(cuid())
  householdId    String
  name           String
  description    String?
  targetAmount   Decimal  @db.Decimal(12, 2)  // Monthly target
  currentBalance Decimal  @db.Decimal(12, 2) @default(0)
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  household      Household @relation(fields: [householdId], references: [id])
  transactions   SavingsTransaction[]

  @@index([householdId])
}

model SavingsTransaction {
  id         String   @id @default(cuid())
  reserveId  String
  type       String   // "deposit" | "withdrawal"
  amount     Decimal  @db.Decimal(12, 2)
  month      DateTime // Which month this applies to (YYYY-MM-01)
  note       String?
  createdBy  String
  createdAt  DateTime @default(now())

  reserve    SavingsReserve @relation(fields: [reserveId], references: [id], onDelete: Cascade)
  user       User @relation(fields: [createdBy], references: [id])

  @@index([reserveId])
  @@index([month])
}
```

### Backend Files to Create
| Type | File |
|------|------|
| Service | `backend/src/services/savings.service.ts` |
| Test | `backend/src/services/savings.service.test.ts` |
| Routes | `backend/src/routes/savings.routes.ts` |
| Types | Add to `backend/src/types/schemas.ts` |

### API Endpoints
```
GET    /api/savings              - List all reserves
POST   /api/savings              - Create reserve
GET    /api/savings/:id          - Get reserve with transactions
PUT    /api/savings/:id          - Update reserve
DELETE /api/savings/:id          - Delete reserve

POST   /api/savings/:id/deposit  - Record deposit
POST   /api/savings/:id/withdraw - Record withdrawal
GET    /api/savings/:id/history  - Transaction history

GET    /api/savings/monthly-summary?month=YYYY-MM - Monthly overview
```

### Frontend Files to Create
| Type | File |
|------|------|
| Page | `frontend/src/pages/SavingsPage.tsx` |
| Hook | `frontend/src/hooks/useSavings.ts` |
| Hook Test | `frontend/src/hooks/useSavings.test.ts` |
| Types | Add to `frontend/src/types/index.ts` |

### UI Features
1. **List View**: All reserves with current balance, target, progress bar
2. **Monthly View**: Which reserves were funded this month
3. **Quick Actions**: "Deposit" and "Withdraw" buttons per reserve
4. **History**: Transaction log per reserve
5. **Dashboard Integration**: Show total savings in monthly summary

---

## Implementation Order

1. **Phase 1**: TDD Foundation
   - Create Playwright config
   - Add backend service tests (tags → analytics)
   - Add frontend hook tests
   - Add component tests

2. **Phase 2**: UX Improvements (with tests)
   - Fix checkbox size
   - Fix dropdown height
   - Improve Settings page layout

3. **Phase 3**: Savings Feature (TDD)
   - Write tests first
   - Implement backend (model → service → routes)
   - Implement frontend (types → hooks → pages)
   - Add to navigation

---

## Verification

### Phase 1
```bash
cd backend && npm run test:coverage   # Should show coverage report
cd frontend && npm run test:coverage  # Should show coverage report
cd frontend && npm run test:e2e       # Should run Playwright
```

### Phase 2
- Visual check: checkboxes larger, dropdowns aligned
- Settings page: sections collapsible, less scrolling

### Phase 3
- Create a savings reserve
- Record deposits for multiple months
- Record a withdrawal
- Verify balance updates correctly
- Check monthly summary includes savings
