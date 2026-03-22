import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, beforeEach, afterEach } from 'vitest';
import TransactionFilterPanel from '../TransactionFilterPanel';
import type { TransactionFilters, CreditCard, Category } from '../../../types';

const mockCards: CreditCard[] = [
  {
    id: 'c1', householdId: 'h1', name: 'TTB Reserve', bank: 'TTB', lastFour: '1234',
    color: '#3b82f6', cutoffDay: 25, dueDay: 10, creditLimit: 100000, ownerId: 'u1',
    isActive: true, createdAt: '',
  },
  {
    id: 'c2', householdId: 'h1', name: 'KTC', bank: 'KTC', lastFour: '5678',
    color: '#ef4444', cutoffDay: 15, dueDay: 5, creditLimit: 50000, ownerId: 'u1',
    isActive: true, createdAt: '',
  },
];

const mockCategories: Category[] = [
  {
    id: 'cat1', householdId: 'h1', name: 'FOOD_DINING', label: 'Food & Dining',
    color: '#d4a853', icon: null, sortOrder: 0, isSystem: true, createdAt: '', updatedAt: '',
  },
  {
    id: 'cat2', householdId: 'h1', name: 'HOME', label: 'Home',
    color: '#059669', icon: null, sortOrder: 1, isSystem: true, createdAt: '', updatedAt: '',
  },
];

function renderPanel(
  filters: TransactionFilters = {},
  onFilterChange = vi.fn(),
) {
  return {
    onFilterChange,
    ...render(
      <TransactionFilterPanel
        filters={filters}
        onFilterChange={onFilterChange}
        cards={mockCards}
        categories={mockCategories}
      />
    ),
  };
}

describe('TransactionFilterPanel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the search input', () => {
    renderPanel();
    expect(screen.getByPlaceholderText('Search transactions…')).toBeInTheDocument();
  });

  it('renders the Filters toggle button', () => {
    renderPanel();
    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
  });

  it('filter panel is collapsed by default', () => {
    renderPanel();
    expect(screen.queryByLabelText('Card')).not.toBeInTheDocument();
  });

  it('expands filter panel when clicking Filters button', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
    expect(screen.getByLabelText('Card')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
  });

  it('shows card options in dropdown when expanded', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
    const cardSelect = screen.getByLabelText('Card');
    expect(cardSelect).toBeInTheDocument();
    expect(screen.getByText('TTB Reserve')).toBeInTheDocument();
    expect(screen.getByText('KTC')).toBeInTheDocument();
  });

  it('calls onFilterChange when a card is selected', () => {
    const { onFilterChange } = renderPanel();
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
    const cardSelect = screen.getByLabelText('Card');
    fireEvent.change(cardSelect, { target: { value: 'c1' } });
    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ cardId: 'c1' }));
  });

  it('calls onFilterChange when search input changes (debounced)', () => {
    const { onFilterChange } = renderPanel();
    const searchInput = screen.getByPlaceholderText('Search transactions…');
    fireEvent.change(searchInput, { target: { value: 'sushi' } });

    // Before debounce
    expect(onFilterChange).not.toHaveBeenCalled();

    // After debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ search: 'sushi' }));
  });

  it('shows active filter pills when filters are set', () => {
    renderPanel({ cardId: 'c1', categoryId: 'cat1' });
    expect(screen.getByText('TTB Reserve')).toBeInTheDocument();
    expect(screen.getByText('Food & Dining')).toBeInTheDocument();
  });

  it('removes filter when clicking pill dismiss button', () => {
    const { onFilterChange } = renderPanel({ cardId: 'c1' });
    const dismissButtons = screen.getAllByLabelText(/remove/i);
    fireEvent.click(dismissButtons[0]);
    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ cardId: undefined }));
  });

  it('shows Clear all when filters are active', () => {
    renderPanel({ cardId: 'c1' });
    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });

  it('clears all filters when clicking Clear all', () => {
    const { onFilterChange } = renderPanel({ cardId: 'c1', categoryId: 'cat1' });
    fireEvent.click(screen.getByText('Clear all'));
    expect(onFilterChange).toHaveBeenCalledWith({});
  });

  it('shows filter count badge when collapsed with active filters', () => {
    renderPanel({ cardId: 'c1', categoryId: 'cat1' });
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('has aria-expanded attribute on toggle button', () => {
    renderPanel();
    const btn = screen.getByRole('button', { name: /filters/i });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });
});
