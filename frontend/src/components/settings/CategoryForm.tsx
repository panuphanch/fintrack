import { useState } from 'react';
import { IconPicker, CategoryIcon } from '../IconPicker';
import { ErrorMessage } from '../common';
import type { CreateCategoryInput } from '../../types';

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

interface CategoryFormProps {
  initialData?: CreateCategoryInput;
  isEditing: boolean;
  onSubmit: (data: CreateCategoryInput) => void;
  onCancel: () => void;
  isPending: boolean;
  error: Error | null;
}

export function CategoryForm({ initialData, isEditing, onSubmit, onCancel, isPending, error }: CategoryFormProps) {
  const [form, setForm] = useState<CreateCategoryInput>(initialData || emptyCategoryForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" role="form">
      {error && (
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Failed to save category'}
        />
      )}

      <div>
        <label htmlFor="categoryLabel" className="label">
          Display Name
        </label>
        <input
          id="categoryLabel"
          name="categoryLabel"
          type="text"
          required
          autoComplete="off"
          value={form.label}
          onChange={(e) =>
            setForm({
              ...form,
              label: e.target.value,
              name: isEditing
                ? form.name
                : e.target.value.toUpperCase().replace(/\s+/g, '_'),
            })
          }
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
          name="categoryName"
          type="text"
          required
          autoComplete="off"
          spellCheck={false}
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value.toUpperCase().replace(/\s+/g, '_') })
          }
          className="input-field font-mono"
          placeholder="e.g., FOOD_DINING"
          pattern="[A-Z0-9_&]+"
        />
      </div>

      <div>
        <label className="label">Color</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setForm({ ...form, color })}
              className={`w-8 h-8 rounded-full border-2 transition-[border-color,transform,box-shadow] cursor-pointer ${
                form.color === color
                  ? 'border-gold-400 ring-2 ring-gold-400/30 scale-110'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
        <input
          type="color"
          value={form.color}
          onChange={(e) => setForm({ ...form, color: e.target.value })}
          className="h-10 w-full rounded cursor-pointer bg-surface-alt border border-white/10"
          aria-label="Custom color picker"
        />
      </div>

      <div>
        <label className="label">Icon</label>
        <IconPicker
          value={form.icon}
          onChange={(icon) => setForm({ ...form, icon: icon || undefined })}
          color={form.color}
        />
      </div>

      <div>
        <label className="label">Preview</label>
        <div className="p-4 bg-surface-alt rounded-lg flex items-center gap-3">
          <div
            className="w-1 h-10 rounded-full"
            style={{ backgroundColor: form.color }}
          />
          <CategoryIcon name={form.icon} className="h-6 w-6" color={form.color} />
          <span
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${form.color}30`,
              color: form.color,
            }}
          >
            {form.label || 'Category Name'}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary cursor-pointer">
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="btn-primary cursor-pointer">
          {isPending ? 'Saving\u2026' : isEditing ? 'Update' : 'Add Category'}
        </button>
      </div>
    </form>
  );
}
