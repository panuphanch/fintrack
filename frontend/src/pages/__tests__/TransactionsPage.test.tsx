import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, type Mock } from 'vitest';
import TransactionsPage from '../TransactionsPage';
import * as transactionsHooks from '../../hooks/useTransactions';
import * as cardsHooks from '../../hooks/useCards';
import * as categoriesHooks from '../../hooks/useCategories';
import type { Transaction, Category, CreditCard } from '../../types';

vi.mock('../../hooks/useTransactions');
vi.mock('../../hooks/useCards');
vi.mock('../../hooks/useCategories');

// Mock IntersectionObserver
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
vi.stubGlobal('IntersectionObserver', vi.fn(() => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
  unobserve: vi.fn(),
})));

const mockCategory: Category = {
  id: 'cat1', householdId: 'h1', name: 'FOOD_DINING', label: 'Food & Dining',
  color: '#d4a853', icon: null, sortOrder: 0, isSystem: true, createdAt: '', updatedAt: '',
};

const mockCard: CreditCard = {
  id: 'c1', householdId: 'h1', name: 'TTB Reserve', bank: 'TTB', lastFour: '1234',
  color: '#3b82f6', cutoffDay: 25, dueDay: 10, creditLimit: 100000, ownerId: 'u1',
  isActive: true, createdAt: '',
};

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 't1', householdId: 'h1', cardId: 'c1', card: mockCard,
    amount: 1450, merchant: 'Sushi Hiro', categoryId: 'cat1', category: mockCategory,
    date: new Date().toISOString(), notes: null, receiptUrl: null,
    isRecurring: false, createdById: 'u1', tags: [], createdAt: '', updatedAt: '',
    ...overrides,
  };
}

function setupMocks(opts: {
  transactions?: Transaction[];
  isLoading?: boolean;
  error?: Error | null;
} = {}) {
  const { transactions = [], isLoading = false, error = null } = opts;

  (transactionsHooks.useInfiniteTransactions as Mock).mockReturnValue({
    data: transactions.length > 0 ? {
      pages: [{ data: transactions, pagination: { total: transactions.length, limit: 20, offset: 0, hasMore: false } }],
    } : undefined,
    isLoading,
    error,
    refetch: vi.fn(),
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  });

  (transactionsHooks.useDeleteTransaction as Mock).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  });

  (cardsHooks.useCards as Mock).mockReturnValue({
    data: [mockCard],
  });

  (categoriesHooks.useCategories as Mock).mockReturnValue({
    data: [mockCategory],
  });
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <TransactionsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('TransactionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('renders skeleton when loading', () => {
      setupMocks({ isLoading: true });
      renderPage();
      expect(screen.getByTestId('transaction-skeleton')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('renders error message', () => {
      setupMocks({ error: new Error('Network error') });
      renderPage();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty state with CTA when no transactions and no filters', () => {
      setupMocks({ transactions: [] });
      renderPage();
      expect(screen.getByText('No transactions yet')).toBeInTheDocument();
      // The "Add Transaction" CTA in empty state is a link
      const links = screen.getAllByText('Add Transaction');
      expect(links.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('populated state', () => {
    it('renders page header with title', () => {
      setupMocks({ transactions: [makeTransaction()] });
      renderPage();
      expect(screen.getByRole('heading', { name: 'Transactions', level: 1 })).toBeInTheDocument();
    });

    it('renders summary stats bar', () => {
      setupMocks({ transactions: [makeTransaction({ amount: 1450 })] });
      renderPage();
      expect(screen.getByText('Total Spent')).toBeInTheDocument();
    });

    it('renders filter panel with search', () => {
      setupMocks({ transactions: [makeTransaction()] });
      renderPage();
      expect(screen.getByPlaceholderText('Search transactions…')).toBeInTheDocument();
    });

    it('renders transaction merchant name', () => {
      setupMocks({ transactions: [makeTransaction({ merchant: 'Sushi Hiro' })] });
      renderPage();
      expect(screen.getByText('Sushi Hiro')).toBeInTheDocument();
    });

    it('renders Add Transaction button in header', () => {
      setupMocks({ transactions: [makeTransaction()] });
      renderPage();
      const addBtn = screen.getByRole('link', { name: /add transaction/i });
      expect(addBtn).toBeInTheDocument();
    });
  });

  describe('delete flow', () => {
    it('shows confirm dialog when delete is clicked', () => {
      setupMocks({ transactions: [makeTransaction()] });
      renderPage();
      const deleteBtn = screen.getByLabelText('Delete');
      fireEvent.click(deleteBtn);
      expect(screen.getByText('Delete Transaction')).toBeInTheDocument();
    });

    it('calls deleteTransaction on confirm', async () => {
      const mockDelete = vi.fn().mockResolvedValue(undefined);
      setupMocks({ transactions: [makeTransaction()] });
      (transactionsHooks.useDeleteTransaction as Mock).mockReturnValue({
        mutateAsync: mockDelete,
        isPending: false,
      });

      renderPage();
      fireEvent.click(screen.getByLabelText('Delete'));
      fireEvent.click(screen.getByText('Delete', { selector: 'button' }));

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith('t1');
      });
    });
  });
});
