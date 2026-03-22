import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, type Mock } from 'vitest';
import CardsPage from '../CardsPage';
import * as cardsHooks from '../../hooks/useCards';
import type { CreditCard } from '../../types';

vi.mock('../../hooks/useCards');

const makeCard = (overrides: Partial<CreditCard> = {}): CreditCard => ({
  id: 'c1',
  householdId: 'h1',
  name: 'TTB Visa',
  bank: 'TTB',
  lastFour: '1234',
  color: '#3b82f6',
  cutoffDay: 25,
  dueDay: 10,
  creditLimit: 100000,
  ownerId: 'u1',
  owner: { id: 'u1', name: 'Meee', email: 'me@example.com', householdId: 'h1', createdAt: '' },
  isActive: true,
  createdAt: '',
  ...overrides,
});

function renderPage(
  cardsData: CreditCard[] | undefined = [],
  isLoading = false,
  error: Error | null = null,
  deleteCardOverride?: { mutateAsync: ReturnType<typeof vi.fn>; isPending: boolean },
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  (cardsHooks.useCards as Mock).mockReturnValue({
    data: cardsData,
    isLoading,
    error,
    refetch: vi.fn(),
  });
  (cardsHooks.useDeleteCard as Mock).mockReturnValue(
    deleteCardOverride ?? { mutateAsync: vi.fn(), isPending: false },
  );

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <CardsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('CardsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('renders skeleton loading cards', () => {
      renderPage(undefined, true);
      expect(screen.getAllByTestId('card-skeleton').length).toBeGreaterThan(0);
    });
  });

  describe('error state', () => {
    it('renders error message with retry', () => {
      renderPage(undefined, false, new Error('Network error'));
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty state when no cards', () => {
      renderPage([]);
      expect(screen.getByText('No credit cards')).toBeInTheDocument();
      expect(screen.getByText(/Get started/)).toBeInTheDocument();
    });

    it('shows Add Card CTA in empty state', () => {
      renderPage([]);
      const addLinks = screen.getAllByText('Add Card');
      expect(addLinks.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('populated state', () => {
    it('renders page title', () => {
      renderPage([makeCard()]);
      expect(screen.getByText('Credit Cards')).toBeInTheDocument();
    });

    it('renders Add Card button in header', () => {
      renderPage([makeCard()]);
      expect(screen.getByText('Add Card')).toBeInTheDocument();
    });

    it('renders card stats summary', () => {
      renderPage([makeCard(), makeCard({ id: 'c2', name: 'Card 2', creditLimit: 50000 })]);
      expect(screen.getByText('Active Cards')).toBeInTheDocument();
      expect(screen.getByText('Total Credit Limit')).toBeInTheDocument();
    });

    it('renders active cards', () => {
      renderPage([makeCard({ name: 'My Gold Card' })]);
      expect(screen.getByText('My Gold Card')).toBeInTheDocument();
    });

    it('renders credit card as article with aria-label', () => {
      renderPage([makeCard({ name: 'My Card' })]);
      expect(screen.getByRole('article', { name: 'My Card credit card' })).toBeInTheDocument();
    });
  });

  describe('active/inactive separation', () => {
    it('renders inactive cards in separate section', () => {
      renderPage([
        makeCard({ name: 'Active Card', isActive: true }),
        makeCard({ id: 'c2', name: 'Old Card', isActive: false }),
      ]);
      expect(screen.getByText('Active Card')).toBeInTheDocument();
      expect(screen.getByText('Old Card')).toBeInTheDocument();
    });

    it('shows inactive section heading with count', () => {
      renderPage([
        makeCard({ isActive: true }),
        makeCard({ id: 'c2', isActive: false }),
        makeCard({ id: 'c3', isActive: false }),
      ]);
      expect(screen.getByText(/Inactive Cards \(2\)/)).toBeInTheDocument();
    });

    it('does not show inactive section when no inactive cards', () => {
      renderPage([makeCard({ isActive: true })]);
      expect(screen.queryByText(/Inactive Cards/)).not.toBeInTheDocument();
    });
  });

  describe('delete flow', () => {
    it('opens confirm dialog when delete clicked', () => {
      renderPage([makeCard({ name: 'Card To Delete' })]);
      fireEvent.click(screen.getByLabelText('Delete card'));
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
      expect(screen.getByText(/\u201CCard To Delete\u201D/)).toBeInTheDocument();
    });

    it('calls deleteCard on confirm', async () => {
      const mutateAsync = vi.fn().mockResolvedValue(undefined);

      renderPage([makeCard()], false, null, { mutateAsync, isPending: false });
      fireEvent.click(screen.getByLabelText('Delete card'));

      // The confirm dialog should now be visible
      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mutateAsync).toHaveBeenCalledWith('c1');
      });
    });
  });
});
