import { useState } from 'react';
import { useInstallments, useCreateInstallment, useUpdateInstallment, useIncrementInstallment, useDeleteInstallment, useInstallmentsMonthlyTotal } from '../hooks/useInstallments';
import { useCards } from '../hooks/useCards';
import { useCategories } from '../hooks/useCategories';
import { LoadingSpinner, ErrorMessage, Modal, ConfirmDialog } from '../components/common';
import { CategoryBadge } from '../components/CategoryBadge';
import { formatTHB } from '../lib/format';
import type { Installment, CreateInstallmentInput } from '../types';

// Empty form will be populated with default category when loaded
const getEmptyForm = (defaultCategoryId: string): CreateInstallmentInput => ({
  name: '',
  totalAmount: 0,
  monthlyAmount: 0,
  totalInstallments: 1,
  currentInstallment: 1,
  categoryId: defaultCategoryId,
  startDate: new Date().toISOString().split('T')[0],
  cardId: undefined,
  notes: '',
});

export default function InstallmentsPage() {
  const [showInactive, setShowInactive] = useState(false);
  const { data: installments, isLoading, error, refetch } = useInstallments(!showInactive);
  const { data: cards } = useCards();
  const { data: categories } = useCategories();
  const { data: monthlyTotal } = useInstallmentsMonthlyTotal();
  const createInstallment = useCreateInstallment();
  const updateInstallment = useUpdateInstallment();
  const incrementInstallment = useIncrementInstallment();
  const deleteInstallment = useDeleteInstallment();

  // Get default category (OTHERS) ID
  const defaultCategoryId = categories?.find(c => c.name === 'OTHERS')?.id || '';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstallment, setEditingInstallment] = useState<Installment | null>(null);
  const [installmentToDelete, setInstallmentToDelete] = useState<Installment | null>(null);
  const [formData, setFormData] = useState<CreateInstallmentInput>(getEmptyForm(''));

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
        message={error instanceof Error ? error.message : 'Failed to load installments'}
        onRetry={() => refetch()}
      />
    );
  }

  const openCreateModal = () => {
    setFormData(getEmptyForm(defaultCategoryId));
    setEditingInstallment(null);
    setIsModalOpen(true);
  };

  const openEditModal = (installment: Installment) => {
    setFormData({
      name: installment.name,
      totalAmount: installment.totalAmount,
      monthlyAmount: installment.monthlyAmount,
      totalInstallments: installment.totalInstallments,
      currentInstallment: installment.currentInstallment,
      categoryId: installment.categoryId,
      startDate: installment.startDate.split('T')[0],
      cardId: installment.cardId || undefined,
      notes: installment.notes || '',
    });
    setEditingInstallment(installment);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingInstallment) {
        await updateInstallment.mutateAsync({
          id: editingInstallment.id,
          data: formData,
        });
      } else {
        await createInstallment.mutateAsync(formData);
      }
      setIsModalOpen(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleIncrement = async (id: string) => {
    try {
      await incrementInstallment.mutateAsync(id);
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!installmentToDelete) return;
    const idToDelete = installmentToDelete.id;
    setInstallmentToDelete(null); // Close dialog first
    try {
      await deleteInstallment.mutateAsync(idToDelete);
    } catch {
      // Error handled by mutation
    }
  };

  const isPending = createInstallment.isPending || updateInstallment.isPending;

  // Group by card
  const groupedInstallments = installments?.reduce((acc, inst) => {
    const cardName = inst.card?.name || 'No Card';
    if (!acc[cardName]) acc[cardName] = [];
    acc[cardName].push(inst);
    return acc;
  }, {} as Record<string, Installment[]>) || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f0ece4]">Installments</h1>
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
              name="showCompleted"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-white/10 text-blue-600 focus:ring-blue-500"
            />
            Show completed
          </label>
          <button onClick={openCreateModal} className="btn-primary">
            Add Installment
          </button>
        </div>
      </div>

      {installments && installments.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedInstallments).map(([cardName, items]) => {
            const cardColor = items[0]?.card?.color || '#6b7280';
            const cardTotal = items.reduce((sum, i) => sum + i.monthlyAmount, 0);

            return (
              <div key={cardName} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: cardColor }}
                    />
                    <h2 className="text-lg font-semibold text-[#f0ece4]">{cardName}</h2>
                  </div>
                  <span className="text-sm font-medium text-[#a8a29e]">
                    Subtotal: {formatTHB(cardTotal)}
                  </span>
                </div>

                <div className="overflow-hidden rounded-lg border border-white/[0.06]">
                  <table className="min-w-full divide-y divide-white/[0.06]">
                    <thead className="bg-surface-alt">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#6b6560] uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#6b6560] uppercase">Category</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#6b6560] uppercase">Monthly</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-[#6b6560] uppercase">Progress</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#6b6560] uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-white/[0.06]">
                      {items.map((installment) => {
                        const isComplete = installment.currentInstallment >= installment.totalInstallments;
                        const progress = (installment.currentInstallment / installment.totalInstallments) * 100;

                        return (
                          <tr key={installment.id} className={isComplete ? 'bg-surface-alt' : ''}>
                            <td className="px-4 py-3">
                              <div className="font-medium text-[#f0ece4]">{installment.name}</div>
                              {installment.notes && (
                                <div className="text-xs text-[#6b6560]">{installment.notes}</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {installment.category && (
                                <CategoryBadge category={installment.category} />
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-[#f0ece4] tabular-nums">
                              {formatTHB(installment.monthlyAmount)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-24 bg-surface-alt rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${isComplete ? 'bg-emerald-400' : 'bg-gold-400'}`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className={`text-sm font-medium ${isComplete ? 'text-emerald-400' : 'text-[#a8a29e]'}`}>
                                  {installment.currentInstallment}/{installment.totalInstallments}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {!isComplete && (
                                  <button
                                    onClick={() => handleIncrement(installment.id)}
                                    disabled={incrementInstallment.isPending}
                                    className="text-green-600 hover:text-green-800 font-medium text-sm"
                                    title="Mark next payment"
                                  >
                                    +1
                                  </button>
                                )}
                                <button
                                  onClick={() => openEditModal(installment)}
                                  className="text-[#6b6560] hover:text-[#a8a29e]"
                                  aria-label="Edit installment"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => setInstallmentToDelete(installment)}
                                  className="text-[#6b6560] hover:text-red-400"
                                  aria-label="Delete installment"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-12">
          <svg className="mx-auto h-12 w-12 text-[#6b6560]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-[#f0ece4]">No installments</h3>
          <p className="mt-1 text-sm text-[#6b6560]">
            Add your installment purchases to track payment progress.
          </p>
          <div className="mt-6">
            <button onClick={openCreateModal} className="btn-primary">
              Add Installment
            </button>
          </div>
        </div>
      )}

      {/* Installment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingInstallment ? 'Edit Installment' : 'Add Installment'}
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
              placeholder="e.g., iPhone 15 Pro"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="totalAmount" className="label">Total Amount (THB)</label>
              <input
                id="totalAmount"
                type="number"
                required
                min={0}
                step={0.01}
                value={formData.totalAmount || ''}
                onChange={(e) => {
                  const total = Number(e.target.value);
                  const monthly = formData.totalInstallments > 0 ? total / formData.totalInstallments : 0;
                  setFormData({ ...formData, totalAmount: total, monthlyAmount: Math.round(monthly * 100) / 100 });
                }}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="totalInstallments" className="label">Total Installments</label>
              <input
                id="totalInstallments"
                type="number"
                required
                min={1}
                max={60}
                value={formData.totalInstallments || ''}
                onChange={(e) => {
                  const total = Number(e.target.value);
                  const monthly = total > 0 ? formData.totalAmount / total : 0;
                  setFormData({ ...formData, totalInstallments: total, monthlyAmount: Math.round(monthly * 100) / 100 });
                }}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="monthlyAmount" className="label">Monthly Amount (THB)</label>
              <input
                id="monthlyAmount"
                type="number"
                required
                min={0}
                step={0.01}
                value={formData.monthlyAmount || ''}
                onChange={(e) => setFormData({ ...formData, monthlyAmount: Number(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="currentInstallment" className="label">Current Installment</label>
              <input
                id="currentInstallment"
                type="number"
                required
                min={1}
                max={formData.totalInstallments || 60}
                value={formData.currentInstallment || 1}
                onChange={(e) => setFormData({ ...formData, currentInstallment: Number(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <label htmlFor="cardId" className="label">Credit Card</label>
              <select
                id="cardId"
                value={formData.cardId || ''}
                onChange={(e) => setFormData({ ...formData, cardId: e.target.value || undefined })}
                className="input-field"
              >
                <option value="">No card</option>
                {cards?.map((card) => (
                  <option key={card.id} value={card.id}>{card.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="startDate" className="label">Start Date</label>
            <input
              id="startDate"
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="input-field"
            />
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
              {isPending ? 'Saving\u2026' : editingInstallment ? 'Update' : 'Add Installment'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!installmentToDelete}
        onClose={() => setInstallmentToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Installment"
        message={`Are you sure you want to delete "${installmentToDelete?.name}"?`}
        confirmText="Delete"
        isLoading={deleteInstallment.isPending}
      />
    </div>
  );
}
