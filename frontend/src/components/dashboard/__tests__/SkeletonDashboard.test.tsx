import { render } from '@testing-library/react';
import { SkeletonDashboard } from '../SkeletonDashboard';

describe('SkeletonDashboard', () => {
  it('should render without errors', () => {
    const { container } = render(<SkeletonDashboard />);
    expect(container.querySelector('.skeleton')).toBeInTheDocument();
  });

  it('should render skeleton cards grid', () => {
    const { container } = render(<SkeletonDashboard />);
    const skeletons = container.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThan(10);
  });
});
