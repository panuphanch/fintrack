import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import TransactionDateGroup from '../TransactionDateGroup';
import type { Transaction } from '../../../types';
import type { DateGroup } from '../../../lib/groupTransactionsByDate';

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 't1',
    householdId: 'h1',
    cardId: 'c1',
    card: { id: 'c1', name: 'TTB Reserve', bank: 'TTB', lastFour: '1234', color: '#3b82f6' },
    amount: 1450,
    merchant: 'Sushi Hiro',
    categoryId: 'cat1',
    category: {
      id: 'cat1',
      householdId: 'h1',
      name: 'FOOD_DINING',
      label: 'Food & Dining',
      color: '#d4a853',
      icon: null,
      sortOrder: 0,
      isSystem: true,
      createdAt: '',
      updatedAt: '',
    },
    date: '2026-03-22T10:00:00Z',
    notes: null,
    receiptUrl: null,
    isRecurring: false,
    createdById: 'u1',
    tags: [],
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function renderGroup(group: DateGroup, index = 0) {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <TransactionDateGroup group={group} index={index} onDelete={vi.fn()} />
    </MemoryRouter>
  );
}

describe('TransactionDateGroup', () => {
  it('renders the date group label', () => {
    const group: DateGroup = {
      label: 'Today',
      dateKey: 'today',
      transactions: [makeTransaction()],
    };

    renderGroup(group);
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('renders all transactions in the group', () => {
    const group: DateGroup = {
      label: 'Yesterday',
      dateKey: 'yesterday',
      transactions: [
        makeTransaction({ id: 't1', merchant: 'Sushi Hiro' }),
        makeTransaction({ id: 't2', merchant: 'HomePro' }),
      ],
    };

    renderGroup(group);
    expect(screen.getByText('Sushi Hiro')).toBeInTheDocument();
    expect(screen.getByText('HomePro')).toBeInTheDocument();
  });

  it('applies staggered animation delay based on index', () => {
    const group: DateGroup = {
      label: 'This Week',
      dateKey: 'this-week',
      transactions: [makeTransaction()],
    };

    const { container } = renderGroup(group, 2);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.animationDelay).toBe('100ms');
  });

  it('has the card container with proper styling', () => {
    const group: DateGroup = {
      label: 'Today',
      dateKey: 'today',
      transactions: [makeTransaction()],
    };

    renderGroup(group);
    const container = screen.getByTestId('date-group-card');
    expect(container).toBeInTheDocument();
  });
});
