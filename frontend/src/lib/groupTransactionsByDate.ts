import { isToday, isYesterday, isThisWeek, isThisMonth, parseISO } from 'date-fns';
import type { Transaction } from '../types';

export interface DateGroup {
  label: string;
  dateKey: string;
  transactions: Transaction[];
}

type GroupLabel = 'Today' | 'Yesterday' | 'This Week' | 'Earlier This Month' | 'Older';

function getGroupLabel(dateStr: string): GroupLabel {
  const date = parseISO(dateStr);

  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date, { weekStartsOn: 1 })) return 'This Week';
  if (isThisMonth(date)) return 'Earlier This Month';
  return 'Older';
}

const GROUP_ORDER: GroupLabel[] = ['Today', 'Yesterday', 'This Week', 'Earlier This Month', 'Older'];

export function groupTransactionsByDate(transactions: Transaction[]): DateGroup[] {
  if (transactions.length === 0) return [];

  const groupMap = new Map<GroupLabel, Transaction[]>();

  for (const tx of transactions) {
    const label = getGroupLabel(tx.date);
    const existing = groupMap.get(label);
    if (existing) {
      existing.push(tx);
    } else {
      groupMap.set(label, [tx]);
    }
  }

  return GROUP_ORDER
    .filter((label) => groupMap.has(label))
    .map((label) => ({
      label,
      dateKey: label.toLowerCase().replace(/\s+/g, '-'),
      transactions: groupMap.get(label)!,
    }));
}
