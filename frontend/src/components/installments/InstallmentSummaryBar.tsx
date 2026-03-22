import { formatTHB } from '../../lib/format';

interface InstallmentSummaryBarProps {
  monthlyTotal: number;
  activeCount: number;
  completedCount: number;
}

export default function InstallmentSummaryBar({ monthlyTotal, activeCount, completedCount }: InstallmentSummaryBarProps) {
  const stats = [
    { label: 'Monthly Total', value: formatTHB(monthlyTotal), isGold: true },
    { label: 'Active', value: String(activeCount), isGold: false },
    { label: 'Completed', value: String(completedCount), isGold: false },
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
          <dd className={`mt-1.5 font-mono text-2xl tabular-nums ${stat.isGold ? 'text-gold-400' : 'text-[#f0ece4]'}`}>
            {stat.value}
          </dd>
        </div>
      ))}
    </div>
  );
}
