import { Link } from 'react-router-dom';
import { CategoryBadge } from '../CategoryBadge';
import { CategoryIcon } from '../IconPicker';
import { formatTHB } from '../../lib/format';
import type { Transaction } from '../../types';

interface TransactionRowProps {
  transaction: Transaction;
  onDelete: (transaction: Transaction) => void;
}

export default function TransactionRow({ transaction, onDelete }: TransactionRowProps) {
  const { category, card, tags } = transaction;

  const cardDisplay = card
    ? `${card.name} ····${card.lastFour}`
    : 'Unknown';

  return (
    <div className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
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
            {transaction.merchant}
          </span>
          <CategoryBadge category={category} size="sm" />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-[#6b6560]">{cardDisplay}</span>
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="bg-[#1a1a2e] rounded px-1.5 py-0.5 text-xs text-[#a8a29e]"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* Amount */}
      <span className="flex-shrink-0 font-mono tabular-nums font-semibold text-[#f0ece4] text-sm">
        {formatTHB(transaction.amount)}
      </span>

      {/* Action buttons */}
      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <Link
          to={`/transactions/${transaction.id}/edit`}
          className="p-1.5 rounded-md bg-[#1a1a2e] text-[#d4a853] hover:bg-[#d4a853]/20 transition-colors focus-visible:ring-2 focus-visible:ring-gold-400/50 focus-visible:outline-none"
          aria-label="Edit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </Link>
        <button
          onClick={() => onDelete(transaction)}
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
