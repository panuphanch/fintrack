import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from './ConfirmDialog';

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  title: 'Delete Item',
  message: 'Are you sure you want to delete this item?',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ConfirmDialog', () => {
  it('should render title and message', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
  });

  it('should render default button text', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('should render custom button text', () => {
    render(
      <ConfirmDialog {...defaultProps} confirmText="Delete" cancelText="Keep" />
    );

    expect(screen.getByText('Keep')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', async () => {
    render(<ConfirmDialog {...defaultProps} />);

    await userEvent.click(screen.getByText('Confirm'));

    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('should call onClose when cancel button is clicked', async () => {
    render(<ConfirmDialog {...defaultProps} />);

    await userEvent.click(screen.getByText('Cancel'));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should disable buttons when loading', () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />);

    expect(screen.getByText('Loading\u2026')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeDisabled();
    expect(screen.getByText('Loading\u2026')).toBeDisabled();
  });

  it('should apply danger variant class by default', () => {
    render(<ConfirmDialog {...defaultProps} />);

    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton.className).toContain('btn-danger');
  });

  it('should apply primary variant class', () => {
    render(<ConfirmDialog {...defaultProps} variant="primary" />);

    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton.className).toContain('btn-primary');
  });
});
