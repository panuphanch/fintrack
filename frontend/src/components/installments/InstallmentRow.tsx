import { CategoryBadge } from '../CategoryBadge';
import { CategoryIcon } from '../IconPicker';
import { formatTHB } from '../../lib/format';
import type { Installment } from '../../types';

interface InstallmentRowProps {
  installment: Installment;
  onIncrement: (id: string) => void;
  onEdit: (installment: Installment) => void;
  onDelete: (installment: Installment) => void;
  isIncrementPending?: boolean;
}

export default function InstallmentRow({ installment, onIncrement, onEdit, onDelete, isIncrementPending }: InstallmentRowProps) {
  const { category } = installment;
  const isComplete = installment.currentInstallment >= installment.totalInstallments;
  const progress = (installment.currentInstallment / installment.totalInstallments) * 100;

  return (
    <div className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors ${isComplete ? 'opacity-60' : ''}`}>
      {/* Category icon circle */}
      <div
        className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full"
        style={{ backgroundColor: `${category.color}26` }}
      >
        <CategoryIcon name={category.icon} className="h-5 w-5" color={category.color} />
      </div>

      {/* Center column */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#f0ece4] truncate">
            {installment.name}
          </span>
          <CategoryBadge category={category} size="sm" />
        </div>
        {installment.notes && (
          <span className="text-xs text-[#6b6560]">{installment.notes}</span>
        )}
      </div>

      {/* Monthly amount */}
      <span className="flex-shrink-0 font-mono tabular-nums font-semibold text-[#f0ece4] text-sm">
        {formatTHB(installment.monthlyAmount)}
      </span>

      {/* Progress section */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="w-24 bg-surface-alt rounded-full h-2"
        >
          <div
            data-testid="progress-fill"
            className={`h-2 rounded-full ${isComplete ? 'bg-profit-400' : 'bg-gold-400'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={`text-sm font-medium tabular-nums ${isComplete ? 'text-profit-400' : 'text-[#a8a29e]'}`}>
          {installment.currentInstallment}/{installment.totalInstallments}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        {!isComplete && (
          <button
            onClick={() => onIncrement(installment.id)}
            disabled={isIncrementPending}
            className="p-1.5 rounded-md bg-[#1a1a2e] text-profit-400 hover:bg-profit-400/20 transition-colors focus-visible:ring-2 focus-visible:ring-gold-400/50 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Mark next payment"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        )}
        <button
          onClick={() => onEdit(installment)}
          className="p-1.5 rounded-md bg-[#1a1a2e] text-[#d4a853] hover:bg-[#d4a853]/20 transition-colors focus-visible:ring-2 focus-visible:ring-gold-400/50 focus-visible:outline-none"
          aria-label="Edit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(installment)}
          className="p-1.5 rounded-md bg-[#1a1a2e] text-[#dc2626] hover:bg-[#dc2626]/20 transition-colors focus-visible:ring-2 focus-visible:ring-gold-400/50 focus-visible:outline-none"
          aria-label="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
