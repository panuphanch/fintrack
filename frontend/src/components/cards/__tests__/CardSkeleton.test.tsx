import { render, screen } from '@testing-library/react';
import { CardSkeleton } from '../CardSkeleton';

describe('CardSkeleton', () => {
  it('renders 3 skeleton cards by default', () => {
    render(<CardSkeleton />);
    const skeletons = screen.getAllByTestId('card-skeleton');
    expect(skeletons).toHaveLength(3);
  });

  it('renders specified number of skeleton cards', () => {
    render(<CardSkeleton count={5} />);
    const skeletons = screen.getAllByTestId('card-skeleton');
    expect(skeletons).toHaveLength(5);
  });

  it('renders 1 skeleton when count is 1', () => {
    render(<CardSkeleton count={1} />);
    const skeletons = screen.getAllByTestId('card-skeleton');
    expect(skeletons).toHaveLength(1);
  });

  it('each skeleton has shimmer animation class', () => {
    render(<CardSkeleton count={2} />);
    const skeletons = screen.getAllByTestId('card-skeleton');
    skeletons.forEach((skeleton) => {
      expect(skeleton.querySelector('.skeleton')).toBeInTheDocument();
    });
  });

  it('renders in a responsive grid', () => {
    const { container } = render(<CardSkeleton />);
    const grid = container.firstElementChild;
    expect(grid?.className).toContain('grid');
  });
});
