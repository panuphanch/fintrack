import { useState } from 'react';
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from '../hooks/useBudgets';
import { useCategories } from '../hooks/useCategories';
import { LoadingSpinner, ErrorMessage, Modal, ConfirmDialog } from '../components/common';
import { CategoryBadge } from '../components/CategoryBadge';
import { formatTHB, formatPercentage } from '../lib/format';
import type { Budget } from '../types';

export default function BudgetsPage() {
  const { data: budgets, isLoading, error, refetch } = useBudgets();
  const { data: categories } = useCategories();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    monthlyLimit: 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
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

  const openCreateModal = () => {
    // Find first category without budget
    const existingCategoryIds = budgets?.map((b) => b.categoryId) || [];
    const availableCategory = categories?.find((c) => !existingCategoryIds.includes(c.id));
    setFormData({
      categoryId: availableCategory?.id || '',
      monthlyLimit: 0,
    });
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const openEditModal = (budget: Budget) => {
    setFormData({
      categoryId: budget.categoryId,
      monthlyLimit: budget.monthlyLimit,
    });
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBudget) {
        await updateBudget.mutateAsync({
          id: editingBudget.id,
          data: { monthlyLimit: formData.monthlyLimit },
        });
      } else {
        await createBudget.mutateAsync(formData);
      }
      setIsModalOpen(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!budgetToDelete) return;
    const idToDelete = budgetToDelete.id;
    setBudgetToDelete(null); // Close dialog first
    try {
      await deleteBudget.mutateAsync(idToDelete);
    } catch {
      // Error handled by mutation
    }
  };

  const existingCategoryIds = budgets?.map((b) => b.categoryId) || [];
  const availableCategories = categories?.filter((c) => !existingCategoryIds.includes(c.id)) || [];
  const isPending = createBudget.isPending || updateBudget.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#f0ece4]">Budgets</h1>
        {availableCategories.length > 0 && (
          <button onClick={openCreateModal} className="btn-primary">
            Set Budget
          </button>
        )}
      </div>

      {budgets && budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const spent = budget.spent || 0;
            const percentage = budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0;
            const isOverBudget = percentage > 100;

            return (
              <div key={budget.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    {budget.category && <CategoryBadge category={budget.category} />}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(budget)}
                      className="text-[#6b6560] hover:text-[#a8a29e]"
                      aria-label="Edit budget"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setBudgetToDelete(budget)}
                      className="text-[#6b6560] hover:text-red-400"
                      aria-label="Delete budget"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b6560]">Spent</span>
                    <span className={`font-medium ${isOverBudget ? 'text-red-400' : 'text-[#f0ece4]'}`}>
                      {formatTHB(spent)} / {formatTHB(budget.monthlyLimit)}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-surface-alt rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <p className={`mt-1 text-sm ${isOverBudget ? 'text-red-400' : 'text-[#6b6560]'}`}>
                    {isOverBudget
                      ? `Over budget by ${formatTHB(spent - budget.monthlyLimit)}`
                      : `${formatPercentage(percentage)} used`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
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
          <h3 className="mt-2 text-sm font-medium text-[#f0ece4]">No budgets set</h3>
          <p className="mt-1 text-sm text-[#6b6560]">
            Set monthly spending limits for different categories.
          </p>
          <div className="mt-6">
            <button onClick={openCreateModal} className="btn-primary">
              Set Budget
            </button>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBudget ? 'Edit Budget' : 'Set Budget'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingBudget && (
            <div>
              <label htmlFor="categoryId" className="label">
                Category
              </label>
              <select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="input-field"
              >
                <option value="">Select a category</option>
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="monthlyLimit" className="label">
              Monthly Limit (THB)
            </label>
            <input
              id="monthlyLimit"
              type="number"
              required
              min={0}
              step={100}
              value={formData.monthlyLimit || ''}
              onChange={(e) => setFormData({ ...formData, monthlyLimit: Number(e.target.value) })}
              className="input-field"
              placeholder="10000"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? 'Saving\u2026' : editingBudget ? 'Update' : 'Set Budget'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!budgetToDelete}
        onClose={() => setBudgetToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Budget"
        message={`Are you sure you want to delete the budget for "${budgetToDelete?.category?.label || ''}"?`}
        confirmText="Delete"
        isLoading={deleteBudget.isPending}
      />
    </div>
  );
}
