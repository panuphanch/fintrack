import { useState } from 'react';
import { CategoryRow } from './CategoryRow';
import { CategoryForm } from './CategoryForm';
import { Modal, ConfirmDialog } from '../common';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../../types';

interface CategorySectionProps {
  categories: Category[];
  onCreateCategory: (data: CreateCategoryInput) => Promise<void>;
  onUpdateCategory: (id: string, data: UpdateCategoryInput) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onReorderCategories: (items: { id: string; sortOrder: number }[]) => Promise<void>;
  isCreatePending: boolean;
  isUpdatePending: boolean;
  isDeletePending: boolean;
  isReorderPending: boolean;
  createError: Error | null;
  updateError: Error | null;
  animationDelay?: number;
}

export function CategorySection({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  isCreatePending,
  isUpdatePending,
  isDeletePending,
  isReorderPending,
  createError,
  updateError,
  animationDelay = 0,
}: CategorySectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const count = categories.length;

  const openCreateModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (data: CreateCategoryInput) => {
    try {
      if (editingCategory) {
        await onUpdateCategory(editingCategory.id, data as UpdateCategoryInput);
      } else {
        await onCreateCategory(data);
      }
      closeModal();
    } catch {
      // Error handled via props
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    const id = categoryToDelete.id;
    setCategoryToDelete(null);
    try {
      await onDeleteCategory(id);
    } catch {
      // Error handled via mutation
    }
  };

  const moveCategory = async (categoryId: string, direction: 'up' | 'down') => {
    const index = categories.findIndex((c) => c.id === categoryId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    const newCategories = [...categories];
    [newCategories[index], newCategories[newIndex]] = [newCategories[newIndex], newCategories[index]];

    const reorderItems = newCategories.map((cat, idx) => ({
      id: cat.id,
      sortOrder: idx,
    }));

    await onReorderCategories(reorderItems);
  };

  return (
    <div
      className="motion-safe:animate-slide-up bg-surface rounded-xl border border-white/[0.06] p-6 shadow-lg shadow-black/20"
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'backwards' }}
    >
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[#6b6560]">
          CATEGORIES
        </h2>
        <button onClick={openCreateModal} className="btn-primary text-sm cursor-pointer">
          Add Category
        </button>
      </div>
      <p className="text-sm text-[#a8a29e] mb-1">
        {count} {count === 1 ? 'category' : 'categories'}
      </p>
      <p className="text-sm text-[#a8a29e] mb-4">
        Manage spending categories for your household
      </p>

      {categories.length > 0 ? (
        <div className="divide-y divide-white/[0.06]">
          {categories.map((category, index) => (
            <CategoryRow
              key={category.id}
              category={category}
              index={index}
              totalCount={categories.length}
              onEdit={openEditModal}
              onDelete={setCategoryToDelete}
              onMoveUp={(id) => moveCategory(id, 'up')}
              onMoveDown={(id) => moveCategory(id, 'down')}
              isReordering={isReorderPending}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto text-[#6b6560] mb-4"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 12h16M4 17h8" />
          </svg>
          <h3 className="text-sm font-medium text-[#f0ece4]">No categories found</h3>
          <p className="text-sm text-[#6b6560] mt-1">
            Add your first category to get started.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-[#c4a44a] text-[#13131f] hover:bg-[#d4b45a] transition-colors focus-visible:ring-2 focus-visible:ring-gold-400/50 focus-visible:outline-none cursor-pointer"
          >
            Add Category
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <CategoryForm
          initialData={
            editingCategory
              ? {
                  name: editingCategory.name,
                  label: editingCategory.label,
                  color: editingCategory.color,
                  icon: editingCategory.icon || undefined,
                }
              : undefined
          }
          isEditing={!!editingCategory}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          isPending={isCreatePending || isUpdatePending}
          error={createError || updateError}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.label}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeletePending}
      />
    </div>
  );
}
