import { render, screen } from '@testing-library/react';
import { InstallmentSkeleton } from '../InstallmentSkeleton';

describe('InstallmentSkeleton', () => {
  it('renders skeleton container with correct testid', () => {
    render(<InstallmentSkeleton />);
    expect(screen.getByTestId('installment-skeleton')).toBeInTheDocument();
  });

  it('renders default 2 skeleton groups', () => {
    render(<InstallmentSkeleton />);
    const groups = screen.getAllByTestId('skeleton-group');
    expect(groups).toHaveLength(2);
  });

  it('renders custom number of groups', () => {
    render(<InstallmentSkeleton groupCount={4} />);
    const groups = screen.getAllByTestId('skeleton-group');
    expect(groups).toHaveLength(4);
  });

  it('renders skeleton rows with circles and bars', () => {
    render(<InstallmentSkeleton groupCount={1} />);
    expect(screen.getAllByTestId('skeleton-circle').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('skeleton-bar').length).toBeGreaterThan(0);
  });

  it('renders summary skeleton cards', () => {
    render(<InstallmentSkeleton />);
    const summaryCards = screen.getAllByTestId('skeleton-summary-card');
    expect(summaryCards).toHaveLength(3);
  });
});
