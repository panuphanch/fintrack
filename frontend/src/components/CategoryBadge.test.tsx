import { render, screen } from '@testing-library/react';
import { CategoryBadge } from './CategoryBadge';
import type { Category } from '../types';

const mockCategory: Category = {
  id: 'cat-1',
  householdId: 'h-1',
  name: 'FOOD_DINING',
  label: 'Food & Dining',
  color: '#ef4444',
  icon: 'fire',
  sortOrder: 1,
  isSystem: true,
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
};

describe('CategoryBadge', () => {
  it('should render category label', () => {
    render(<CategoryBadge category={mockCategory} />);

    expect(screen.getByText('Food & Dining')).toBeInTheDocument();
  });

  it('should apply category color as inline style', () => {
    render(<CategoryBadge category={mockCategory} />);

    const badge = screen.getByText('Food & Dining');
    expect(badge).toHaveStyle({ color: '#ef4444' });
    expect(badge).toHaveStyle({ backgroundColor: '#ef444430' });
  });

  it('should apply sm size classes by default', () => {
    render(<CategoryBadge category={mockCategory} />);

    const badge = screen.getByText('Food & Dining');
    expect(badge.className).toContain('text-xs');
  });

  it('should apply md size classes', () => {
    render(<CategoryBadge category={mockCategory} size="md" />);

    const badge = screen.getByText('Food & Dining');
    expect(badge.className).toContain('text-sm');
  });
});
