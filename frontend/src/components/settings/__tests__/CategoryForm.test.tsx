import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryForm } from '../CategoryForm';
import type { CreateCategoryInput } from '../../../types';

vi.mock('../../IconPicker', () => ({
  IconPicker: ({ value, onChange, color }: any) => (
    <div data-testid="icon-picker" data-value={value}>
      <button onClick={() => onChange('star')} data-testid="pick-icon">Pick</button>
    </div>
  ),
  CategoryIcon: ({ name, color }: any) => (
    <span data-testid="category-icon" data-icon={name} style={{ color }} />
  ),
}));

const defaultProps = {
  isEditing: false,
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
  isPending: false,
  error: null as Error | null,
};

describe('CategoryForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Display Name input', () => {
    render(<CategoryForm {...defaultProps} />);
    expect(screen.getByLabelText('Display Name')).toBeInTheDocument();
  });

  it('renders Internal Name input', () => {
    render(<CategoryForm {...defaultProps} />);
    expect(screen.getByLabelText(/internal name/i)).toBeInTheDocument();
  });

  it('auto-generates internal name from display name when not editing', () => {
    render(<CategoryForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Food & Dining' } });
    expect(screen.getByLabelText(/internal name/i)).toHaveValue('FOOD_&_DINING');
  });

  it('renders color preset buttons', () => {
    render(<CategoryForm {...defaultProps} />);
    const colorButtons = screen.getAllByLabelText(/select color/i);
    expect(colorButtons.length).toBeGreaterThan(0);
  });

  it('renders icon picker', () => {
    render(<CategoryForm {...defaultProps} />);
    expect(screen.getByTestId('icon-picker')).toBeInTheDocument();
  });

  it('renders preview section', () => {
    render(<CategoryForm {...defaultProps} />);
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('shows error message when error is provided', () => {
    render(<CategoryForm {...defaultProps} error={new Error('Category already exists')} />);
    expect(screen.getByText('Category already exists')).toBeInTheDocument();
  });

  it('shows "Add Category" button when not editing', () => {
    render(<CategoryForm {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Add Category' })).toBeInTheDocument();
  });

  it('shows "Update" button when editing', () => {
    render(<CategoryForm {...defaultProps} isEditing />);
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
  });

  it('shows "Saving\u2026" when pending', () => {
    render(<CategoryForm {...defaultProps} isPending />);
    expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', () => {
    render(<CategoryForm {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onCancel).toHaveBeenCalledOnce();
  });

  it('calls onSubmit with form data on submit', () => {
    render(<CategoryForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Pets' } });
    fireEvent.submit(screen.getByRole('form'));
    expect(defaultProps.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Pets', name: 'PETS' }),
    );
  });

  it('pre-fills form when initialData is provided', () => {
    const initialData: CreateCategoryInput = {
      name: 'CUSTOM',
      label: 'Custom Category',
      color: '#ef4444',
      icon: 'star',
    };
    render(<CategoryForm {...defaultProps} initialData={initialData} isEditing />);
    expect(screen.getByLabelText('Display Name')).toHaveValue('Custom Category');
    expect(screen.getByLabelText(/internal name/i)).toHaveValue('CUSTOM');
  });
});
