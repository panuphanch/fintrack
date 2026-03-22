import { describe, it, expect, vi, afterEach } from 'vitest';
import { groupTransactionsByDate } from '../groupTransactionsByDate';
import type { Transaction } from '../../types';

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 't1',
    householdId: 'h1',
    cardId: 'c1',
    amount: 100,
    merchant: 'Test Store',
    categoryId: 'cat1',
    category: {
      id: 'cat1',
      householdId: 'h1',
      name: 'FOOD_DINING',
      label: 'Food & Dining',
      color: '#d4a853',
      icon: null,
      sortOrder: 0,
      isSystem: true,
      createdAt: '',
      updatedAt: '',
    },
    date: new Date().toISOString(),
    notes: null,
    receiptUrl: null,
    isRecurring: false,
    createdById: 'u1',
    tags: [],
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

describe('groupTransactionsByDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty array for empty input', () => {
    expect(groupTransactionsByDate([])).toEqual([]);
  });

  it('groups a transaction from today under "Today"', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-22T12:00:00Z'));

    const tx = makeTransaction({ id: 't1', date: '2026-03-22T10:00:00Z' });
    const groups = groupTransactionsByDate([tx]);

    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe('Today');
    expect(groups[0].transactions).toHaveLength(1);
    expect(groups[0].transactions[0].id).toBe('t1');
  });

  it('groups a transaction from yesterday under "Yesterday"', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-22T12:00:00Z'));

    const tx = makeTransaction({ id: 't2', date: '2026-03-21T10:00:00Z' });
    const groups = groupTransactionsByDate([tx]);

    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe('Yesterday');
  });

  it('groups into "This Week" for earlier this week dates', () => {
    vi.useFakeTimers();
    // March 22, 2026 is a Sunday. March 18 (Wednesday) is earlier in the same week.
    vi.setSystemTime(new Date('2026-03-22T12:00:00Z'));

    const tx = makeTransaction({ id: 't3', date: '2026-03-18T10:00:00Z' });
    const groups = groupTransactionsByDate([tx]);

    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe('This Week');
  });

  it('groups into "Earlier This Month" for same month but earlier than this week', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-22T12:00:00Z'));

    const tx = makeTransaction({ id: 't4', date: '2026-03-05T10:00:00Z' });
    const groups = groupTransactionsByDate([tx]);

    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe('Earlier This Month');
  });

  it('groups into "Older" for previous months', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-22T12:00:00Z'));

    const tx = makeTransaction({ id: 't5', date: '2026-02-10T10:00:00Z' });
    const groups = groupTransactionsByDate([tx]);

    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe('Older');
  });

  it('creates multiple groups and preserves order', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-22T12:00:00Z'));

    const transactions = [
      makeTransaction({ id: 't1', date: '2026-03-22T10:00:00Z' }),
      makeTransaction({ id: 't2', date: '2026-03-21T10:00:00Z' }),
      makeTransaction({ id: 't3', date: '2026-02-15T10:00:00Z' }),
    ];

    const groups = groupTransactionsByDate(transactions);

    expect(groups).toHaveLength(3);
    expect(groups[0].label).toBe('Today');
    expect(groups[1].label).toBe('Yesterday');
    expect(groups[2].label).toBe('Older');
  });

  it('groups multiple transactions on the same day together', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-22T12:00:00Z'));

    const transactions = [
      makeTransaction({ id: 't1', date: '2026-03-22T15:00:00Z' }),
      makeTransaction({ id: 't2', date: '2026-03-22T10:00:00Z' }),
    ];

    const groups = groupTransactionsByDate(transactions);

    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe('Today');
    expect(groups[0].transactions).toHaveLength(2);
  });

  it('provides unique dateKey for each group', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-22T12:00:00Z'));

    const transactions = [
      makeTransaction({ id: 't1', date: '2026-03-22T10:00:00Z' }),
      makeTransaction({ id: 't2', date: '2026-03-21T10:00:00Z' }),
    ];

    const groups = groupTransactionsByDate(transactions);
    const keys = groups.map((g) => g.dateKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
