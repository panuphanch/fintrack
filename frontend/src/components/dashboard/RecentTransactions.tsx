import { Link } from 'react-router-dom';
import { formatTHB, formatDate } from '../../lib/format';
import type { Transaction } from '../../types';

interface RecentTransactionsProps {
  transactions: Transaction[];
  maxItems?: number;
}

export function RecentTransactions({ transactions, maxItems = 5 }: RecentTransactionsProps) {
  const items = transactions.slice(0, maxItems);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-bold text-[#f0ece4]">Recent Transactions</h2>
        <Link to="/transactions" className="text-sm text-gold-400 hover:text-gold-300 transition-colors">
          View all
        </Link>
      </div>
      {items.length > 0 ? (
        <div className="space-y-1">
          {items.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-b-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: t.category?.color || '#6b6560' }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#f0ece4] truncate">{t.merchant}</p>
                  <div className="flex items-center gap-1.5 text-xs text-[#6b6560]">
                    <span>{t.category?.label || 'Unknown'}</span>
                    <span>·</span>
                    <span>{formatDate(t.date)}</span>
                    {t.card && (
                      <>
                        <span>·</span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{
                            backgroundColor: `${t.card.color || '#6b6560'}20`,
                            color: t.card.color || '#6b6560',
                          }}
                        >
                          {t.card.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium font-mono tabular-nums text-[#f0ece4] flex-shrink-0 ml-3">
                {formatTHB(t.amount)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-sm text-[#6b6560] mb-2">No transactions yet</p>
          <Link to="/transactions/new" className="text-sm text-gold-400 hover:text-gold-300 transition-colors">
            Add your first transaction
          </Link>
        </div>
      )}
    </div>
  );
}
