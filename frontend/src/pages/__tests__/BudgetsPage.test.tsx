import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, type Mock } from 'vitest';
import BudgetsPage from '../BudgetsPage';
import * as budgetsHooks from '../../hooks/useBudgets';
import type { CategoryBudgetRow } from '../../types';

// Mock the hooks
vi.mock('../../hooks/useBudgets');

const makeCategory = (overrides: Partial<CategoryBudgetRow['category']> = {}) => ({
  id: 'cat-1',
  householdId: 'h1',
  name: 'HOME',
  label: 'Home',
  color: '#3b82f6',
  icon: 'home',
  sortOrder: 0,
  isSystem: true,
  createdAt: '',
  updatedAt: '',
  ...overrides,
});

const makeBudgetedRow = (overrides: Partial<CategoryBudgetRow> = {}): CategoryBudgetRow => ({
  category: makeCategory(),
  budget: { id: 'b1', monthlyLimit: 10000 },
  spent: 3000,
  ...overrides,
});

const makeUnbudgetedRow = (overrides: Partial<CategoryBudgetRow> = {}): CategoryBudgetRow => ({
  category: makeCategory({ id: 'cat-2', name: 'TRAVEL', label: 'Travel', color: '#14b8a6', sortOrder: 8 }),
  budget: null,
  spent: 500,
  ...overrides,
});

function renderPage(overviewData: CategoryBudgetRow[] | undefined = [], isLoading = false, error: Error | null = null) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  (budgetsHooks.useBudgetOverview as Mock).mockReturnValue({
    data: overviewData,
    isLoading,
    error,
    refetch: vi.fn(),
  });
  (budgetsHooks.useCreateBudget as Mock).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  });
  (budgetsHooks.useUpdateBudget as Mock).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  });
  (budgetsHooks.useDeleteBudget as Mock).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <BudgetsPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('BudgetsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window.localStorage.getItem as Mock).mockReturnValue(null);
  });

  describe('loading state', () => {
    it('should render loading spinner', () => {
      renderPage(undefined, true);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should render error message with retry', () => {
      renderPage(undefined, false, new Error('Network fail'));
      expect(screen.getByText(/Network fail/)).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should show empty message when no categories', () => {
      renderPage([]);
      expect(screen.getByText(/No categories/i)).toBeInTheDocument();
    });
  });

  describe('budgeted rows', () => {
    it('should render budgeted categories with progress bars', () => {
      const rows = [makeBudgetedRow()];
      renderPage(rows);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should show green bar for under 50% usage', () => {
      const rows = [makeBudgetedRow({ spent: 3000 })]; // 30%
      const { container } = renderPage(rows);

      const fill = container.querySelector('[role="progressbar"] > div');
      expect(fill?.className).toMatch(/emerald|profit/);
    });

    it('should show amber bar for 50-80% usage', () => {
      const rows = [makeBudgetedRow({ spent: 7000 })]; // 70%
      const { container } = renderPage(rows);

      const fill = container.querySelector('[role="progressbar"] > div');
      expect(fill?.className).toMatch(/amber|warning/);
    });

    it('should show red bar for over 80% usage', () => {
      const rows = [makeBudgetedRow({ spent: 9000 })]; // 90%
      const { container } = renderPage(rows);

      const fill = container.querySelector('[role="progressbar"] > div');
      expect(fill?.className).toMatch(/red|danger/);
    });

    it('should show edit button on budgeted rows', () => {
      renderPage([makeBudgetedRow()]);
      expect(screen.getByLabelText('Edit budget')).toBeInTheDocument();
    });
  });

  describe('unbudgeted rows', () => {
    it('should render unbudgeted categories with "no limit" label', () => {
      renderPage([makeUnbudgetedRow()]);
      expect(screen.getByText('Travel')).toBeInTheDocument();
      expect(screen.getByText(/no limit/i)).toBeInTheDocument();
    });

    it('should show "Set Budget" button on unbudgeted rows', () => {
      renderPage([makeUnbudgetedRow()]);
      expect(screen.getByText(/Set Budget/)).toBeInTheDocument();
    });
  });

  describe('show unbudgeted toggle', () => {
    it('should show checkbox to toggle unbudgeted categories', () => {
      renderPage([makeBudgetedRow(), makeUnbudgetedRow()]);
      expect(screen.getByLabelText(/show unbudgeted/i)).toBeInTheDocument();
    });

    it('should hide unbudgeted categories when unchecked', async () => {
      renderPage([makeBudgetedRow(), makeUnbudgetedRow()]);

      const checkbox = screen.getByLabelText(/show unbudgeted/i);
      // Default is checked (show unbudgeted)
      expect(screen.getByText('Travel')).toBeInTheDocument();

      fireEvent.click(checkbox);
      await waitFor(() => {
        expect(screen.queryByText('Travel')).not.toBeInTheDocument();
      });
    });
  });

  describe('interactions', () => {
    it('should open modal when clicking "Set Budget"', async () => {
      renderPage([makeUnbudgetedRow()]);

      fireEvent.click(screen.getByText(/Set Budget/));
      await waitFor(() => {
        expect(screen.getByLabelText(/Monthly Limit/i)).toBeInTheDocument();
      });
    });

    it('should open modal when clicking edit button', async () => {
      renderPage([makeBudgetedRow()]);

      fireEvent.click(screen.getByLabelText('Edit budget'));
      await waitFor(() => {
        expect(screen.getByLabelText(/Monthly Limit/i)).toBeInTheDocument();
      });
    });
  });
});
