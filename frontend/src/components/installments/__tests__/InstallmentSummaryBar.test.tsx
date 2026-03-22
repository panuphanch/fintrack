import { render, screen } from '@testing-library/react';
import InstallmentSummaryBar from '../InstallmentSummaryBar';

describe('InstallmentSummaryBar', () => {
  it('renders "Monthly Total" label and formatted THB value', () => {
    render(<InstallmentSummaryBar monthlyTotal={12500} activeCount={5} completedCount={3} />);
    expect(screen.getByText('Monthly Total')).toBeInTheDocument();
    expect(screen.getByText('฿12,500.00')).toBeInTheDocument();
  });

  it('renders "Active" label and correct count', () => {
    render(<InstallmentSummaryBar monthlyTotal={0} activeCount={7} completedCount={2} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders "Completed" label and correct count', () => {
    render(<InstallmentSummaryBar monthlyTotal={0} activeCount={0} completedCount={4} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('handles zero values', () => {
    render(<InstallmentSummaryBar monthlyTotal={0} activeCount={0} completedCount={0} />);
    expect(screen.getByText('฿0.00')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(2);
  });

  it('monthly total uses gold color', () => {
    render(<InstallmentSummaryBar monthlyTotal={1000} activeCount={1} completedCount={0} />);
    const totalValue = screen.getByText('฿1,000.00');
    expect(totalValue.className).toContain('text-gold-400');
  });
});
