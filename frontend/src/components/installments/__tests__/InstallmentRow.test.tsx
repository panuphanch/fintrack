import { render, screen, fireEvent } from '@testing-library/react';
import InstallmentRow from '../InstallmentRow';
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

describe('InstallmentRow', () => {
  const defaultProps = {
    installment: makeInstallment(),
    onIncrement: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders installment name', () => {
    render(<InstallmentRow {...defaultProps} />);
    expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument();
  });

  it('renders notes when present', () => {
    render(<InstallmentRow {...defaultProps} installment={makeInstallment({ notes: 'With AppleCare' })} />);
    expect(screen.getByText('With AppleCare')).toBeInTheDocument();
  });

  it('does not render notes when null', () => {
    render(<InstallmentRow {...defaultProps} />);
    expect(screen.queryByText('With AppleCare')).not.toBeInTheDocument();
  });

  it('renders CategoryBadge with correct category', () => {
    render(<InstallmentRow {...defaultProps} />);
    expect(screen.getByText('Gadget')).toBeInTheDocument();
  });

  it('renders monthly amount formatted as THB with font-mono', () => {
    render(<InstallmentRow {...defaultProps} />);
    const amount = screen.getByText('฿4,500.00');
    expect(amount).toBeInTheDocument();
    expect(amount.className).toContain('font-mono');
  });

  it('renders progress bar with correct width percentage', () => {
    render(<InstallmentRow {...defaultProps} />);
    const progressBar = screen.getByRole('progressbar');
    const fill = progressBar.querySelector('[data-testid="progress-fill"]');
    expect(fill).toHaveStyle({ width: '50%' });
  });

  it('renders fraction text', () => {
    render(<InstallmentRow {...defaultProps} />);
    expect(screen.getByText('5/10')).toBeInTheDocument();
  });

  it('shows +1 button when not complete', () => {
    render(<InstallmentRow {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Mark next payment' })).toBeInTheDocument();
  });

  it('hides +1 button when complete', () => {
    const complete = makeInstallment({ currentInstallment: 10, totalInstallments: 10 });
    render(<InstallmentRow {...defaultProps} installment={complete} />);
    expect(screen.queryByRole('button', { name: 'Mark next payment' })).not.toBeInTheDocument();
  });

  it('calls onIncrement with id when +1 clicked', () => {
    const onIncrement = vi.fn();
    render(<InstallmentRow {...defaultProps} onIncrement={onIncrement} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mark next payment' }));
    expect(onIncrement).toHaveBeenCalledWith('inst-1');
  });

  it('calls onEdit with installment when edit clicked', () => {
    const onEdit = vi.fn();
    render(<InstallmentRow {...defaultProps} onEdit={onEdit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledWith(defaultProps.installment);
  });

  it('calls onDelete with installment when delete clicked', () => {
    const onDelete = vi.fn();
    render(<InstallmentRow {...defaultProps} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith(defaultProps.installment);
  });

  it('shows green progress bar and fraction text when complete', () => {
    const complete = makeInstallment({ currentInstallment: 10, totalInstallments: 10 });
    render(<InstallmentRow {...defaultProps} installment={complete} />);
    const fill = screen.getByRole('progressbar').querySelector('[data-testid="progress-fill"]');
    expect(fill?.className).toContain('bg-profit-400');
    const fraction = screen.getByText('10/10');
    expect(fraction.className).toContain('text-profit-400');
  });

  it('shows gold progress bar when in-progress', () => {
    render(<InstallmentRow {...defaultProps} />);
    const fill = screen.getByRole('progressbar').querySelector('[data-testid="progress-fill"]');
    expect(fill?.className).toContain('bg-gold-400');
  });

  it('applies opacity-60 when complete', () => {
    const complete = makeInstallment({ currentInstallment: 10, totalInstallments: 10 });
    const { container } = render(<InstallmentRow {...defaultProps} installment={complete} />);
    expect(container.firstChild?.className).toContain('opacity-60');
  });

  it('disables +1 button when isIncrementPending', () => {
    render(<InstallmentRow {...defaultProps} isIncrementPending />);
    expect(screen.getByRole('button', { name: 'Mark next payment' })).toBeDisabled();
  });
});
