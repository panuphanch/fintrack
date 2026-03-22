import TransactionRow from './TransactionRow';
import type { DateGroup } from '../../lib/groupTransactionsByDate';
import type { Transaction } from '../../types';

interface TransactionDateGroupProps {
  group: DateGroup;
  index: number;
  onDelete: (transaction: Transaction) => void;
}

export default function TransactionDateGroup({ group, index, onDelete }: TransactionDateGroupProps) {
  return (
    <div
      className="motion-safe:animate-slide-up"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
    >
      <h3 className="text-xs font-medium uppercase tracking-wider text-[#6b6560] mb-2.5 pl-1">
        {group.label}
      </h3>
      <div
        data-testid="date-group-card"
        className="bg-surface rounded-xl border border-white/[0.06] shadow-lg shadow-black/20 overflow-hidden divide-y divide-white/[0.06]"
      >
        {group.transactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
