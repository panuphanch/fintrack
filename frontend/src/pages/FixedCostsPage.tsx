import { useState } from 'react';
import { useFixedCosts, useCreateFixedCost, useUpdateFixedCost, useDeleteFixedCost, useFixedCostsMonthlyTotal } from '../hooks/useFixedCosts';
import { useCategories } from '../hooks/useCategories';
import { LoadingSpinner, ErrorMessage, Modal, ConfirmDialog, ToggleSwitch } from '../components/common';
import { CategoryBadge } from '../components/CategoryBadge';
import { formatTHB } from '../lib/format';
import type { FixedCost, CreateFixedCostInput } from '../types';

// Empty form will be populated with default category when loaded
const getEmptyForm = (defaultCategoryId: string): CreateFixedCostInput => ({
  name: '',
  amount: 0,
  categoryId: defaultCategoryId,
  dueDay: undefined,
  notes: '',
});

export default function FixedCostsPage() {
  const [showInactive, setShowInactive] = useState(false);
  const { data: fixedCosts, isLoading, error, refetch } = useFixedCosts(!showInactive);
  const { data: categories } = useCategories();
  const { data: monthlyTotal } = useFixedCostsMonthlyTotal();
  const createFixedCost = useCreateFixedCost();
  const updateFixedCost = useUpdateFixedCost();
  const deleteFixedCost = useDeleteFixedCost();

  // Get default category (FIXED) ID
  const defaultCategoryId = categories?.find(c => c.name === 'FIXED')?.id || '';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<FixedCost | null>(null);
  const [costToDelete, setCostToDelete] = useState<FixedCost | null>(null);
  const [formData, setFormData] = useState<CreateFixedCostInput>(getEmptyForm(''));

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
        message={error instanceof Error ? error.message : 'Failed to load fixed costs'}
        onRetry={() => refetch()}
      />
    );
  }

  const openCreateModal = () => {
    setFormData(getEmptyForm(defaultCategoryId));
    setEditingCost(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cost: FixedCost) => {
    setFormData({
      name: cost.name,
      amount: cost.amount,
      categoryId: cost.categoryId,
      dueDay: cost.dueDay || undefined,
      notes: cost.notes || '',
    });
    setEditingCost(cost);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCost) {
        await updateFixedCost.mutateAsync({
          id: editingCost.id,
          data: formData,
        });
      } else {
        await createFixedCost.mutateAsync(formData);
      }
      setIsModalOpen(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleToggleActive = async (cost: FixedCost) => {
    try {
      await updateFixedCost.mutateAsync({
        id: cost.id,
        data: { isActive: !cost.isActive },
      });
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!costToDelete) return;
    const idToDelete = costToDelete.id;
    setCostToDelete(null); // Close dialog first
    try {
      await deleteFixedCost.mutateAsync(idToDelete);
    } catch {
      // Error handled by mutation
    }
  };

  const isPending = createFixedCost.isPending || updateFixedCost.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f0ece4]">Fixed Costs</h1>
          {monthlyTotal && (
            <p className="text-sm text-[#6b6560]">
              Monthly Total: <span className="font-semibold text-[#f0ece4]">{formatTHB(monthlyTotal.total)}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-[#a8a29e]">
            <input
              type="checkbox"
              name="showInactive"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-white/10 text-blue-600 focus:ring-blue-500"
            />
            Show inactive
          </label>
          <button onClick={openCreateModal} className="btn-primary">
            Add Fixed Cost
          </button>
        </div>
      </div>

      {fixedCosts && fixedCosts.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-white/[0.06]">
          <table className="min-w-full divide-y divide-white/[0.06]">
            <thead className="bg-surface-alt">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6b6560] uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6b6560] uppercase">Category</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[#6b6560] uppercase">Due Day</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#6b6560] uppercase">Amount</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[#6b6560] uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#6b6560] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-white/[0.06]">
              {fixedCosts.map((cost) => (
                <tr key={cost.id} className={!cost.isActive ? 'bg-surface-alt opacity-60' : ''}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#f0ece4]">{cost.name}</div>
                    {cost.notes && (
                      <div className="text-xs text-[#6b6560]">{cost.notes}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {cost.category && <CategoryBadge category={cost.category} />}
                  </td>
                  <td className="px-4 py-3 text-center text-[#a8a29e]">
                    {cost.dueDay ? `Day ${cost.dueDay}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[#f0ece4]">
                    {formatTHB(cost.amount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ToggleSwitch
                      checked={cost.isActive}
                      onChange={() => handleToggleActive(cost)}
                      disabled={updateFixedCost.isPending}
                      label={cost.isActive ? 'Active' : 'Inactive'}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(cost)}
                        className="text-[#6b6560] hover:text-[#a8a29e]"
                        aria-label="Edit fixed cost"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setCostToDelete(cost)}
                        className="text-[#6b6560] hover:text-red-400"
                        aria-label="Delete fixed cost"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-surface-alt">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-[#a8a29e]">
                  Total
                </td>
                <td className="px-4 py-3 text-right text-lg font-bold text-[#f0ece4]">
                  {formatTHB(fixedCosts.filter(c => c.isActive).reduce((sum, c) => sum + c.amount, 0))}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="card text-center py-12">
          <svg className="mx-auto h-12 w-12 text-[#6b6560]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-[#f0ece4]">No fixed costs</h3>
          <p className="mt-1 text-sm text-[#6b6560]">
            Add your recurring monthly expenses like loans, bills, and savings.
          </p>
          <div className="mt-6">
            <button onClick={openCreateModal} className="btn-primary">
              Add Fixed Cost
            </button>
          </div>
        </div>
      )}

      {/* Fixed Cost Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCost ? 'Edit Fixed Cost' : 'Add Fixed Cost'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="label">Name</label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="e.g., Home Loan, Electric Bill"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="label">Amount (THB)</label>
              <input
                id="amount"
                type="number"
                required
                min={0}
                step={0.01}
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="dueDay" className="label">Due Day (optional)</label>
              <input
                id="dueDay"
                type="number"
                min={1}
                max={31}
                value={formData.dueDay || ''}
                onChange={(e) => setFormData({ ...formData, dueDay: e.target.value ? Number(e.target.value) : undefined })}
                className="input-field"
                placeholder="1-31"
              />
            </div>
          </div>

          <div>
            <label htmlFor="categoryId" className="label">Category</label>
            <select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="input-field"
            >
              <option value="">Select a category</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="label">Notes (optional)</label>
            <textarea
              id="notes"
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              placeholder="Any additional notes\u2026"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? 'Saving\u2026' : editingCost ? 'Update' : 'Add Fixed Cost'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!costToDelete}
        onClose={() => setCostToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Fixed Cost"
        message={`Are you sure you want to delete "${costToDelete?.name}"?`}
        confirmText="Delete"
        isLoading={deleteFixedCost.isPending}
      />
    </div>
  );
}
