import { render, screen } from '@testing-library/react';
import InstallmentCardGroup from '../InstallmentCardGroup';
import type { Installment, Category } from '../../../types';

const mockCategory: Category = {
  id: 'cat1', householdId: 'h1', name: 'GADGET', label: 'Gadget',
  color: '#3b82f6', icon: 'device-mobile', sortOrder: 3, isSystem: true,
  createdAt: '', updatedAt: '',
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

describe('InstallmentCardGroup', () => {
  const defaultProps = {
    cardName: 'TTB Reserve',
    cardColor: '#3b82f6',
    installments: [
      makeInstallment({ id: 'i1', name: 'iPhone 15 Pro', monthlyAmount: 4500 }),
      makeInstallment({ id: 'i2', name: 'MacBook Air', monthlyAmount: 3500 }),
    ],
    index: 0,
    onIncrement: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it('renders card name as group heading', () => {
    render(<InstallmentCardGroup {...defaultProps} />);
    expect(screen.getByText('TTB Reserve')).toBeInTheDocument();
  });

  it('renders card color indicator dot with correct backgroundColor', () => {
    render(<InstallmentCardGroup {...defaultProps} />);
    const dot = screen.getByTestId('card-color-dot');
    expect(dot).toHaveStyle({ backgroundColor: '#3b82f6' });
  });

  it('renders subtotal formatted as THB', () => {
    render(<InstallmentCardGroup {...defaultProps} />);
    expect(screen.getByText('฿8,000.00')).toBeInTheDocument();
  });

  it('renders correct number of installment rows', () => {
    render(<InstallmentCardGroup {...defaultProps} />);
    expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument();
    expect(screen.getByText('MacBook Air')).toBeInTheDocument();
  });

  it('applies staggered animation delay based on index', () => {
    const { container } = render(<InstallmentCardGroup {...defaultProps} index={2} />);
    expect(container.firstChild).toHaveStyle({ animationDelay: '100ms' });
  });

  it('applies zero delay for index 0', () => {
    const { container } = render(<InstallmentCardGroup {...defaultProps} index={0} />);
    expect(container.firstChild).toHaveStyle({ animationDelay: '0ms' });
  });
});
