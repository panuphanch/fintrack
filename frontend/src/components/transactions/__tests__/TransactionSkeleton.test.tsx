import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TransactionSkeleton } from '../TransactionSkeleton';

describe('TransactionSkeleton', () => {
  it('renders with data-testid="transaction-skeleton" on root', () => {
    render(<TransactionSkeleton />);
    expect(screen.getByTestId('transaction-skeleton')).toBeInTheDocument();
  });

  it('renders 3 skeleton groups by default', () => {
    render(<TransactionSkeleton />);
    const groups = screen.getAllByTestId('skeleton-group');
    expect(groups).toHaveLength(3);
  });

  it('renders custom number of groups via groupCount prop', () => {
    render(<TransactionSkeleton groupCount={5} />);
    const groups = screen.getAllByTestId('skeleton-group');
    expect(groups).toHaveLength(5);
  });

  it('each group has a date header skeleton bar', () => {
    render(<TransactionSkeleton groupCount={1} />);
    const group = screen.getByTestId('skeleton-group');
    const header = group.querySelector('[data-testid="skeleton-date-header"]');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('skeleton');
  });

  it('each group has 2-3 row skeletons', () => {
    render(<TransactionSkeleton groupCount={3} />);
    const groups = screen.getAllByTestId('skeleton-group');
    groups.forEach((group) => {
      const rows = group.querySelectorAll('[data-testid="skeleton-row"]');
      expect(rows.length).toBeGreaterThanOrEqual(2);
      expect(rows.length).toBeLessThanOrEqual(3);
    });
  });

  it('each row has a circle for category icon (40px)', () => {
    render(<TransactionSkeleton groupCount={1} />);
    const rows = screen.getAllByTestId('skeleton-row');
    rows.forEach((row) => {
      const circle = row.querySelector('[data-testid="skeleton-circle"]');
      expect(circle).toBeInTheDocument();
      expect(circle).toHaveClass('rounded-full');
      expect(circle).toHaveClass('w-10');
      expect(circle).toHaveClass('h-10');
    });
  });

  it('each row has two skeleton bars (merchant + amount)', () => {
    render(<TransactionSkeleton groupCount={1} />);
    const rows = screen.getAllByTestId('skeleton-row');
    rows.forEach((row) => {
      const bars = row.querySelectorAll('[data-testid="skeleton-bar"]');
      expect(bars).toHaveLength(2);
    });
  });

  it('skeleton bars use the skeleton class for shimmer animation', () => {
    render(<TransactionSkeleton groupCount={1} />);
    const rows = screen.getAllByTestId('skeleton-row');
    rows.forEach((row) => {
      const bars = row.querySelectorAll('[data-testid="skeleton-bar"]');
      bars.forEach((bar) => {
        expect(bar).toHaveClass('skeleton');
      });
    });
  });

  it('circle uses the skeleton class', () => {
    render(<TransactionSkeleton groupCount={1} />);
    const circles = screen.getAllByTestId('skeleton-circle');
    circles.forEach((circle) => {
      expect(circle).toHaveClass('skeleton');
    });
  });

  it('group cards use rounded-xl and border styling', () => {
    render(<TransactionSkeleton groupCount={1} />);
    const group = screen.getByTestId('skeleton-group');
    expect(group).toHaveClass('rounded-xl');
  });
});
