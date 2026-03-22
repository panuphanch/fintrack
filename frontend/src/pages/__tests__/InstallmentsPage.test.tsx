import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, type Mock } from 'vitest';
import InstallmentsPage from '../InstallmentsPage';
import * as installmentsHooks from '../../hooks/useInstallments';
import * as cardsHooks from '../../hooks/useCards';
import * as categoriesHooks from '../../hooks/useCategories';
import type { Installment, Category, CreditCard } from '../../types';

vi.mock('../../hooks/useInstallments');
vi.mock('../../hooks/useCards');
vi.mock('../../hooks/useCategories');

const mockCategory: Category = {
  id: 'cat1', householdId: 'h1', name: 'GADGET', label: 'Gadget',
  color: '#3b82f6', icon: 'device-mobile', sortOrder: 3, isSystem: true,
  createdAt: '', updatedAt: '',
};

const othersCategory: Category = {
  id: 'cat-others', householdId: 'h1', name: 'OTHERS', label: 'Others',
  color: '#6b7280', icon: 'dots-horizontal', sortOrder: 11, isSystem: true,
  createdAt: '', updatedAt: '',
};

const mockCard: CreditCard = {
  id: 'c1', householdId: 'h1', name: 'TTB Reserve', bank: 'TTB', lastFour: '1234',
  color: '#3b82f6', cutoffDay: 25, dueDay: 10, creditLimit: 100000, ownerId: 'u1',
  isActive: true, createdAt: '',
};

function makeInstallment(overrides: Partial<Installment> = {}): Installment {
  return {
    id: 'inst-1', householdId: 'h1', cardId: 'c1',
    card: { id: 'c1', name: 'TTB Reserve', bank: 'TTB', color: '#3b82f6' },
    name: 'iPhone 15 Pro', totalAmount: 45000, monthlyAmount: 4500,
    currentInstallment: 5, totalInstallments: 10, categoryId: 'cat1',
    category: mockCategory, startDate: '2026-01-15', notes: null,
    isActive: true, createdById: 'u1', createdAt: '', updatedAt: '',
    ...overrides,
  };
}

