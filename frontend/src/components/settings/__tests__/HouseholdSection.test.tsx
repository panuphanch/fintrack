import { render, screen, fireEvent } from '@testing-library/react';
import { HouseholdSection } from '../HouseholdSection';
import type { User } from '../../../types';

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'u1',
  email: 'meee@example.com',
  name: 'Meee',
  householdId: 'h1',
  createdAt: '2026-01-01',
  ...overrides,
});

const members = [
  makeUser(),
  makeUser({ id: 'u2', email: 'je@example.com', name: 'Je' }),
];

describe('HouseholdSection', () => {
  it('renders the section label', () => {
    render(<HouseholdSection members={members} currentUserId="u1" onInvite={vi.fn()} />);
    expect(screen.getByText('HOUSEHOLD')).toBeInTheDocument();
  });

  it('renders member count', () => {
    render(<HouseholdSection members={members} currentUserId="u1" onInvite={vi.fn()} />);
    expect(screen.getByText('2 members')).toBeInTheDocument();
  });

  it('renders the Invite Member button', () => {
    render(<HouseholdSection members={members} currentUserId="u1" onInvite={vi.fn()} />);
    expect(screen.getByRole('button', { name: /invite member/i })).toBeInTheDocument();
  });

  it('calls onInvite when Invite Member is clicked', () => {
    const onInvite = vi.fn();
    render(<HouseholdSection members={members} currentUserId="u1" onInvite={onInvite} />);
    fireEvent.click(screen.getByRole('button', { name: /invite member/i }));
    expect(onInvite).toHaveBeenCalledOnce();
  });

  it('renders all member names', () => {
    render(<HouseholdSection members={members} currentUserId="u1" onInvite={vi.fn()} />);
    expect(screen.getByText('Meee')).toBeInTheDocument();
    expect(screen.getByText('Je')).toBeInTheDocument();
  });

  it('renders all member emails', () => {
    render(<HouseholdSection members={members} currentUserId="u1" onInvite={vi.fn()} />);
    expect(screen.getByText('meee@example.com')).toBeInTheDocument();
    expect(screen.getByText('je@example.com')).toBeInTheDocument();
  });

  it('shows (You) next to current user', () => {
    render(<HouseholdSection members={members} currentUserId="u1" onInvite={vi.fn()} />);
    expect(screen.getByText('(You)')).toBeInTheDocument();
  });

  it('renders avatars with first initials', () => {
    render(<HouseholdSection members={members} currentUserId="u1" onInvite={vi.fn()} />);
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('applies card styling', () => {
    const { container } = render(
      <HouseholdSection members={members} currentUserId="u1" onInvite={vi.fn()} />,
    );
    expect(container.querySelector('.bg-surface')).toBeInTheDocument();
    expect(container.querySelector('.rounded-xl')).toBeInTheDocument();
  });

  it('renders singular member count for 1 member', () => {
    render(<HouseholdSection members={[members[0]]} currentUserId="u1" onInvite={vi.fn()} />);
    expect(screen.getByText('1 member')).toBeInTheDocument();
  });
});
