import { render, screen } from '@testing-library/react';
import { ProfileSection } from '../ProfileSection';
import type { User } from '../../../types';

const mockUser: User = {
  id: 'u1',
  email: 'meee@example.com',
  name: 'Meee',
  householdId: 'h1',
  createdAt: '2026-01-01',
};

describe('ProfileSection', () => {
  it('renders the section label', () => {
    render(<ProfileSection user={mockUser} />);
    expect(screen.getByText('PROFILE')).toBeInTheDocument();
  });

  it('renders the user name', () => {
    render(<ProfileSection user={mockUser} />);
    expect(screen.getByText('Meee')).toBeInTheDocument();
  });

  it('renders the user email', () => {
    render(<ProfileSection user={mockUser} />);
    expect(screen.getByText('meee@example.com')).toBeInTheDocument();
  });

  it('renders avatar with first initial', () => {
    render(<ProfileSection user={mockUser} />);
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('renders avatar with uppercase first letter', () => {
    const user = { ...mockUser, name: 'john' };
    render(<ProfileSection user={user} />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('has slide-up animation class', () => {
    const { container } = render(<ProfileSection user={mockUser} />);
    expect(container.querySelector('.motion-safe\\:animate-slide-up')).toBeInTheDocument();
  });

  it('applies card styling', () => {
    const { container } = render(<ProfileSection user={mockUser} />);
    expect(container.querySelector('.bg-surface')).toBeInTheDocument();
    expect(container.querySelector('.rounded-xl')).toBeInTheDocument();
  });
});
