import { CategoryIcon } from '../IconPicker';
import type { Category } from '../../types';

interface CategoryRowProps {
  category: Category;
  index: number;
  totalCount: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isReordering: boolean;
}

export function CategoryRow({
  category,
  index,
  totalCount,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isReordering,
}: CategoryRowProps) {
  return (
    <div
      className="flex items-center justify-between px-3 py-3 group hover:bg-white/[0.03] transition-colors motion-safe:animate-slide-up"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
    >
      <div className="flex items-center gap-3">
        <div
          data-testid="color-bar"
          className="w-1 h-8 rounded-full shrink-0"
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

      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onMoveUp(category.id)}
          disabled={index === 0 || isReordering}
          className="p-2 text-[#6b6560] hover:text-[#a8a29e] disabled:opacity-30 cursor-pointer disabled:cursor-default"
          aria-label="Move up"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={() => onMoveDown(category.id)}
          disabled={index === totalCount - 1 || isReordering}
          className="p-2 text-[#6b6560] hover:text-[#a8a29e] disabled:opacity-30 cursor-pointer disabled:cursor-default"
          aria-label="Move down"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <button
          onClick={() => onEdit(category)}
          className="p-2 text-[#6b6560] hover:text-gold-400 cursor-pointer"
          aria-label="Edit category"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        {!category.isSystem && (
          <button
            onClick={() => onDelete(category)}
            className="p-2 text-[#6b6560] hover:text-red-400 cursor-pointer"
            aria-label="Delete category"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
