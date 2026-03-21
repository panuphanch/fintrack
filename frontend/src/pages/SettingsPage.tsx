import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useReorderCategories } from '../hooks/useCategories';
import { authApi, householdApi } from '../lib/api';
import { LoadingSpinner, ErrorMessage, Modal, ConfirmDialog } from '../components/common';
import { IconPicker, CategoryIcon } from '../components/IconPicker';
import type { User, Category, CreateCategoryInput, UpdateCategoryInput } from '../types';

const COLOR_PRESETS = [
  '#3b82f6', '#22c55e', '#8b5cf6', '#ec4899', '#f97316',
  '#f59e0b', '#a855f7', '#ef4444', '#06b6d4', '#14b8a6',
  '#6b7280', '#9ca3af', '#0ea5e9', '#84cc16', '#fb923c',
];

const emptyCategoryForm: CreateCategoryInput = {
  name: '',
  label: '',
  color: '#3b82f6',
  icon: 'dots-horizontal',
};

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
  action,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="card">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <h2 className="text-lg font-display font-bold text-[#f0ece4]">{title}</h2>
        <div className="flex items-center gap-3">
          {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
          <svg
            className={`h-5 w-5 text-[#6b6560] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Category state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState<CreateCategoryInput>(emptyCategoryForm);

  // Queries and mutations
  const {
    data: members,
    isLoading: membersLoading,
    error: membersError,
  } = useQuery<User[]>({
    queryKey: ['household', 'members'],
    queryFn: householdApi.getMembers,
  });

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const reorderCategories = useReorderCategories();

  const inviteMutation = useMutation({
    mutationFn: (email: string) => authApi.invite(email),
    onSuccess: () => {
      setInviteSuccess(true);
      setInviteEmail('');
    },
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteSuccess(false);
    inviteMutation.mutate(inviteEmail);
  };

  const closeInviteModal = () => {
    setIsInviteModalOpen(false);
    setInviteEmail('');
    setInviteSuccess(false);
    inviteMutation.reset();
  };

  // Category handlers
  const openCreateCategoryModal = () => {
    setCategoryForm(emptyCategoryForm);
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (category: Category) => {
    setCategoryForm({
      name: category.name,
      label: category.label,
      color: category.color,
      icon: category.icon || undefined,
    });
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryForm(emptyCategoryForm);
    createCategory.reset();
    updateCategory.reset();
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          data: categoryForm as UpdateCategoryInput,
        });
      } else {
        await createCategory.mutateAsync(categoryForm);
      }
      closeCategoryModal();
    } catch {
      // Error handled by mutation
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    const idToDelete = categoryToDelete.id;
    setCategoryToDelete(null);
    try {
      await deleteCategory.mutateAsync(idToDelete);
    } catch {
      // Error handled by mutation
    }
  };

  const moveCategory = async (categoryId: string, direction: 'up' | 'down') => {
    if (!categories) return;

    const index = categories.findIndex(c => c.id === categoryId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    // Create new order
    const newCategories = [...categories];
    [newCategories[index], newCategories[newIndex]] = [newCategories[newIndex], newCategories[index]];

    const reorderItems = newCategories.map((cat, idx) => ({
      id: cat.id,
      sortOrder: idx,
    }));

    await reorderCategories.mutateAsync(reorderItems);
  };

  const isCategoryPending = createCategory.isPending || updateCategory.isPending;
  const categoryMutationError = createCategory.error || updateCategory.error;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold text-[#f0ece4]">Settings</h1>

      {/* Profile Section */}
      <CollapsibleSection title="Profile">
        <div className="space-y-4">
          <div>
            <label className="label">Name</label>
            <p className="text-[#f0ece4]">{user?.name}</p>
          </div>
          <div>
            <label className="label">Email</label>
            <p className="text-[#f0ece4]">{user?.email}</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Household Members Section */}
      <CollapsibleSection
        title="Household Members"
        action={
          <button onClick={() => setIsInviteModalOpen(true)} className="btn-primary text-sm">
            Invite Member
          </button>
        }
      >
        {membersLoading ? (
          <LoadingSpinner />
        ) : membersError ? (
          <ErrorMessage
            message={membersError instanceof Error ? membersError.message : 'Failed to load members'}
          />
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {members?.map((member) => (
              <li key={member.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-400/20 text-gold-400 font-display font-bold">
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-[#f0ece4]">
                      {member.name}
                      {member.id === user?.id && (
                        <span className="ml-2 text-xs text-[#6b6560]">(You)</span>
                      )}
                    </p>
                    <p className="text-sm text-[#6b6560]">{member.email}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CollapsibleSection>

      {/* Categories Section - collapsed by default when many items */}
      <CollapsibleSection
        title="Categories"
        defaultOpen={!categories || categories.length <= 6}
        action={
          <button onClick={openCreateCategoryModal} className="btn-primary text-sm">
            Add Category
          </button>
        }
      >
        <p className="text-sm text-[#6b6560] mb-4">Manage spending categories for your household</p>

        {categoriesLoading ? (
          <LoadingSpinner />
        ) : categoriesError ? (
          <ErrorMessage
            message={categoriesError instanceof Error ? categoriesError.message : 'Failed to load categories'}
            onRetry={() => refetchCategories()}
          />
        ) : categories && categories.length > 0 ? (
          <div className="space-y-2">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 bg-surface-alt rounded-lg hover:bg-surface-elevated transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-8 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <CategoryIcon name={category.icon} className="h-5 w-5" color={category.color} />
                  <div>
                    <p className="font-medium text-[#f0ece4]">{category.label}</p>
                    <p className="text-xs text-[#6b6560]">{category.name}</p>
                  </div>
                  {category.isSystem && (
                    <span className="px-2 py-0.5 text-xs bg-surface-elevated text-[#a8a29e] rounded">
                      System
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Reorder buttons */}
                  <button
                    onClick={() => moveCategory(category.id, 'up')}
                    disabled={index === 0 || reorderCategories.isPending}
                    className="p-1 text-[#6b6560] hover:text-[#a8a29e] disabled:opacity-30"
                    title="Move up"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveCategory(category.id, 'down')}
                    disabled={index === categories.length - 1 || reorderCategories.isPending}
                    className="p-1 text-[#6b6560] hover:text-[#a8a29e] disabled:opacity-30"
                    title="Move down"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Edit button */}
                  <button
                    onClick={() => openEditCategoryModal(category)}
                    className="p-1 text-[#6b6560] hover:text-[#a8a29e]"
                    title="Edit"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  {/* Delete button (only for non-system categories) */}
                  {!category.isSystem && (
                    <button
                      onClick={() => setCategoryToDelete(category)}
                      className="p-1 text-[#6b6560] hover:text-red-400"
                      title="Delete"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-[#6b6560] py-8">
            No categories found. Add your first category to get started.
          </p>
        )}
      </CollapsibleSection>

      {/* Invite Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={closeInviteModal} title="Invite Member">
        {inviteSuccess ? (
          <div className="text-center py-4">
            <svg
              className="mx-auto h-12 w-12 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-4 text-[#f0ece4]">Invitation sent successfully!</p>
            <p className="mt-1 text-sm text-[#6b6560]">
              They will receive an email with instructions to join your household.
            </p>
            <button onClick={closeInviteModal} className="mt-4 btn-primary">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            {inviteMutation.error && (
              <ErrorMessage
                message={
                  inviteMutation.error instanceof Error
                    ? inviteMutation.error.message
                    : 'Failed to send invitation'
                }
              />
            )}

            <div>
              <label htmlFor="inviteEmail" className="label">
                Email Address
              </label>
              <input
                id="inviteEmail"
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="input-field"
                placeholder="spouse@example.com"
              />
              <p className="mt-1 text-xs text-[#6b6560]">
                An invitation link will be sent to this email address.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={closeInviteModal} className="btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                disabled={inviteMutation.isPending}
                className="btn-primary"
              >
                {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={closeCategoryModal}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          {categoryMutationError && (
            <ErrorMessage
              message={
                categoryMutationError instanceof Error
                  ? categoryMutationError.message
                  : 'Failed to save category'
              }
            />
          )}

          <div>
            <label htmlFor="categoryLabel" className="label">
              Display Name
            </label>
            <input
              id="categoryLabel"
              type="text"
              required
              value={categoryForm.label}
              onChange={(e) => setCategoryForm({
                ...categoryForm,
                label: e.target.value,
                // Auto-generate name from label if not editing
                name: editingCategory ? categoryForm.name : e.target.value.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, ''),
              })}
              className="input-field"
              placeholder="e.g., Food & Dining"
            />
          </div>

          <div>
            <label htmlFor="categoryName" className="label">
              Internal Name (uppercase, no spaces)
            </label>
            <input
              id="categoryName"
              type="text"
              required
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
              className="input-field font-mono"
              placeholder="e.g., FOOD_DINING"
              pattern="[A-Z0-9_]+"
            />
          </div>

          <div>
            <label className="label">Color</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setCategoryForm({ ...categoryForm, color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    categoryForm.color === color ? 'border-gold-400 ring-2 ring-gold-400/30 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              value={categoryForm.color}
              onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
              className="h-10 w-full rounded cursor-pointer bg-surface-alt border border-white/10"
            />
          </div>

          <div>
            <label className="label">Icon</label>
            <IconPicker
              value={categoryForm.icon}
              onChange={(icon) => setCategoryForm({ ...categoryForm, icon: icon || undefined })}
              color={categoryForm.color}
            />
          </div>

          {/* Preview */}
          <div>
            <label className="label">Preview</label>
            <div className="p-4 bg-surface-alt rounded-lg flex items-center gap-3">
              <div
                className="w-4 h-10 rounded-full"
                style={{ backgroundColor: categoryForm.color }}
              />
              <CategoryIcon name={categoryForm.icon} className="h-6 w-6" color={categoryForm.color} />
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: `${categoryForm.color}30`,
                  color: categoryForm.color,
                }}
              >
                {categoryForm.label || 'Category Name'}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeCategoryModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isCategoryPending} className="btn-primary">
              {isCategoryPending ? 'Saving...' : editingCategory ? 'Update' : 'Add Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Category Confirmation */}
      <ConfirmDialog
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.label}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
}
