import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SummaryCard } from '../SummaryCard';

const icon = <svg data-testid="icon" />;

function renderCard(props = {}) {
  return render(
    <MemoryRouter>
      <SummaryCard
        title="Installments"
        value={15000}
        icon={icon}
        color="gold"
        {...props}
      />
    </MemoryRouter>
  );
}

describe('SummaryCard', () => {
  it('should render title and formatted value', () => {
    renderCard();
    expect(screen.getByText('Installments')).toBeInTheDocument();
    expect(screen.getByText(/15,000/)).toBeInTheDocument();
  });

  it('should render icon', () => {
    renderCard();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should render link when provided', () => {
    renderCard({ linkTo: '/installments', linkText: 'View all' });
    const link = screen.getByText('View all');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/installments');
  });

  it('should render subtitle', () => {
    renderCard({ subtitle: '5 transactions' });
    expect(screen.getByText('5 transactions')).toBeInTheDocument();
  });

  it('should apply highlighted styles', () => {
    const { container } = renderCard({ isHighlighted: true });
    expect(container.firstChild).toHaveClass('bg-gradient-to-br');
  });
});
