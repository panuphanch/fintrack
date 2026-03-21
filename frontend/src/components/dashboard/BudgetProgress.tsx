import { Link } from 'react-router-dom';
import { formatTHB } from '../../lib/format';
import type { Budget } from '../../types';

interface BudgetProgressProps {
  budgets: Budget[];
}

function getBarColor(percentage: number): string {
  if (percentage > 100) return 'bg-danger-400';
  if (percentage > 80) return 'bg-danger-400';
  if (percentage > 50) return 'bg-warning-400';
  return 'bg-profit-400';
}

function getTextColor(percentage: number): string {
  if (percentage > 100) return 'text-danger-400';
  if (percentage > 80) return 'text-danger-400';
  if (percentage > 50) return 'text-warning-400';
  return 'text-profit-400';
}

export function BudgetProgress({ budgets }: BudgetProgressProps) {
  if (!budgets || budgets.length === 0) {
    return (
      <div className="card">
        <h2 className="text-lg font-display font-bold text-[#f0ece4] mb-4">Budget Progress</h2>
        <div className="py-8 text-center">
          <svg className="mx-auto h-10 w-10 text-[#6b6560]/50 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm text-[#6b6560] mb-2">No budgets set</p>
          <Link to="/budgets" className="text-sm text-gold-400 hover:text-gold-300 transition-colors">
            Set up budgets
          </Link>
        </div>
      </div>
    );
  }

  const displayBudgets = budgets
    .filter(b => b.monthlyLimit > 0)
    .sort((a, b) => {
      const aPct = (a.spent || 0) / a.monthlyLimit;
      const bPct = (b.spent || 0) / b.monthlyLimit;
      return bPct - aPct;
    })
    .slice(0, 6);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-bold text-[#f0ece4]">Budget Progress</h2>
        {budgets.length > 6 && (
          <Link to="/budgets" className="text-sm text-gold-400 hover:text-gold-300 transition-colors">
            View all
          </Link>
        )}
      </div>
      <div className="space-y-4">
        {displayBudgets.map((budget) => {
          const spent = budget.spent || 0;
          const percentage = budget.monthlyLimit > 0
            ? (spent / budget.monthlyLimit) * 100
            : 0;
          const cappedPercentage = Math.min(percentage, 100);

          return (
            <div key={budget.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: budget.category.color }}
                  />
                  <span className="text-sm font-medium text-[#f0ece4]">
                    {budget.category.label}
                  </span>
                </div>
                <span className={`text-xs font-mono tabular-nums ${getTextColor(percentage)}`}>
                  {formatTHB(spent)}
                  <span className="text-[#6b6560]"> / {formatTHB(budget.monthlyLimit)}</span>
                </span>
              </div>
              <div
                className="progress-bar"
                role="progressbar"
                aria-valuenow={Math.round(percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${budget.category.label} budget: ${Math.round(percentage)}% used`}
              >
                <div
                  className={`progress-bar-fill ${getBarColor(percentage)} ${
                    percentage > 100 ? 'animate-pulse' : ''
                  }`}
                  style={{ width: `${cappedPercentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
