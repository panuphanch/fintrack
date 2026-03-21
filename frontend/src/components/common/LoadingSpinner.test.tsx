import { render } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default md size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner?.className).toContain('h-8 w-8');
  });

  it('should render with sm size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner?.className).toContain('h-4 w-4');
  });

  it('should render with lg size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner?.className).toContain('h-12 w-12');
  });

  it('should accept custom className', () => {
    const { container } = render(<LoadingSpinner className="mt-4" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('mt-4');
  });
});
