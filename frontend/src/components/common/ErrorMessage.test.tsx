import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('should render error message', () => {
    render(<ErrorMessage message="Something went wrong" />);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should not show retry button when onRetry is not provided', () => {
    render(<ErrorMessage message="Error occurred" />);

    expect(screen.queryByText('Try again')).not.toBeInTheDocument();
  });

  it('should show retry button when onRetry is provided', () => {
    render(<ErrorMessage message="Error occurred" onRetry={() => {}} />);

    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', async () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Error occurred" onRetry={onRetry} />);

    await userEvent.click(screen.getByText('Try again'));

    expect(onRetry).toHaveBeenCalled();
  });
});
