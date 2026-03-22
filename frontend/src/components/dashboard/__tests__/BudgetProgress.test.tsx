import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BudgetProgress } from '../BudgetProgress';
import type { Budget } from '../../../types';

const makeBudget = (overrides: Partial<Budget> & { spent?: number } = {}): Budget => ({
  id: 'b1',
  householdId: 'h1',
  categoryId: 'cat-1',
  category: { id: 'cat-1', householdId: 'h1', name: 'FOOD', label: 'Food', color: '#ef4444', icon: null, sortOrder: 0, isSystem: true, createdAt: '', updatedAt: '' },
  monthlyLimit: 10000,
  spent: 3000,
  createdAt: '',
  ...overrides,
});

function renderBudgets(budgets: Budget[]) {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <BudgetProgress budgets={budgets} />
    </MemoryRouter>
  );
}

describe('BudgetProgress', () => {
  it('should render empty state when no budgets', () => {
    renderBudgets([]);
    expect(screen.getByText('No budgets set')).toBeInTheDocument();
    expect(screen.getByText('Set up budgets')).toBeInTheDocument();
  });

  it('should render budget progress bars', () => {
    renderBudgets([makeBudget()]);
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show green for under 50% usage', () => {
    const { container } = renderBudgets([makeBudget({ spent: 3000, monthlyLimit: 10000 })]);
    const fill = container.querySelector('.progress-bar-fill');
    expect(fill).toHaveClass('bg-profit-400');
  });

  it('should show amber for 50-80% usage', () => {
    const { container } = renderBudgets([makeBudget({ spent: 7000, monthlyLimit: 10000 })]);
    const fill = container.querySelector('.progress-bar-fill');
    expect(fill).toHaveClass('bg-warning-400');
  });

  it('should show red for over 80% usage', () => {
    const { container } = renderBudgets([makeBudget({ spent: 9000, monthlyLimit: 10000 })]);
    const fill = container.querySelector('.progress-bar-fill');
    expect(fill).toHaveClass('bg-danger-400');
  });

  it('should show red with pulse for over budget', () => {
    const { container } = renderBudgets([makeBudget({ spent: 12000, monthlyLimit: 10000 })]);
    const fill = container.querySelector('.progress-bar-fill');
    expect(fill).toHaveClass('bg-danger-400');
    expect(fill).toHaveClass('animate-pulse');
  });

  it('should show view all link when more than 6 budgets', () => {
    const budgets = Array.from({ length: 7 }, (_, i) =>
      makeBudget({ id: `b${i}`, categoryId: `cat-${i}`, category: { ...makeBudget().category, id: `cat-${i}`, label: `Cat ${i}` } })
    );
    renderBudgets(budgets);
    expect(screen.getByText('View all')).toBeInTheDocument();
  });
});
