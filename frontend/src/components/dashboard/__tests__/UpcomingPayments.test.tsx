import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UpcomingPayments } from '../UpcomingPayments';
import type { Installment, FixedCost, Category } from '../../../types';

const mockCategory: Category = {
  id: 'cat-1', householdId: 'h1', name: 'GADGET', label: 'Gadget', color: '#8b5cf6',
  icon: null, sortOrder: 0, isSystem: true, parentId: null, createdAt: '', updatedAt: '',
};

const mockInstallment: Installment = {
  id: 'inst-1', householdId: 'h1', cardId: 'card-1',
  card: { id: 'card-1', name: 'TTB', bank: 'TTB', color: '#000' },
  name: 'iPhone', totalAmount: 45000, monthlyAmount: 4500,
  currentInstallment: 5, totalInstallments: 10,
  categoryId: 'cat-1', category: mockCategory,
  startDate: '2025-01-01', notes: null, isActive: true,
  createdById: 'u1', createdAt: '', updatedAt: '',
};

const mockFixedCost: FixedCost = {
  id: 'fc-1', householdId: 'h1', name: 'Internet',
  amount: 800, categoryId: 'cat-1', category: mockCategory,
  dueDay: 15, isActive: true, notes: null,
  createdById: 'u1', createdAt: '', updatedAt: '',
};

function renderPayments(installments: Installment[] = [], fixedCosts: FixedCost[] = []) {
  return render(
    <MemoryRouter>
      <UpcomingPayments installments={installments} fixedCosts={fixedCosts} />
    </MemoryRouter>
  );
}

describe('UpcomingPayments', () => {
  it('should render empty state', () => {
    renderPayments();
    expect(screen.getByText('No active recurring payments')).toBeInTheDocument();
  });

  it('should render installment with progress pill', () => {
    renderPayments([mockInstallment]);
    expect(screen.getByText('iPhone')).toBeInTheDocument();
    expect(screen.getByText('5/10')).toBeInTheDocument();
  });

  it('should render fixed cost with due day', () => {
    renderPayments([], [mockFixedCost]);
    expect(screen.getByText('Internet')).toBeInTheDocument();
    expect(screen.getByText('Due day 15')).toBeInTheDocument();
  });

  it('should render mixed list', () => {
    renderPayments([mockInstallment], [mockFixedCost]);
    expect(screen.getByText('iPhone')).toBeInTheDocument();
    expect(screen.getByText('Internet')).toBeInTheDocument();
  });

  it('should limit to maxItems', () => {
    const installments = Array.from({ length: 6 }, (_, i) => ({
      ...mockInstallment, id: `inst-${i}`, name: `Item ${i}`,
    }));
    renderPayments(installments, [mockFixedCost]);
    // Default maxItems is 5, so 7 total items should show only 5
    const items = screen.getAllByText(/Item \d|Internet/);
    expect(items.length).toBeLessThanOrEqual(5);
  });
});
