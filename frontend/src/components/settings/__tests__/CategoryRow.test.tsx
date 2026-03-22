import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryRow } from '../CategoryRow';
import type { Category } from '../../../types';

vi.mock('../../IconPicker', () => ({
  CategoryIcon: ({ name, color }: { name: string | null | undefined; color?: string }) => (
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

const defaultProps = {
  category: makeCategory(),
  index: 1,
  totalCount: 5,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onMoveUp: vi.fn(),
  onMoveDown: vi.fn(),
  isReordering: false,
};

describe('CategoryRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the category label', () => {
    render(<CategoryRow {...defaultProps} />);
    expect(screen.getByText('Food & Dining')).toBeInTheDocument();
  });

  it('renders the internal name', () => {
    render(<CategoryRow {...defaultProps} />);
    expect(screen.getByText('FOOD_DINING')).toBeInTheDocument();
  });

  it('renders the category icon', () => {
    render(<CategoryRow {...defaultProps} />);
    expect(screen.getByTestId('category-icon')).toBeInTheDocument();
  });

  it('renders color bar with category color', () => {
    const { container } = render(<CategoryRow {...defaultProps} />);
    const colorBar = container.querySelector('[data-testid="color-bar"]');
    expect(colorBar).toHaveStyle({ backgroundColor: '#ef4444' });
  });

  it('shows System badge for system categories', () => {
    render(<CategoryRow {...defaultProps} />);
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('hides System badge for custom categories', () => {
    render(<CategoryRow {...defaultProps} category={makeCategory({ isSystem: false })} />);
    expect(screen.queryByText('System')).not.toBeInTheDocument();
  });

  it('hides delete button for system categories', () => {
    render(<CategoryRow {...defaultProps} />);
    expect(screen.queryByLabelText('Delete category')).not.toBeInTheDocument();
  });

  it('shows delete button for custom categories', () => {
    render(<CategoryRow {...defaultProps} category={makeCategory({ isSystem: false })} />);
    expect(screen.getByLabelText('Delete category')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<CategoryRow {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Edit category'));
    expect(defaultProps.onEdit).toHaveBeenCalledWith(defaultProps.category);
  });

  it('calls onDelete when delete button is clicked', () => {
    const cat = makeCategory({ isSystem: false });
    render(<CategoryRow {...defaultProps} category={cat} />);
    fireEvent.click(screen.getByLabelText('Delete category'));
    expect(defaultProps.onDelete).toHaveBeenCalledWith(cat);
  });

  it('calls onMoveUp when up button is clicked', () => {
    render(<CategoryRow {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Move up'));
    expect(defaultProps.onMoveUp).toHaveBeenCalledWith('cat1');
  });

  it('calls onMoveDown when down button is clicked', () => {
    render(<CategoryRow {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Move down'));
    expect(defaultProps.onMoveDown).toHaveBeenCalledWith('cat1');
  });

  it('disables up button when first item', () => {
    render(<CategoryRow {...defaultProps} index={0} />);
    expect(screen.getByLabelText('Move up')).toBeDisabled();
  });

  it('disables down button when last item', () => {
    render(<CategoryRow {...defaultProps} index={4} totalCount={5} />);
    expect(screen.getByLabelText('Move down')).toBeDisabled();
  });

  it('disables reorder buttons when reordering is in progress', () => {
    render(<CategoryRow {...defaultProps} isReordering />);
    expect(screen.getByLabelText('Move up')).toBeDisabled();
    expect(screen.getByLabelText('Move down')).toBeDisabled();
  });
});
