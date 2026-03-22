import { useState, useEffect } from 'react';
import { useBudgetOverview, useCreateBudget, useUpdateBudget, useDeleteBudget } from '../hooks/useBudgets';
import { LoadingSpinner, ErrorMessage, Modal, ConfirmDialog } from '../components/common';
import { CategoryBadge } from '../components/CategoryBadge';
import { formatTHB, formatPercentage } from '../lib/format';
import type { CategoryBudgetRow } from '../types';

const STORAGE_KEY = 'budgets-show-unbudgeted';

function getBarColorClass(percentage: number): string {
  if (percentage > 80) return 'bg-danger-400';
  if (percentage > 50) return 'bg-warning-400';
  return 'bg-profit-400';
}

export default function BudgetsPage() {
  const { data, isLoading, error, refetch } = useBudgetOverview();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const [showUnbudgeted, setShowUnbudgeted] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null ? stored === 'true' : true;
  });
  const [editingRow, setEditingRow] = useState<CategoryBudgetRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [monthlyLimit, setMonthlyLimit] = useState(0);
  const [rowToRemoveBudget, setRowToRemoveBudget] = useState<CategoryBudgetRow | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(showUnbudgeted));
  }, [showUnbudgeted]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" data-testid="loading-spinner">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={error instanceof Error ? error.message : 'Failed to load budgets'}
        onRetry={() => refetch()}
      />
    );
  }

  const rows = data || [];
  const budgetedRows = rows.filter((r) => r.budget !== null);
  const unbudgetedRows = rows.filter((r) => r.budget === null);
  const hasUnbudgeted = unbudgetedRows.length > 0;

  const openSetBudgetModal = (row: CategoryBudgetRow) => {
    setEditingRow(row);
    setMonthlyLimit(row.budget?.monthlyLimit || 0);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;

    try {
      if (editingRow.budget) {
        await updateBudget.mutateAsync({
          id: editingRow.budget.id,
          data: { monthlyLimit },
        });
      } else {
        await createBudget.mutateAsync({
          categoryId: editingRow.category.id,
          monthlyLimit,
        });
      }
      setIsModalOpen(false);
      setEditingRow(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleRemoveBudget = async () => {
    if (!rowToRemoveBudget?.budget) return;
    const budgetId = rowToRemoveBudget.budget.id;
    setRowToRemoveBudget(null);
    try {
      await deleteBudget.mutateAsync(budgetId);
    } catch {
      // Error handled by mutation
    }
  };

  const isPending = createBudget.isPending || updateBudget.isPending;

  if (rows.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-[#f0ece4]">Budgets</h1>
        <div className="card text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-[#6b6560]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-[#f0ece4]">No categories</h3>
          <p className="mt-1 text-sm text-[#6b6560]">
            Categories will appear here once they are created.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-[#f0ece4]">Budgets</h1>
        {hasUnbudgeted && (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showUnbudgeted}
              onChange={(e) => setShowUnbudgeted(e.target.checked)}
              className="h-4 w-4 rounded border-white/10 bg-surface-alt text-gold-400 focus-visible:ring-2 focus-visible:ring-gold-400/50"
              aria-label="Show unbudgeted"
            />
            <span className="text-sm text-[#a8a29e]">Show unbudgeted</span>
          </label>
        )}
      </div>

      {/* Budget list card */}
      <div className="card divide-y divide-white/[0.06]">
        {/* Budgeted section */}
        {budgetedRows.map((row) => {
          const percentage = row.budget!.monthlyLimit > 0
            ? (row.spent / row.budget!.monthlyLimit) * 100
            : 0;
          const isOverBudget = percentage > 100;

          return (
            <div key={row.category.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              {/* Category badge */}
              <div className="w-32 shrink-0">
                <CategoryBadge category={row.category} size="md" />
              </div>

              {/* Progress section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className={`font-mono text-sm tabular-nums ${isOverBudget ? 'text-danger-400' : 'text-[#f0ece4]'}`}>
                    {formatTHB(row.spent)}
                  </span>
                  <span className="font-mono text-sm tabular-nums text-[#6b6560]">
                    {formatTHB(row.budget!.monthlyLimit)}
                  </span>
                </div>
                <div
                  className="w-full bg-surface-alt rounded-full h-2"
                  role="progressbar"
                  aria-valuenow={Math.min(percentage, 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`h-2 rounded-full transition-[width] duration-300 motion-reduce:transition-none ${getBarColorClass(percentage)} ${isOverBudget ? 'animate-pulse motion-reduce:animate-none' : ''}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <p className={`mt-1 text-xs ${isOverBudget ? 'text-danger-400' : 'text-[#6b6560]'}`}>
                  {isOverBudget
                    ? `Over budget by ${formatTHB(row.spent - row.budget!.monthlyLimit)}`
                    : `${formatPercentage(percentage)} used`}
                </p>
              </div>

              {/* Edit button */}
              <button
                onClick={() => openSetBudgetModal(row)}
                className="shrink-0 p-2 rounded-lg text-[#6b6560] hover:text-[#a8a29e] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/50"
                aria-label="Edit budget"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                </svg>
              </button>
            </div>
          );
        })}

        {/* Divider + Unbudgeted section */}
        {showUnbudgeted && unbudgetedRows.length > 0 && (
          <>
            {budgetedRows.length > 0 && (
              <div className="py-3">
                <span className="text-xs font-medium uppercase tracking-wider text-[#6b6560]">
                  No budget set
                </span>
              </div>
            )}
            {unbudgetedRows.map((row) => (
              <div key={row.category.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                {/* Category badge */}
                <div className="w-32 shrink-0">
                  <CategoryBadge category={row.category} size="md" />
                </div>

                {/* Spending info */}
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-sm tabular-nums text-[#a8a29e]">
                    {formatTHB(row.spent)}
                  </span>
                  <span className="ml-2 text-xs text-[#6b6560]">no limit</span>
                </div>

                {/* Set budget button */}
                <button
                  onClick={() => openSetBudgetModal(row)}
                  className="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-gold-400 hover:text-gold-300 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/50"
                >
                  Set Budget
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Set/Edit Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingRow(null); }}
        title={editingRow?.budget ? `Edit Budget — ${editingRow.category.label}` : `Set Budget — ${editingRow?.category.label || ''}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="monthlyLimit" className="label">
              Monthly Limit (THB)
            </label>
            <input
              id="monthlyLimit"
              type="number"
              name="monthlyLimit"
              required
              min={0}
              step={100}
              value={monthlyLimit || ''}
              onChange={(e) => setMonthlyLimit(Number(e.target.value))}
              className="input-field"
              placeholder="e.g. 10,000"
              autoComplete="off"
            />
          </div>

          <div className="flex items-center justify-between mt-6">
            {/* Remove budget (only if editing existing) */}
            <div>
              {editingRow?.budget && (
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setRowToRemoveBudget(editingRow);
                  }}
                  className="rounded-lg text-sm text-danger-400 hover:text-red-300 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-400/50"
                >
                  Remove Budget
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); setEditingRow(null); }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" disabled={isPending} className="btn-primary">
                {isPending ? 'Saving\u2026' : editingRow?.budget ? 'Update' : 'Set Budget'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirm Remove Budget */}
      <ConfirmDialog
        isOpen={!!rowToRemoveBudget}
        onClose={() => setRowToRemoveBudget(null)}
        onConfirm={handleRemoveBudget}
        title="Remove Budget"
        message={`Remove the budget for "${rowToRemoveBudget?.category?.label || ''}"? Spending data will be preserved.`}
        confirmText="Remove"
        isLoading={deleteBudget.isPending}
      />
    </div>
  );
}
