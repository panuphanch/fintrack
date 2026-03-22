import { useState } from 'react';
import { useInstallments, useCreateInstallment, useUpdateInstallment, useIncrementInstallment, useDeleteInstallment, useInstallmentsMonthlyTotal } from '../hooks/useInstallments';
import { useCards } from '../hooks/useCards';
import { useCategories } from '../hooks/useCategories';
import { ErrorMessage, Modal, ConfirmDialog, ToggleSwitch } from '../components/common';
import { InstallmentSummaryBar, InstallmentCardGroup, InstallmentEmptyState, InstallmentSkeleton } from '../components/installments';
import { groupInstallmentsByCard } from '../lib/groupInstallmentsByCard';
import type { Installment, CreateInstallmentInput } from '../types';

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
  const [showCompleted, setShowCompleted] = useState(() =>
    localStorage.getItem('installments-showCompleted') === 'true'
  );
  const { data: installments, isLoading, error, refetch } = useInstallments(!showCompleted);
  const { data: cards } = useCards();
  const { data: categories } = useCategories();
  const { data: monthlyTotal } = useInstallmentsMonthlyTotal();
  const createInstallment = useCreateInstallment();
  const updateInstallment = useUpdateInstallment();
  const incrementInstallment = useIncrementInstallment();
  const deleteInstallment = useDeleteInstallment();

  const defaultCategoryId = categories?.find(c => c.name === 'OTHERS')?.id || '';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstallment, setEditingInstallment] = useState<Installment | null>(null);
  const [installmentToDelete, setInstallmentToDelete] = useState<Installment | null>(null);
  const [formData, setFormData] = useState<CreateInstallmentInput>(getEmptyForm(''));

  const toggleShowCompleted = () => {
    const next = !showCompleted;
    setShowCompleted(next);
    localStorage.setItem('installments-showCompleted', String(next));
  };

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
        await updateInstallment.mutateAsync({ id: editingInstallment.id, data: formData });
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
    setInstallmentToDelete(null);
    try {
      await deleteInstallment.mutateAsync(idToDelete);
    } catch {
      // Error handled by mutation
    }
  };

  const isPending = createInstallment.isPending || updateInstallment.isPending;

  // Compute stats
  const activeCount = installments?.filter(i => i.isActive && i.currentInstallment < i.totalInstallments).length ?? 0;
  const completedCount = installments?.filter(i => !i.isActive || i.currentInstallment >= i.totalInstallments).length ?? 0;
  const groups = groupInstallmentsByCard(installments ?? []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-[#f0ece4]">Installments</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ToggleSwitch
              checked={showCompleted}
              onChange={toggleShowCompleted}
              label="Show completed"
            />
            <span className="text-sm text-[#a8a29e]">Show completed</span>
          </div>
          <button onClick={openCreateModal} className="btn-primary">
            Add Installment
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <InstallmentSkeleton />
      ) : error ? (
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Failed to load installments'}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          {/* Summary Bar */}
          <InstallmentSummaryBar
            monthlyTotal={monthlyTotal?.total ?? 0}
            activeCount={activeCount}
            completedCount={completedCount}
          />

          {/* Card Groups or Empty State */}
          {installments && installments.length > 0 ? (
            <div className="space-y-6">
              {groups.map((group, index) => (
                <InstallmentCardGroup
                  key={group.cardName}
                  cardName={group.cardName}
                  cardColor={group.cardColor}
                  installments={group.installments}
                  index={index}
                  onIncrement={handleIncrement}
                  onEdit={openEditModal}
                  onDelete={setInstallmentToDelete}
                  isIncrementPending={incrementInstallment.isPending}
                />
              ))}
            </div>
          ) : (
            <InstallmentEmptyState onAddInstallment={openCreateModal} />
          )}
        </>
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
              placeholder="Any additional notes…"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? 'Saving…' : editingInstallment ? 'Update' : 'Add Installment'}
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
