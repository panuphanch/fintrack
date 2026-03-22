import { render, screen } from '@testing-library/react';
import TransactionSummaryBar from '../TransactionSummaryBar';
import { formatTHB } from '../../../lib/format';
import type { Transaction } from '../../../types';

function makeTransaction(amount: number): Transaction {
  return {
    id: `t-${amount}`,
    householdId: 'h1',
    cardId: 'c1',
    amount,
    merchant: 'Store',
    categoryId: 'cat1',
    category: {
      id: 'cat1', householdId: 'h1', name: 'FOOD_DINING', label: 'Food & Dining',
      color: '#d4a853', icon: null, sortOrder: 0, isSystem: true, createdAt: '', updatedAt: '',
    },
    date: '2026-03-22T10:00:00Z',
    notes: null,
    receiptUrl: null,
    isRecurring: false,
    createdById: 'u1',
    tags: [],
    createdAt: '',
    updatedAt: '',
  };
}

describe('TransactionSummaryBar', () => {
  it('renders total spent formatted as THB', () => {
    const transactions = [makeTransaction(1000), makeTransaction(2500)];
    render(<TransactionSummaryBar transactions={transactions} />);
    expect(screen.getByText(formatTHB(3500))).toBeInTheDocument();
  });

  it('renders transaction count', () => {
    const transactions = [makeTransaction(100), makeTransaction(200), makeTransaction(300)];
    render(<TransactionSummaryBar transactions={transactions} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders average per transaction', () => {
    const transactions = [makeTransaction(1000), makeTransaction(3000)];
    render(<TransactionSummaryBar transactions={transactions} />);
    expect(screen.getByText(formatTHB(2000))).toBeInTheDocument();
  });

  it('handles empty transactions gracefully', () => {
    render(<TransactionSummaryBar transactions={[]} />);
    // Both Total Spent and Average show ฿0.00
    expect(screen.getAllByText(formatTHB(0))).toHaveLength(2);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders stat labels', () => {
    render(<TransactionSummaryBar transactions={[makeTransaction(100)]} />);
    expect(screen.getByText('Total Spent')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Average')).toBeInTheDocument();
  });
});
