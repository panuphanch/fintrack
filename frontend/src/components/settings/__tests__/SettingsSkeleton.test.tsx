import { render, screen } from '@testing-library/react';
import { SettingsSkeleton } from '../SettingsSkeleton';

describe('SettingsSkeleton', () => {
  it('renders skeleton container with correct testid', () => {
    render(<SettingsSkeleton />);
    expect(screen.getByTestId('settings-skeleton')).toBeInTheDocument();
  });

  it('renders profile skeleton with avatar circle and text bars', () => {
    render(<SettingsSkeleton />);
    const profileSection = screen.getByTestId('skeleton-profile');
    expect(profileSection).toBeInTheDocument();
    expect(profileSection.querySelector('[data-testid="skeleton-circle"]')).toBeInTheDocument();
    expect(profileSection.querySelectorAll('[data-testid="skeleton-bar"]').length).toBeGreaterThanOrEqual(2);
  });

  it('renders household skeleton with 2 member rows', () => {
    render(<SettingsSkeleton />);
    const householdSection = screen.getByTestId('skeleton-household');
    expect(householdSection).toBeInTheDocument();
    const rows = householdSection.querySelectorAll('[data-testid="skeleton-member-row"]');
    expect(rows).toHaveLength(2);
  });

  it('renders categories skeleton with 4 category rows', () => {
    render(<SettingsSkeleton />);
    const categoriesSection = screen.getByTestId('skeleton-categories');
    expect(categoriesSection).toBeInTheDocument();
    const rows = categoriesSection.querySelectorAll('[data-testid="skeleton-category-row"]');
    expect(rows).toHaveLength(4);
  });

  it('uses skeleton class for shimmer animation', () => {
    render(<SettingsSkeleton />);
    const skeletonElements = document.querySelectorAll('.skeleton');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });
});
