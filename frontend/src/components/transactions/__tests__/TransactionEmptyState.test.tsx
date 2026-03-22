import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TransactionEmptyState from '../TransactionEmptyState';

function renderComponent(props: { hasFilters: boolean; onClearFilters: () => void }) {
  return render(
    <MemoryRouter>
      <TransactionEmptyState {...props} />
    </MemoryRouter>
  );
}

describe('TransactionEmptyState', () => {
  describe('when hasFilters is false', () => {
    it('renders "No transactions yet" heading', () => {
      renderComponent({ hasFilters: false, onClearFilters: vi.fn() });
      expect(screen.getByText('No transactions yet')).toBeInTheDocument();
    });

    it('renders "Add Transaction" link pointing to /transactions/new', () => {
      renderComponent({ hasFilters: false, onClearFilters: vi.fn() });
      const link = screen.getByRole('link', { name: /add transaction/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/transactions/new');
    });

    it('does NOT show "Clear Filters" button', () => {
      renderComponent({ hasFilters: false, onClearFilters: vi.fn() });
      expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument();
    });
  });

  describe('when hasFilters is true', () => {
    it('renders "No transactions match your filters" heading', () => {
      renderComponent({ hasFilters: true, onClearFilters: vi.fn() });
      expect(screen.getByText('No transactions match your filters')).toBeInTheDocument();
    });

    it('renders "Clear Filters" button', () => {
      renderComponent({ hasFilters: true, onClearFilters: vi.fn() });
      expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
    });

    it('calls onClearFilters when "Clear Filters" is clicked', () => {
      const onClearFilters = vi.fn();
      renderComponent({ hasFilters: true, onClearFilters });
      fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));
      expect(onClearFilters).toHaveBeenCalledOnce();
    });

    it('does NOT show "Add Transaction" link', () => {
      renderComponent({ hasFilters: true, onClearFilters: vi.fn() });
      expect(screen.queryByRole('link', { name: /add transaction/i })).not.toBeInTheDocument();
    });
  });
});
