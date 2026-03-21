import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RecentTransactions } from '../RecentTransactions';
import type { Transaction, Category } from '../../../types';

const mockCategory: Category = {
  id: 'cat-1', householdId: 'h1', name: 'FOOD', label: 'Food', color: '#ef4444',
  icon: null, sortOrder: 0, isSystem: true, parentId: null, createdAt: '', updatedAt: '',
};

const mockTransaction: Transaction = {
  id: 't1', householdId: 'h1', cardId: 'card-1',
  card: { id: 'card-1', householdId: 'h1', name: 'TTB', bank: 'TTB', lastFour: '1234', color: '#000', cutoffDay: 15, dueDay: 5, creditLimit: 50000, ownerId: null, isActive: true, createdAt: '' },
  amount: 1500, merchant: 'Starbucks',
  categoryId: 'cat-1', category: mockCategory,
  date: '2026-03-20', notes: null, receiptUrl: null,
  isRecurring: false, createdById: 'u1', tags: [],
  createdAt: '', updatedAt: '',
};

function renderTransactions(transactions: Transaction[] = []) {
  return render(
    <MemoryRouter>
      <RecentTransactions transactions={transactions} />
    </MemoryRouter>
  );
}

describe('RecentTransactions', () => {
  it('should render empty state', () => {
    renderTransactions();
    expect(screen.getByText('No transactions yet')).toBeInTheDocument();
    expect(screen.getByText('Add your first transaction')).toBeInTheDocument();
  });

  it('should render transaction list', () => {
    renderTransactions([mockTransaction]);
    expect(screen.getByText('Starbucks')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
  });

  it('should render card badge', () => {
    renderTransactions([mockTransaction]);
    expect(screen.getByText('TTB')).toBeInTheDocument();
  });

  it('should render view all link', () => {
    renderTransactions([mockTransaction]);
    const link = screen.getByText('View all');
    expect(link.closest('a')).toHaveAttribute('href', '/transactions');
  });

  it('should limit to maxItems', () => {
    const transactions = Array.from({ length: 10 }, (_, i) => ({
      ...mockTransaction, id: `t${i}`, merchant: `Merchant ${i}`,
    }));
    renderTransactions(transactions);
    // Default maxItems is 5
    const merchants = screen.getAllByText(/Merchant \d/);
    expect(merchants).toHaveLength(5);
  });
});
