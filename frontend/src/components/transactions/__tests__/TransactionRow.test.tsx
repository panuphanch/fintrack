import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import TransactionRow from '../TransactionRow';
import type { Transaction } from '../../../types';

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

function renderRow(transaction: Transaction, onDelete = vi.fn()) {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <TransactionRow transaction={transaction} onDelete={onDelete} />
    </MemoryRouter>
  );
}

describe('TransactionRow', () => {
  it('renders merchant name', () => {
    renderRow(makeTransaction());
    expect(screen.getByText('Sushi Hiro')).toBeInTheDocument();
  });

  it('renders formatted amount using formatTHB', () => {
    renderRow(makeTransaction({ amount: 1450 }));
    // Thai Baht formatting: \u0E3F1,450.00 (prefix varies by locale)
    expect(screen.getByText(/1,450\.00/)).toBeInTheDocument();
  });

  it('renders CategoryBadge with the transaction category', () => {
    renderRow(makeTransaction());
    expect(screen.getByText('Food & Dining')).toBeInTheDocument();
  });

  it('renders card name with last four digits', () => {
    renderRow(makeTransaction());
    expect(screen.getByText(/TTB Reserve/)).toBeInTheDocument();
    expect(screen.getByText(/1234/)).toBeInTheDocument();
  });

  it('renders tags as pills', () => {
    const tx = makeTransaction({
      tags: [
        { id: 'tag1', householdId: 'h1', name: 'groceries' },
        { id: 'tag2', householdId: 'h1', name: 'weekly' },
      ],
    });
    renderRow(tx);
    expect(screen.getByText('groceries')).toBeInTheDocument();
    expect(screen.getByText('weekly')).toBeInTheDocument();
  });

  it('edit link points to /transactions/:id/edit', () => {
    renderRow(makeTransaction({ id: 'tx-abc' }));
    const editLink = screen.getByRole('link', { name: /edit/i });
    expect(editLink).toHaveAttribute('href', '/transactions/tx-abc/edit');
  });

  it('delete button calls onDelete with the transaction', () => {
    const onDelete = vi.fn();
    const tx = makeTransaction();
    renderRow(tx, onDelete);
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith(tx);
  });

  it('shows "Unknown" when card is not provided', () => {
    const tx = makeTransaction({ card: undefined });
    renderRow(tx);
    expect(screen.getByText(/Unknown/)).toBeInTheDocument();
  });
});
