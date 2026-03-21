import { Link } from 'react-router-dom';
import { MonthSelector } from '../MonthSelector';
import type { User } from '../../types';

interface GreetingHeaderProps {
  user: User | undefined;
  paymentMonth: string;
  onMonthChange: (month: string) => void;
  includeInstallments: boolean;
  onIncludeInstallmentsChange: (value: boolean) => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function GreetingHeader({
  user,
  paymentMonth,
  onMonthChange,
  includeInstallments,
  onIncludeInstallmentsChange,
}: GreetingHeaderProps) {
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p className="text-sm text-[#6b6560]">{getGreeting()},</p>
        <h1 className="text-2xl font-display font-bold text-[#f0ece4]">{firstName}</h1>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <MonthSelector value={paymentMonth} onChange={onMonthChange} />
        <label className="flex items-center gap-2 text-sm text-[#a8a29e] bg-surface border border-white/[0.06] px-3 py-2 rounded-lg cursor-pointer hover:border-white/[0.12] transition-colors">
          <input
            type="checkbox"
            name="includeInstallments"
            checked={includeInstallments}
            onChange={(e) => onIncludeInstallmentsChange(e.target.checked)}
          />
          Installments
        </label>
        <Link to="/transactions/new" className="btn-primary">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
