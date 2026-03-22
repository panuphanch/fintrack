import { formatTHB } from '../../lib/format';
import type { CreditCard } from '../../types';

interface CardStatsProps {
  cards: CreditCard[];
}

export function CardStats({ cards }: CardStatsProps) {
  const totalLimit = cards.reduce((sum, c) => sum + c.creditLimit, 0);
  const ownerNames = [
    ...new Set(cards.map((c) => c.owner?.name).filter(Boolean)),
  ];

  return (
    <div className="card grid grid-cols-3 gap-4 text-center">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-[#6b6560]">
          Active Cards
        </p>
        <p className="mt-1 font-mono text-2xl tabular-nums text-[#f0ece4]">
          {cards.length}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-[#6b6560]">
          Total Credit Limit
        </p>
        <p className="mt-1 font-mono text-2xl tabular-nums text-gold-400">
          {formatTHB(totalLimit)}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-[#6b6560]">
          Owners
        </p>
        <p className="mt-1 text-sm text-[#a8a29e]">
          {ownerNames.length > 0 ? ownerNames.join(', ') : '—'}
        </p>
      </div>
    </div>
  );
}