function setupMocks(opts: {
  installments?: Installment[];
  isLoading?: boolean;
  error?: Error | null;
  monthlyTotal?: number;
} = {}) {
  const { installments = [], isLoading = false, error = null, monthlyTotal = 0 } = opts;

  (installmentsHooks.useInstallments as Mock).mockReturnValue({
    data: isLoading ? undefined : installments,
    isLoading,
    error,
    refetch: vi.fn(),
  });

  (installmentsHooks.useCreateInstallment as Mock).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  });

  (installmentsHooks.useUpdateInstallment as Mock).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  });

  (installmentsHooks.useIncrementInstallment as Mock).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  });

  (installmentsHooks.useDeleteInstallment as Mock).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  });

  (installmentsHooks.useInstallmentsMonthlyTotal as Mock).mockReturnValue({
    data: { total: monthlyTotal },
  });

  (cardsHooks.useCards as Mock).mockReturnValue({
    data: [mockCard],
  });

  (categoriesHooks.useCategories as Mock).mockReturnValue({
    data: [mockCategory, othersCategory],
  });
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <InstallmentsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('InstallmentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('loading state', () => {
    it('renders skeleton when loading', () => {
      setupMocks({ isLoading: true });
      renderPage();
      expect(screen.getByTestId('installment-skeleton')).toBeInTheDocument();
    });

    it('renders page heading even when loading', () => {
      setupMocks({ isLoading: true });
      renderPage();
      expect(screen.getByRole('heading', { name: 'Installments', level: 1 })).toBeInTheDocument();
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
    it('shows empty state when no installments', () => {
      setupMocks({ installments: [] });
      renderPage();
      expect(screen.getByText('No installments yet')).toBeInTheDocument();
    });

    it('shows Add Installment CTA in empty state', () => {
      setupMocks({ installments: [] });
      renderPage();
      const buttons = screen.getAllByText('Add Installment');
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('populated state', () => {
    it('renders page heading', () => {
      setupMocks({ installments: [makeInstallment()] });
      renderPage();
      expect(screen.getByRole('heading', { name: 'Installments', level: 1 })).toBeInTheDocument();
    });

    it('renders Add Installment button', () => {
      setupMocks({ installments: [makeInstallment()] });
      renderPage();
      expect(screen.getByRole('button', { name: 'Add Installment' })).toBeInTheDocument();
    });

    it('renders summary bar with monthly total', () => {
      setupMocks({ installments: [makeInstallment()], monthlyTotal: 4500 });
      renderPage();
      expect(screen.getByText('Monthly Total')).toBeInTheDocument();
      // Monthly total appears in summary bar (gold-400), subtotal, and row — use getAllByText
      const amounts = screen.getAllByText('฿4,500.00');
      expect(amounts.length).toBeGreaterThanOrEqual(1);
      // The summary bar value has gold-400 color
      const goldAmount = amounts.find(el => el.className.includes('text-gold-400'));
      expect(goldAmount).toBeTruthy();
    });

    it('renders card group with card name', () => {
      setupMocks({ installments: [makeInstallment()] });
      renderPage();
      expect(screen.getByText('TTB Reserve')).toBeInTheDocument();
    });

    it('renders installment name', () => {
      setupMocks({ installments: [makeInstallment({ name: 'iPad Pro' })] });
      renderPage();
      expect(screen.getByText('iPad Pro')).toBeInTheDocument();
    });

    it('renders summary stats counts', () => {
      const installments = [
        makeInstallment({ id: 'i1', isActive: true, currentInstallment: 5, totalInstallments: 10 }),
        makeInstallment({ id: 'i2', isActive: false, currentInstallment: 10, totalInstallments: 10 }),
      ];
      setupMocks({ installments });
      renderPage();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  describe('show completed toggle', () => {
    it('renders show completed toggle', () => {
      setupMocks({ installments: [makeInstallment()] });
      renderPage();
      expect(screen.getByRole('switch')).toBeInTheDocument();
      expect(screen.getByText('Show completed')).toBeInTheDocument();
    });

    it('calls useInstallments with activeOnly=true by default', () => {
      setupMocks({ installments: [] });
      renderPage();
      expect(installmentsHooks.useInstallments).toHaveBeenCalledWith(true);
    });

    it('toggles to show completed on click', () => {
      setupMocks({ installments: [] });
      renderPage();
      fireEvent.click(screen.getByRole('switch'));
      expect(installmentsHooks.useInstallments).toHaveBeenCalledWith(false);
    });
  });

  describe('create flow', () => {
    it('opens modal when Add Installment clicked', () => {
      setupMocks({ installments: [] });
      renderPage();
      // Use the header button (btn-primary class)
      const headerBtn = document.querySelector('button.btn-primary') as HTMLElement;
      fireEvent.click(headerBtn);
      // Modal should appear with form fields
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
    });
  });

  describe('increment flow', () => {
    it('calls increment mutation when +1 clicked', async () => {
      const mockIncrement = vi.fn().mockResolvedValue(undefined);
      setupMocks({ installments: [makeInstallment()] });
      (installmentsHooks.useIncrementInstallment as Mock).mockReturnValue({
        mutateAsync: mockIncrement,
        isPending: false,
      });

      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Mark next payment' }));

      await waitFor(() => {
        expect(mockIncrement).toHaveBeenCalledWith('inst-1');
      });
    });
  });

  describe('delete flow', () => {
    it('shows confirm dialog when delete clicked', () => {
      setupMocks({ installments: [makeInstallment()] });
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
      expect(screen.getByText('Delete Installment')).toBeInTheDocument();
    });

    it('calls delete mutation on confirm', async () => {
      const mockDelete = vi.fn().mockResolvedValue(undefined);
      setupMocks({ installments: [makeInstallment()] });
      (installmentsHooks.useDeleteInstallment as Mock).mockReturnValue({
        mutateAsync: mockDelete,
        isPending: false,
      });

      renderPage();
      // Click delete button on the row
      fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
      // Click the confirm button in the dialog (btn-danger class)
      const confirmBtn = document.querySelector('button.btn-danger') as HTMLElement;
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith('inst-1');
      });
    });
  });
});
