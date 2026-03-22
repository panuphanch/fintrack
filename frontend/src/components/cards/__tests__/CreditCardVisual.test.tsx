import { render, screen, fireEvent } from '@testing-library/react';
import { CreditCardVisual } from '../CreditCardVisual';
import type { CreditCard } from '../../../types';
import { vi } from 'vitest';

const makeCard = (overrides: Partial<CreditCard> = {}): CreditCard => ({
  id: 'c1',
  householdId: 'h1',
  name: 'TTB Visa Platinum',
  bank: 'TTB',
  lastFour: '4567',
  color: '#3b82f6',
  cutoffDay: 25,
  dueDay: 10,
  creditLimit: 150000,
  ownerId: 'u1',
  owner: { id: 'u1', name: 'Meee', email: 'me@example.com', householdId: 'h1', createdAt: '' },
  isActive: true,
  createdAt: '',
  ...overrides,
});

const defaultProps = {
  onEdit: vi.fn(),
  onDelete: vi.fn(),
};

describe('CreditCardVisual', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders card name', () => {
    render(<CreditCardVisual card={makeCard()} {...defaultProps} />);
    expect(screen.getByText('TTB Visa Platinum')).toBeInTheDocument();
  });

  it('renders bank name', () => {
    render(<CreditCardVisual card={makeCard()} {...defaultProps} />);
    expect(screen.getByText('TTB')).toBeInTheDocument();
  });

  it('renders last four digits in masked number', () => {
    render(<CreditCardVisual card={makeCard()} {...defaultProps} />);
    expect(screen.getByText('4567')).toBeInTheDocument();
  });

  it('renders credit limit formatted as THB', () => {
    render(<CreditCardVisual card={makeCard()} {...defaultProps} />);
    expect(screen.getByText('฿150,000.00')).toBeInTheDocument();
  });

  it('renders billing cycle info', () => {
    render(<CreditCardVisual card={makeCard()} {...defaultProps} />);
    expect(screen.getByText(/Cut 25/)).toBeInTheDocument();
    expect(screen.getByText(/Due 10/)).toBeInTheDocument();
  });

  it('renders owner name when present', () => {
    render(<CreditCardVisual card={makeCard()} {...defaultProps} />);
    expect(screen.getByText('Meee')).toBeInTheDocument();
  });

  it('does not render owner when owner is null', () => {
    render(
      <CreditCardVisual
        card={makeCard({ owner: undefined, ownerId: null })}
        {...defaultProps}
      />,
    );
    expect(screen.queryByText('Meee')).not.toBeInTheDocument();
  });

  it('renders edit button with correct aria-label', () => {
    render(<CreditCardVisual card={makeCard()} {...defaultProps} />);
    expect(screen.getByLabelText('Edit card')).toBeInTheDocument();
  });

  it('renders delete button with correct aria-label', () => {
    render(<CreditCardVisual card={makeCard()} {...defaultProps} />);
    expect(screen.getByLabelText('Delete card')).toBeInTheDocument();
  });

  it('calls onEdit with card id when edit clicked', () => {
    const onEdit = vi.fn();
    render(<CreditCardVisual card={makeCard()} {...defaultProps} onEdit={onEdit} />);
    fireEvent.click(screen.getByLabelText('Edit card'));
    expect(onEdit).toHaveBeenCalledWith('c1');
  });

  it('calls onDelete with card object when delete clicked', () => {
    const onDelete = vi.fn();
    const card = makeCard();
    render(<CreditCardVisual card={card} {...defaultProps} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText('Delete card'));
    expect(onDelete).toHaveBeenCalledWith(card);
  });

  it('applies inactive styling when isInactive is true', () => {
    const { container } = render(
      <CreditCardVisual card={makeCard()} {...defaultProps} isInactive />,
    );
    const cardEl = container.firstElementChild as HTMLElement;
    expect(cardEl.className).toContain('opacity-50');
    expect(cardEl.className).toContain('grayscale');
  });

  it('shows Inactive badge when isInactive is true', () => {
    render(<CreditCardVisual card={makeCard()} {...defaultProps} isInactive />);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('hides delete button when isInactive is true', () => {
    render(<CreditCardVisual card={makeCard()} {...defaultProps} isInactive />);
    expect(screen.queryByLabelText('Delete card')).not.toBeInTheDocument();
  });

  it('applies card color to background gradient', () => {
    const { container } = render(
      <CreditCardVisual card={makeCard({ color: '#ef4444' })} {...defaultProps} />,
    );
    const cardEl = container.firstElementChild as HTMLElement;
    expect(cardEl.style.background).toContain('239, 68, 68');
  });

  it('has correct aria role and label', () => {
    render(<CreditCardVisual card={makeCard()} {...defaultProps} />);
    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('aria-label', 'TTB Visa Platinum credit card');
  });
});
