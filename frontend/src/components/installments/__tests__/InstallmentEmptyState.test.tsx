import { render, screen, fireEvent } from '@testing-library/react';
import InstallmentEmptyState from '../InstallmentEmptyState';

describe('InstallmentEmptyState', () => {
  const onAddInstallment = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state icon', () => {
    render(<InstallmentEmptyState onAddInstallment={onAddInstallment} />);
    const icon = document.querySelector('svg[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
  });

  it('renders "No installments yet" heading', () => {
    render(<InstallmentEmptyState onAddInstallment={onAddInstallment} />);
    expect(screen.getByText('No installments yet')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<InstallmentEmptyState onAddInstallment={onAddInstallment} />);
    expect(screen.getByText('Add your installment purchases to track payment progress.')).toBeInTheDocument();
  });

  it('renders "Add Installment" CTA button', () => {
    render(<InstallmentEmptyState onAddInstallment={onAddInstallment} />);
    expect(screen.getByRole('button', { name: 'Add Installment' })).toBeInTheDocument();
  });

  it('calls onAddInstallment when CTA clicked', () => {
    render(<InstallmentEmptyState onAddInstallment={onAddInstallment} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Installment' }));
    expect(onAddInstallment).toHaveBeenCalledTimes(1);
  });
});
