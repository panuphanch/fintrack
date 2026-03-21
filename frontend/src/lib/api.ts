import type { ApiResponse } from '../types';

const API_BASE_URL = '/api';

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    ...options.headers,
  };

  // Only set Content-Type for requests with a body
  if (options.body) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      // Don't redirect here - let React Router handle it via useAuth
    }
    throw new ApiError(response.status, data.error || 'An error occurred');
  }

  return data.data as T;
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    fetchApi<{ user: import('../types').User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: import('../types').RegisterInput) =>
    fetchApi<{ user: import('../types').User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => fetchApi<import('../types').User>('/auth/me'),

  logout: () =>
    fetchApi<void>('/auth/logout', {
      method: 'POST',
    }),

  invite: (email: string) =>
    fetchApi<import('../types').Invitation>('/auth/invite', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  acceptInvite: (data: import('../types').AcceptInviteInput) =>
    fetchApi<{ user: import('../types').User; token: string }>('/auth/accept-invite', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getInvite: (token: string) =>
    fetchApi<{ email: string; householdName: string }>(`/auth/invite/${token}`),
};

// Cards API
export const cardsApi = {
  list: () => fetchApi<import('../types').CreditCard[]>('/cards'),

  get: (id: string) => fetchApi<import('../types').CreditCard>(`/cards/${id}`),

  create: (data: import('../types').CreateCardInput) =>
    fetchApi<import('../types').CreditCard>('/cards', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: import('../types').UpdateCardInput) =>
    fetchApi<import('../types').CreditCard>(`/cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/cards/${id}`, {
      method: 'DELETE',
    }),

  getCurrentStatement: (id: string) =>
    fetchApi<{
      transactions: import('../types').Transaction[];
      totalAmount: number;
      periodStart: string;
      periodEnd: string;
    }>(`/cards/${id}/current-statement`),

  markPaid: (id: string, paymentMonth: string) =>
    fetchApi<import('../types').Statement>(`/cards/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify({ paymentMonth }),
    }),
};

// Categories API
export const categoriesApi = {
  list: () => fetchApi<import('../types').Category[]>('/categories'),

  get: (id: string) => fetchApi<import('../types').Category>(`/categories/${id}`),

  create: (data: import('../types').CreateCategoryInput) =>
    fetchApi<import('../types').Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: import('../types').UpdateCategoryInput) =>
    fetchApi<import('../types').Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/categories/${id}`, {
      method: 'DELETE',
    }),

  reorder: (items: import('../types').ReorderCategoryInput[]) =>
    fetchApi<import('../types').Category[]>('/categories/reorder', {
      method: 'POST',
      body: JSON.stringify(items),
    }),
};

// Transactions API
export const transactionsApi = {
  list: (filters?: import('../types').TransactionFilters) => {
    const params = new URLSearchParams();
    if (filters?.cardId) params.append('cardId', filters.cardId);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.tagIds?.length) params.append('tagIds', filters.tagIds.join(','));
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString();
    return fetchApi<import('../types').Transaction[]>(`/transactions${query ? `?${query}` : ''}`);
  },

  get: (id: string) => fetchApi<import('../types').Transaction>(`/transactions/${id}`),

  create: (data: import('../types').CreateTransactionInput) =>
    fetchApi<import('../types').Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: import('../types').UpdateTransactionInput) =>
    fetchApi<import('../types').Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/transactions/${id}`, {
      method: 'DELETE',
    }),
};

// Tags API
export const tagsApi = {
  list: () => fetchApi<import('../types').Tag[]>('/tags'),

  create: (data: import('../types').CreateTagInput) =>
    fetchApi<import('../types').Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/tags/${id}`, {
      method: 'DELETE',
    }),
};

