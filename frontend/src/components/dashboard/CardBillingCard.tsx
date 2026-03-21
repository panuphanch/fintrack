import { Link } from 'react-router-dom';
import { formatTHB, formatBillingPeriodDisplay, formatDate } from '../../lib/format';
import type { CardBillingSummary } from '../../types';

interface CardBillingCardProps {
  card: CardBillingSummary;
  includeInstallments: boolean;
  onMarkPaid: (cardId: string) => void;
  isPaying: boolean;
}

function getDueUrgency(dueDate: string, isPaid: boolean): 'paid' | 'overdue' | 'urgent' | 'normal' {
  if (isPaid) return 'paid';
  const now = new Date();
  const due = new Date(dueDate);
  const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 3) return 'urgent';
  return 'normal';
}

const urgencyBorder = {
  paid: 'border-profit-400/30',
  overdue: 'border-danger-400/40',
  urgent: 'border-warning-400/30',
  normal: 'border-white/[0.06]',
};

export function CardBillingCard({ card, includeInstallments, onMarkPaid, isPaying }: CardBillingCardProps) {
  const totalCardSpending = includeInstallments ? card.totalAmount : card.transactionAmount;
  const urgency = getDueUrgency(card.dueDate, card.isPaid);

  return (
    <div
      className={`p-4 rounded-xl bg-surface-alt border ${urgencyBorder[urgency]} transition-colors`}
      style={{ borderLeftColor: card.cardColor, borderLeftWidth: '4px' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-medium text-[#f0ece4]">{card.cardName}</p>
          <p className="text-sm text-[#6b6560]">
            {card.cardBank} •••• {card.cardLastFour}
            {card.ownerName && ` (${card.ownerName})`}
          </p>
        </div>
        <Link
          to={`/cards/${card.cardId}/edit`}
          className="text-xs text-gold-400 hover:text-gold-300 transition-colors p-1"
        >
          Edit
        </Link>
      </div>

      <div className="flex items-center gap-2 text-xs mb-3">
        <span className="text-[#6b6560]">
          {formatBillingPeriodDisplay(card.billingPeriod.start, card.billingPeriod.end)}
        </span>
        <span className="text-[#6b6560]">|</span>
        <span className={
          urgency === 'overdue' ? 'text-danger-400 font-medium' :
          urgency === 'urgent' ? 'text-warning-400 font-medium' :
          'text-[#6b6560]'
        }>
          Due {formatDate(card.dueDate, 'MMM d')}
        </span>
      </div>

      <div className="space-y-1 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-[#6b6560]">Transactions</span>
          <span className="text-[#a8a29e] font-mono tabular-nums">{formatTHB(card.transactionAmount)}</span>
        </div>
        {includeInstallments && card.installmentAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[#6b6560]">Installments</span>
            <span className="text-[#a8a29e] font-mono tabular-nums">{formatTHB(card.installmentAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-medium border-t border-white/[0.06] pt-1">
          <span className="text-[#a8a29e]">Total</span>
          <span className="text-[#f0ece4] font-mono tabular-nums">{formatTHB(totalCardSpending)}</span>
        </div>
      </div>

      <button
        onClick={() => onMarkPaid(card.cardId)}
        disabled={card.isPaid || isPaying}
        className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
          card.isPaid
            ? 'bg-profit-400/15 text-profit-400 cursor-default'
            : 'btn-primary'
        }`}
      >
        {card.isPaid ? (
          <span className="flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Paid
          </span>
        ) : isPaying ? 'Marking...' : 'Mark as Paid'}
      </button>
    </div>
  );
}
