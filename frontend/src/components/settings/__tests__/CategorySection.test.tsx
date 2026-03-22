import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CategorySection } from '../CategorySection';
import type { Category } from '../../../types';

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

const makeCategory = (overrides: Partial<Category> = {}): Category => ({
  id: 'cat1',
  householdId: 'h1',
  name: 'FOOD_DINING',
  label: 'Food & Dining',
  color: '#ef4444',
  icon: 'fire',
  sortOrder: 0,
  isSystem: true,
  createdAt: '',
  updatedAt: '',
  ...overrides,
});

const categories = [
  makeCategory(),
  makeCategory({ id: 'cat2', name: 'TRAVEL', label: 'Travel', color: '#14b8a6', icon: 'globe', sortOrder: 1 }),
  makeCategory({ id: 'cat3', name: 'CUSTOM', label: 'Custom', color: '#3b82f6', icon: 'star', sortOrder: 2, isSystem: false }),
];

const defaultProps = {
  categories,
  onCreateCategory: vi.fn().mockResolvedValue(undefined),
  onUpdateCategory: vi.fn().mockResolvedValue(undefined),
  onDeleteCategory: vi.fn().mockResolvedValue(undefined),
  onReorderCategories: vi.fn().mockResolvedValue(undefined),
  isCreatePending: false,
  isUpdatePending: false,
  isDeletePending: false,
  isReorderPending: false,
  createError: null as Error | null,
  updateError: null as Error | null,
};

describe('CategorySection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the section label', () => {
    render(<CategorySection {...defaultProps} />);
    expect(screen.getByText('CATEGORIES')).toBeInTheDocument();
  });

  it('renders category count', () => {
    render(<CategorySection {...defaultProps} />);
    expect(screen.getByText('3 categories')).toBeInTheDocument();
  });

  it('renders singular for 1 category', () => {
    render(<CategorySection {...defaultProps} categories={[categories[0]]} />);
    expect(screen.getByText('1 category')).toBeInTheDocument();
  });

  it('renders Add Category button', () => {
    render(<CategorySection {...defaultProps} />);
    expect(screen.getByRole('button', { name: /add category/i })).toBeInTheDocument();
  });

  it('renders all category labels', () => {
    render(<CategorySection {...defaultProps} />);
    expect(screen.getByText('Food & Dining')).toBeInTheDocument();
    expect(screen.getByText('Travel')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('shows empty state when no categories', () => {
    render(<CategorySection {...defaultProps} categories={[]} />);
    expect(screen.getByText(/no categories/i)).toBeInTheDocument();
  });

  it('opens create modal when Add Category is clicked', () => {
    render(<CategorySection {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /add category/i }));
    expect(screen.getByText('Add Category', { selector: '[class*="font-display"]' })).toBeInTheDocument();
    expect(screen.getByLabelText('Display Name')).toBeInTheDocument();
  });

  it('opens edit modal when edit button is clicked', () => {
    render(<CategorySection {...defaultProps} />);
    const editButtons = screen.getAllByLabelText('Edit category');
    fireEvent.click(editButtons[0]);
    expect(screen.getByText('Edit Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Display Name')).toHaveValue('Food & Dining');
  });

  it('opens delete confirm when delete button is clicked', () => {
    render(<CategorySection {...defaultProps} />);
    const deleteButton = screen.getByLabelText('Delete category');
    fireEvent.click(deleteButton);
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  it('calls onDeleteCategory when delete is confirmed', async () => {
    render(<CategorySection {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Delete category'));
    // The confirm dialog has a "Delete" button (confirmText) - find it within the dialog
    const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i });
    // Click the last one which is the confirm button in the dialog
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);
    await waitFor(() => {
      expect(defaultProps.onDeleteCategory).toHaveBeenCalledWith('cat3');
    });
  });

  it('renders description text', () => {
    render(<CategorySection {...defaultProps} />);
    expect(screen.getByText(/manage spending categories/i)).toBeInTheDocument();
  });
});
