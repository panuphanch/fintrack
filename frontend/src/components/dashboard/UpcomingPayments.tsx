import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { formatTHB } from '../../lib/format';
import type { Installment, FixedCost } from '../../types';

interface UpcomingPaymentsProps {
  installments: Installment[];
  fixedCosts: FixedCost[];
  maxItems?: number;
}

interface PaymentItem {
  id: string;
  name: string;
  amount: number;
  type: 'installment' | 'fixed';
  dueDay: number | null;
  progress?: string;
  color?: string;
}

export function UpcomingPayments({ installments, fixedCosts, maxItems = 5 }: UpcomingPaymentsProps) {
  const items = useMemo(() => {
    const all: PaymentItem[] = [];

    for (const inst of installments) {
      all.push({
        id: inst.id,
        name: inst.name,
        amount: inst.monthlyAmount,
        type: 'installment',
        dueDay: null,
        progress: `${inst.currentInstallment}/${inst.totalInstallments}`,
        color: inst.card?.color,
      });
    }

    for (const fc of fixedCosts) {
      all.push({
        id: fc.id,
        name: fc.name,
        amount: fc.amount,
        type: 'fixed',
        dueDay: fc.dueDay,
      });
    }

    // Sort: items with due days first (by proximity to today), then rest
    const today = new Date().getDate();
    return all
      .sort((a, b) => {
        const aDue = a.dueDay ?? 32;
        const bDue = b.dueDay ?? 32;
        // Sort by days remaining in the month
        const aRemain = aDue >= today ? aDue - today : aDue + 31 - today;
        const bRemain = bDue >= today ? bDue - today : bDue + 31 - today;
        return aRemain - bRemain;
      })
      .slice(0, maxItems);
  }, [installments, fixedCosts, maxItems]);

  const hasMore = (installments.length + fixedCosts.length) > maxItems;

  if (items.length === 0) {
    return (
      <div className="card">
        <h2 className="text-lg font-display font-bold text-[#f0ece4] mb-4">Upcoming Payments</h2>
        <div className="py-8 text-center">
          <p className="text-sm text-[#6b6560]">No active recurring payments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-bold text-[#f0ece4]">Upcoming Payments</h2>
        {hasMore && (
          <div className="flex gap-2">
            <Link to="/installments" className="text-xs text-gold-400 hover:text-gold-300 transition-colors">
              Installments
            </Link>
            <span className="text-[#6b6560]">/</span>
            <Link to="/fixed-costs" className="text-xs text-gold-400 hover:text-gold-300 transition-colors">
              Fixed
            </Link>
          </div>
        )}
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-b-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  item.type === 'installment'
                    ? 'bg-trust-400/15 text-trust-400'
                    : 'bg-profit-400/15 text-profit-400'
                }`}
              >
                {item.type === 'installment' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#f0ece4] truncate">{item.name}</p>
                <div className="flex items-center gap-2 text-xs text-[#6b6560]">
                  {item.dueDay && <span>Due day {item.dueDay}</span>}
                  {item.progress && (
                    <span className="px-1.5 py-0.5 rounded bg-trust-400/10 text-trust-400 font-mono text-[10px]">
                      {item.progress}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm font-medium font-mono tabular-nums text-[#f0ece4] flex-shrink-0 ml-3">
              {formatTHB(item.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
