import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  householdName: z.string().min(1, 'Household name is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Card schemas
export const createCardSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bank: z.string().min(1, 'Bank is required'),
  lastFour: z.string().length(4, 'Last four digits must be 4 characters'),
  color: z.string().min(1, 'Color is required'),
  cutoffDay: z.number().int().min(1).max(31),
  dueDay: z.number().int().min(1).max(31),
  creditLimit: z.number().min(0),
  ownerId: z.string().optional(),
});

export const updateCardSchema = z.object({
  name: z.string().min(1).optional(),
  bank: z.string().min(1).optional(),
  lastFour: z.string().length(4).optional(),
  color: z.string().min(1).optional(),
  cutoffDay: z.number().int().min(1).max(31).optional(),
  dueDay: z.number().int().min(1).max(31).optional(),
  creditLimit: z.number().min(0).optional(),
  ownerId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

// Transaction schemas
export const createTransactionSchema = z.object({
  cardId: z.string().min(1, 'Card is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  merchant: z.string().min(1, 'Merchant is required'),
  categoryId: z.string().min(1, 'Category is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  notes: z.string().optional(),
  receiptUrl: z.string().url().optional().nullable().or(z.literal('')),
  isRecurring: z.boolean().optional(),
  tagIds: z.array(z.string()).optional(),
});

export const updateTransactionSchema = z.object({
  cardId: z.string().min(1).optional(),
  amount: z.number().min(0).optional(),
  merchant: z.string().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().optional().nullable(),
  receiptUrl: z.string().url().optional().nullable().or(z.literal('')),
  isRecurring: z.boolean().optional(),
  tagIds: z.array(z.string()).optional(),
});

export const transactionFiltersSchema = z.object({
  cardId: z.string().optional(),
  categoryId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  tagIds: z.string().optional(), // comma-separated
  search: z.string().optional(),
});

// Tag schemas
export const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50),
});

// Budget schemas
export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  monthlyLimit: z.number().min(0),
});

export const updateBudgetSchema = z.object({
  monthlyLimit: z.number().min(0),
});

// Analytics schemas
export const monthQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
});

export const paymentMonthQuerySchema = z.object({
  paymentMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Payment month must be in YYYY-MM format'),
});

export const markCardPaidSchema = z.object({
  paymentMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Payment month must be in YYYY-MM format'),
});

export const trendQuerySchema = z.object({
  months: z.coerce.number().int().min(2).max(12).default(6),
});
