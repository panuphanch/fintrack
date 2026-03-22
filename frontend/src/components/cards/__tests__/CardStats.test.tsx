import { render, screen } from '@testing-library/react';
import { CardStats } from '../CardStats';
import type { CreditCard } from '../../../types';

const makeCard = (overrides: Partial<CreditCard> = {}): CreditCard => ({
  id: 'c1',
  householdId: 'h1',
  name: 'My Card',
  bank: 'TTB',
  lastFour: '1234',
  color: '#3b82f6',
  cutoffDay: 25,
  dueDay: 10,
  creditLimit: 100000,
  ownerId: 'u1',
  owner: { id: 'u1', name: 'Meee', email: 'me@example.com', householdId: 'h1', createdAt: '' },
  isActive: true,
  createdAt: '',
  ...overrides,
});

describe('CardStats', () => {
  it('renders active card count', () => {
    const cards = [makeCard(), makeCard({ id: 'c2', name: 'Card 2' })];
    render(<CardStats cards={cards} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders total credit limit formatted as THB', () => {
    const cards = [
      makeCard({ creditLimit: 100000 }),
      makeCard({ id: 'c2', creditLimit: 50000 }),
    ];
    render(<CardStats cards={cards} />);
    // formatTHB formats as ฿150,000.00
    expect(screen.getByText('฿150,000.00')).toBeInTheDocument();
  });

  it('renders owner names', () => {
    const cards = [
      makeCard({ owner: { id: 'u1', name: 'Meee', email: '', householdId: 'h1', createdAt: '' } }),
      makeCard({ id: 'c2', owner: { id: 'u2', name: 'Je', email: '', householdId: 'h1', createdAt: '' } }),
    ];
    render(<CardStats cards={cards} />);
    expect(screen.getByText('Meee, Je')).toBeInTheDocument();
  });

  it('shows dash for owners when no owner assigned', () => {
    const cards = [makeCard({ owner: undefined, ownerId: null })];
    render(<CardStats cards={cards} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('handles empty card array', () => {
    render(<CardStats cards={[]} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('฿0.00')).toBeInTheDocument();
  });

  it('renders stat labels', () => {
    render(<CardStats cards={[makeCard()]} />);
    expect(screen.getByText('Active Cards')).toBeInTheDocument();
    expect(screen.getByText('Total Credit Limit')).toBeInTheDocument();
    expect(screen.getByText('Owners')).toBeInTheDocument();
  });
});