// Budgets API
export const budgetsApi = {
  list: () => fetchApi<import('../types').Budget[]>('/budgets'),

  create: (data: import('../types').CreateBudgetInput) =>
    fetchApi<import('../types').Budget>('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: import('../types').UpdateBudgetInput) =>
    fetchApi<import('../types').Budget>(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/budgets/${id}`, {
      method: 'DELETE',
    }),
};

// Statements API
export const statementsApi = {
  list: (cardId?: string) => {
    const query = cardId ? `?cardId=${cardId}` : '';
    return fetchApi<import('../types').Statement[]>(`/statements${query}`);
  },

  markPaid: (id: string) =>
    fetchApi<import('../types').Statement>(`/statements/${id}/mark-paid`, {
      method: 'PUT',
    }),
};

// Analytics API
export const analyticsApi = {
  monthlySummary: (month: string) =>
    fetchApi<import('../types').MonthlySummary>(`/analytics/monthly-summary?month=${month}`),

  byCategory: (month: string) =>
    fetchApi<import('../types').CategorySummary[]>(`/analytics/by-category?month=${month}`),

  byCard: (month: string) =>
    fetchApi<import('../types').CardSummary[]>(`/analytics/by-card?month=${month}`),

  billingCycleSummary: (paymentMonth: string) =>
    fetchApi<import('../types').BillingCycleSummary>(`/analytics/billing-cycle-summary?paymentMonth=${paymentMonth}`),
};

// Uploads API
export const uploadsApi = {
  uploadReceipt: async (file: File): Promise<{ url: string }> => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('receipt', file);

    const response = await fetch(`${API_BASE_URL}/uploads/receipt`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data: ApiResponse<{ url: string }> = await response.json();

    if (!response.ok || !data.success) {
      throw new ApiError(response.status, data.error || 'Upload failed');
    }

    return data.data as { url: string };
  },

  scanReceipt: async (
    file: File,
    provider?: 'google' | 'tesseract'
  ): Promise<{ amount?: number; merchant?: string; date?: string }> => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('receipt', file);
    if (provider) formData.append('provider', provider);

    const response = await fetch(`${API_BASE_URL}/transactions/scan-receipt`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data: ApiResponse<{ amount?: number; merchant?: string; date?: string }> =
      await response.json();

    if (!response.ok || !data.success) {
      throw new ApiError(response.status, data.error || 'Scan failed');
    }

    return data.data as { amount?: number; merchant?: string; date?: string };
  },
};

// Household API
export const householdApi = {
  getMembers: () => fetchApi<import('../types').User[]>('/household/members'),
};

// Installments API
export const installmentsApi = {
  list: (activeOnly = true) =>
    fetchApi<import('../types').Installment[]>(`/installments?activeOnly=${activeOnly}`),

  get: (id: string) => fetchApi<import('../types').Installment>(`/installments/${id}`),

  create: (data: import('../types').CreateInstallmentInput) =>
    fetchApi<import('../types').Installment>('/installments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: import('../types').UpdateInstallmentInput) =>
    fetchApi<import('../types').Installment>(`/installments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  increment: (id: string) =>
    fetchApi<import('../types').Installment>(`/installments/${id}/increment`, {
      method: 'POST',
    }),

  delete: (id: string) =>
    fetchApi<void>(`/installments/${id}`, {
      method: 'DELETE',
    }),

  getMonthlyTotal: () =>
    fetchApi<{ total: number }>('/installments/monthly-total'),
};

// Fixed Costs API
export const fixedCostsApi = {
  list: (activeOnly = true) =>
    fetchApi<import('../types').FixedCost[]>(`/fixed-costs?activeOnly=${activeOnly}`),

  get: (id: string) => fetchApi<import('../types').FixedCost>(`/fixed-costs/${id}`),

  create: (data: import('../types').CreateFixedCostInput) =>
    fetchApi<import('../types').FixedCost>('/fixed-costs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: import('../types').UpdateFixedCostInput) =>
    fetchApi<import('../types').FixedCost>(`/fixed-costs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/fixed-costs/${id}`, {
      method: 'DELETE',
    }),

  getMonthlyTotal: () =>
    fetchApi<{ total: number }>('/fixed-costs/monthly-total'),
};

export { ApiError };
