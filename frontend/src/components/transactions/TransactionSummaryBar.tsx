import { formatTHB } from '../../lib/format';
import type { Transaction } from '../../types';

interface TransactionSummaryBarProps {
  transactions: Transaction[];
}

export default function TransactionSummaryBar({ transactions }: TransactionSummaryBarProps) {
  const count = transactions.length;
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const average = count > 0 ? totalSpent / count : 0;

  const stats = [
    { label: 'Total Spent', value: formatTHB(totalSpent) },
    { label: 'Transactions', value: String(count) },
    { label: 'Average', value: formatTHB(average) },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-surface rounded-xl border border-white/[0.06] p-5 shadow-lg shadow-black/20"
        >
          <dt className="text-xs font-medium uppercase tracking-wider text-[#6b6560]">
            {stat.label}
          </dt>
          <dd className="mt-1.5 font-mono text-2xl tabular-nums text-[#f0ece4]">
            {stat.value}
          </dd>
        </div>
      ))}
    </div>
  );
}
