// Category - now fetched from API
export interface Category {
  id: string;
  householdId: string;
  name: string;
  label: string;
  color: string;
  icon: string | null;
  sortOrder: number;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  label: string;
  color: string;
  icon?: string;
  sortOrder?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  label?: string;
  color?: string;
  icon?: string | null;
  sortOrder?: number;
}

export interface ReorderCategoryInput {
  id: string;
  sortOrder: number;
}

// User
export interface User {
  id: string;
  email: string;
  name: string;
  householdId: string;
  createdAt: string;
}

// Household
export interface Household {
  id: string;
  name: string;
  createdAt: string;
}

// Credit Card
export interface CreditCard {
  id: string;
  householdId: string;
  name: string;
  bank: string;
  lastFour: string;
  color: string;
  cutoffDay: number;
  dueDay: number;
  creditLimit: number;
  ownerId: string | null;
  owner?: User;
  isActive: boolean;
  createdAt: string;
}

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

export interface UpdateCardInput extends Partial<CreateCardInput> {
  isActive?: boolean;
}

// Transaction
export interface Transaction {
  id: string;
  householdId: string;
  cardId: string;
  card?: CreditCard;
  amount: number;
  merchant: string;
  categoryId: string;
  category: Category;
  date: string;
  notes: string | null;
  receiptUrl: string | null;
  isRecurring: boolean;
  createdById: string;
  createdBy?: User;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionInput {
  cardId: string;
  amount: number;
  merchant: string;
  categoryId: string;
  date: string;
  notes?: string;
  receiptUrl?: string;
  isRecurring?: boolean;
  tagIds?: string[];
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {}

export interface TransactionFilters {
  cardId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  tagIds?: string[];
  search?: string;
}

// Tag
export interface Tag {
  id: string;
  householdId: string;
  name: string;
}

export interface CreateTagInput {
  name: string;
}

// Budget
export interface Budget {
  id: string;
  householdId: string;
  categoryId: string;
  category: Category;
  monthlyLimit: number;
  spent?: number;
  createdAt: string;
}

export interface CreateBudgetInput {
  categoryId: string;
  monthlyLimit: number;
}

export interface UpdateBudgetInput {
  monthlyLimit: number;
}

export interface CategoryBudgetRow {
  category: Category;
  budget: { id: string; monthlyLimit: number } | null;
  spent: number;
}

// Statement
export interface Statement {
  id: string;
  cardId: string;
  card?: CreditCard;
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  isPaid: boolean;
  paidAt: string | null;
  createdAt: string;
}

// Installment
export interface Installment {
  id: string;
  householdId: string;
  cardId: string | null;
  card?: {
    id: string;
    name: string;
    bank: string;
    color: string;
  };
  name: string;
  totalAmount: number;
  monthlyAmount: number;
  currentInstallment: number;
  totalInstallments: number;
  categoryId: string;
  category: Category;
  startDate: string;
  notes: string | null;
  isActive: boolean;
  createdById: string;
  createdBy?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstallmentInput {
  cardId?: string;
  name: string;
  totalAmount: number;
  monthlyAmount: number;
  currentInstallment?: number;
  totalInstallments: number;
  categoryId: string;
  startDate: string;
  notes?: string;
}

export interface UpdateInstallmentInput extends Partial<CreateInstallmentInput> {
  isActive?: boolean;
}

// Fixed Cost
export interface FixedCost {
  id: string;
  householdId: string;
  name: string;
  amount: number;
  categoryId: string;
  category: Category;
  dueDay: number | null;
  isActive: boolean;
  notes: string | null;
  createdById: string;
  createdBy?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateFixedCostInput {
  name: string;
  amount: number;
  categoryId: string;
  dueDay?: number;
  notes?: string;
}

export interface UpdateFixedCostInput extends Partial<CreateFixedCostInput> {
  isActive?: boolean;
}

// Invitation
export interface Invitation {
  id: string;
  email: string;
  token: string;
  householdId: string;
  invitedById: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export interface CreateInvitationInput {
  email: string;
}

// Analytics
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

// Auth types
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  householdName: string;
}

export interface AcceptInviteInput {
  token: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Dashboard types
export type ViewMode = 'household' | 'personal';

export interface MonthlyTrend {
  month: string;
  transactions: number;
  installments: number;
  fixedCosts: number;
  total: number;
}
