import { CategoryIcon } from './IconPicker';
import type { Category } from '../types';

interface CategoryBadgeProps {
  category: Category;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, showIcon = true, size = 'sm' }: CategoryBadgeProps) {
  const sizeClasses = size === 'sm'
    ? 'px-2.5 py-0.5 text-xs'
    : 'px-3 py-1 text-sm';

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses}`}
      style={{
        backgroundColor: `${category.color}30`,
        color: category.color,
      }}
    >
      {showIcon && category.icon && (
        <CategoryIcon name={category.icon} className={iconSize} color={category.color} />
      )}
      {category.label}
    </span>
  );
}

export default CategoryBadge;
