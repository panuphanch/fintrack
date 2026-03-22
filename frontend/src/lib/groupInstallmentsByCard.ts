import type { Installment } from '../types';

export interface CardGroup {
  cardName: string;
  cardColor: string;
  installments: Installment[];
}

export function groupInstallmentsByCard(installments: Installment[]): CardGroup[] {
  if (installments.length === 0) return [];

  const map = new Map<string, { color: string; items: Installment[] }>();

  for (const inst of installments) {
    const cardName = inst.card?.name || 'No Card';
    const existing = map.get(cardName);
    if (existing) {
      existing.items.push(inst);
    } else {
      map.set(cardName, {
        color: inst.card?.color || '#6b7280',
        items: [inst],
      });
    }
  }

  const groups: CardGroup[] = [];

  for (const [cardName, { color, items }] of map) {
    groups.push({ cardName, cardColor: color, installments: items });
  }

  // Sort: alphabetical but "No Card" always last
  groups.sort((a, b) => {
    if (a.cardName === 'No Card') return 1;
    if (b.cardName === 'No Card') return -1;
    return a.cardName.localeCompare(b.cardName);
  });

  return groups;
}
