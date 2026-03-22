// Category type (no longer using Prisma enum)
export interface Category {
  id: string;
  householdId: string;
  name: string;
  label: string;
  color: string;
  icon: string | null;
  sortOrder: number;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  householdId: string;
  email: string;
}

// Auth types
export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  householdName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AcceptInviteInput {
  token: string;
  name: string;
  password: string;
}

// Card types
export interface CreateCardInput {
  name: string;
  bank: string;
  lastFour: string;
  color: string;
  cutoffDay: number;
  dueDay: number;
  creditLimit: number;
  ownerId?: string;
}

export interface UpdateCardInput {
  name?: string;
  bank?: string;
  lastFour?: string;
  color?: string;
  cutoffDay?: number;
  dueDay?: number;
  creditLimit?: number;
  ownerId?: string | null;
  isActive?: boolean;
}

// Transaction types
export interface CreateTransactionInput {
  cardId: string;
  amount: number;
  merchant: string;
  categoryId: string;
  date: string;
  notes?: string;
  receiptUrl?: string | null;
  isRecurring?: boolean;
  tagIds?: string[];
}

export interface UpdateTransactionInput {
  cardId?: string;
  amount?: number;
  merchant?: string;
  categoryId?: string;
  date?: string;
  notes?: string | null;
  receiptUrl?: string | null;
  isRecurring?: boolean;
  tagIds?: string[];
}

export interface TransactionFilters {
  cardId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  tagIds?: string[];
  search?: string;
}

// Tag types
export interface CreateTagInput {
  name: string;
}

// Budget types
export interface CreateBudgetInput {
  categoryId: string;
  monthlyLimit: number;
}

export interface UpdateBudgetInput {
  monthlyLimit: number;
}

// Analytics types
export interface MonthlySummary {
  month: string;
  totalSpent: number;
  transactionCount: number;
  byCategory: CategorySummary[];
  byCard: CardSummary[];
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  categoryLabel: string;
  categoryColor: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface CardSummary {
  cardId: string;
  cardName: string;
  amount: number;
  count: number;
  percentage: number;
}

// Billing Cycle types
export interface BillingCycleSummary {
  paymentMonth: string;         // "2026-04" (the selector value)
  paymentMonthDisplay: string;  // "April 2026"
  cards: CardBillingSummary[];
  totals: {
    transactions: number;
    installments: number;
    fixedCosts: number;
    grandTotal: number;
  };
  byCategory: CategorySummary[];
}

export interface CardBillingSummary {
  cardId: string;
  cardName: string;
  cardColor: string;
  cardBank: string;
  cardLastFour: string;
  ownerName: string | null;
  billingPeriod: {
    start: string;   // ISO date
    end: string;     // ISO date
  };
  dueDate: string;       // ISO date
  transactionAmount: number;
  installmentAmount: number;
  totalAmount: number;
  transactionCount: number;
  isPaid: boolean;
}

export interface MarkCardPaidInput {
  paymentMonth: string;  // "2026-04"
}

// Monthly trend for dashboard chart
export interface MonthlyTrend {
  month: string;
  transactions: number;
  installments: number;
  fixedCosts: number;
  total: number;
}
