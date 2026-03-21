import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CardBillingCard } from '../CardBillingCard';
import type { CardBillingSummary } from '../../../types';

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 10);

const pastDate = new Date();
pastDate.setDate(pastDate.getDate() - 2);

const soonDate = new Date();
soonDate.setDate(soonDate.getDate() + 2);

const makeCard = (overrides: Partial<CardBillingSummary> = {}): CardBillingSummary => ({
  cardId: 'card-1',
  cardName: 'TTB Reserve',
  cardColor: '#1e3a5f',
  cardBank: 'TTB',
  cardLastFour: '1234',
  ownerName: 'Alice',
  billingPeriod: { start: '2026-03-16T00:00:00Z', end: '2026-04-15T00:00:00Z' },
  dueDate: futureDate.toISOString(),
  transactionAmount: 5000,
  installmentAmount: 2000,
  totalAmount: 7000,
  transactionCount: 3,
  isPaid: false,
  ...overrides,
});

function renderCard(props = {}) {
  const defaultProps = {
    card: makeCard(),
    includeInstallments: true,
    onMarkPaid: vi.fn(),
    isPaying: false,
  };
  return render(
    <MemoryRouter>
      <CardBillingCard {...defaultProps} {...props} />
    </MemoryRouter>
  );
}

describe('CardBillingCard', () => {
  it('should render card name and bank info', () => {
    renderCard();
    expect(screen.getByText('TTB Reserve')).toBeInTheDocument();
    expect(screen.getByText(/TTB.*1234.*Alice/)).toBeInTheDocument();
  });

  it('should render transaction and installment amounts', () => {
    renderCard();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Installments')).toBeInTheDocument();
  });

  it('should hide installments when not included', () => {
    renderCard({ includeInstallments: false });
    expect(screen.queryByText('Installments')).not.toBeInTheDocument();
  });

  it('should render paid status', () => {
    renderCard({ card: makeCard({ isPaid: true }) });
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('should call onMarkPaid when button clicked', async () => {
    const onMarkPaid = vi.fn();
    const user = userEvent.setup();
    renderCard({ onMarkPaid });

    await user.click(screen.getByText('Mark as Paid'));
    expect(onMarkPaid).toHaveBeenCalledWith('card-1');
  });

  it('should show overdue styling for past due dates', () => {
    const { container } = renderCard({ card: makeCard({ dueDate: pastDate.toISOString() }) });
    expect(container.querySelector('.border-danger-400\\/40')).toBeInTheDocument();
  });

  it('should show urgent styling for due within 3 days', () => {
    const { container } = renderCard({ card: makeCard({ dueDate: soonDate.toISOString() }) });
    expect(container.querySelector('.border-warning-400\\/30')).toBeInTheDocument();
  });
});
