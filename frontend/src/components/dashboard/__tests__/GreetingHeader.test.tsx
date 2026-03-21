import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { GreetingHeader } from '../GreetingHeader';

const defaultProps = {
  user: { id: '1', email: 'test@test.com', name: 'Alice Smith', householdId: 'h1', createdAt: '' },
  paymentMonth: '2026-04',
  onMonthChange: vi.fn(),
  includeInstallments: true,
  onIncludeInstallmentsChange: vi.fn(),
};

function renderHeader(props = {}) {
  return render(
    <MemoryRouter>
      <GreetingHeader {...defaultProps} {...props} />
    </MemoryRouter>
  );
}

describe('GreetingHeader', () => {
  it('should render user first name', () => {
    renderHeader();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('should render greeting based on time of day', () => {
    renderHeader();
    expect(screen.getByText(/Good (morning|afternoon|evening),/)).toBeInTheDocument();
  });

  it('should render month selector', () => {
    renderHeader();
    expect(screen.getByText('April 2026')).toBeInTheDocument();
  });

  it('should render add transaction link', () => {
    renderHeader();
    const link = screen.getByRole('link', { name: /add/i });
    expect(link).toHaveAttribute('href', '/transactions/new');
  });

  it('should toggle installments checkbox', async () => {
    const user = userEvent.setup();
    renderHeader();
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(defaultProps.onIncludeInstallmentsChange).toHaveBeenCalledWith(false);
  });

  it('should handle undefined user', () => {
    renderHeader({ user: undefined });
    expect(screen.getByText('there')).toBeInTheDocument();
  });
});
