import InstallmentRow from './InstallmentRow';
import { formatTHB } from '../../lib/format';
import type { Installment } from '../../types';

interface InstallmentCardGroupProps {
  cardName: string;
  cardColor: string;
  installments: Installment[];
  index: number;
  onIncrement: (id: string) => void;
  onEdit: (installment: Installment) => void;
  onDelete: (installment: Installment) => void;
  isIncrementPending?: boolean;
}

export default function InstallmentCardGroup({
  cardName,
  cardColor,
  installments,
  index,
  onIncrement,
  onEdit,
  onDelete,
  isIncrementPending,
}: InstallmentCardGroupProps) {
  const subtotal = installments.reduce((sum, i) => sum + i.monthlyAmount, 0);

  return (
    <div
      className="motion-safe:animate-slide-up"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
    >
      {/* Group header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-3">
          <div
            data-testid="card-color-dot"
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: cardColor }}
          />
          <h3 className="text-xs font-medium uppercase tracking-wider text-[#6b6560]">
            {cardName}
          </h3>
        </div>
        <span className="text-sm font-mono tabular-nums text-[#a8a29e]">
          {formatTHB(subtotal)}
        </span>
      </div>

      {/* Card container */}
      <div className="bg-surface rounded-xl border border-white/[0.06] shadow-lg shadow-black/20 overflow-hidden divide-y divide-white/[0.06]">
        {installments.map((installment) => (
          <InstallmentRow
            key={installment.id}
            installment={installment}
            onIncrement={onIncrement}
            onEdit={onEdit}
            onDelete={onDelete}
            isIncrementPending={isIncrementPending}
          />
        ))}
      </div>
    </div>
  );
}
