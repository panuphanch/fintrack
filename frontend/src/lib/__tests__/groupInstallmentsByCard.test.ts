import { groupInstallmentsByCard } from '../groupInstallmentsByCard';
import type { Installment, Category } from '../../types';

const mockCategory: Category = {
  id: 'cat1', householdId: 'h1', name: 'GADGET', label: 'Gadget',
  color: '#3b82f6', icon: 'device-mobile', sortOrder: 3, isSystem: true,
  createdAt: '', updatedAt: '',
};

function makeInstallment(overrides: Partial<Installment> = {}): Installment {
  return {
    id: 'inst-1', householdId: 'h1', cardId: 'c1',
    card: { id: 'c1', name: 'TTB Reserve', bank: 'TTB', color: '#3b82f6' },
    name: 'iPhone 15 Pro', totalAmount: 45000, monthlyAmount: 4500,
    currentInstallment: 5, totalInstallments: 10, categoryId: 'cat1',
    category: mockCategory, startDate: '2026-01-15', notes: null,
    isActive: true, createdById: 'u1', createdAt: '', updatedAt: '',
    ...overrides,
  };
}

describe('groupInstallmentsByCard', () => {
  it('groups installments by card name', () => {
    const installments = [
      makeInstallment({ id: 'i1', card: { id: 'c1', name: 'TTB Reserve', bank: 'TTB', color: '#3b82f6' } }),
      makeInstallment({ id: 'i2', card: { id: 'c2', name: 'KTC', bank: 'KTC', color: '#dc2626' } }),
      makeInstallment({ id: 'i3', card: { id: 'c1', name: 'TTB Reserve', bank: 'TTB', color: '#3b82f6' } }),
    ];
    const groups = groupInstallmentsByCard(installments);
    expect(groups).toHaveLength(2);
    expect(groups[0].cardName).toBe('KTC');
    expect(groups[0].installments).toHaveLength(1);
    expect(groups[1].cardName).toBe('TTB Reserve');
    expect(groups[1].installments).toHaveLength(2);
  });

  it('uses "No Card" for installments without a card', () => {
    const installments = [
      makeInstallment({ id: 'i1', cardId: null, card: undefined }),
    ];
    const groups = groupInstallmentsByCard(installments);
    expect(groups[0].cardName).toBe('No Card');
  });

  it('returns card color from first installment in group', () => {
    const installments = [
      makeInstallment({ id: 'i1', card: { id: 'c1', name: 'TTB', bank: 'TTB', color: '#ff0000' } }),
    ];
    const groups = groupInstallmentsByCard(installments);
    expect(groups[0].cardColor).toBe('#ff0000');
  });

  it('places "No Card" group last', () => {
    const installments = [
      makeInstallment({ id: 'i1', cardId: null, card: undefined }),
      makeInstallment({ id: 'i2', card: { id: 'c1', name: 'AAA Card', bank: 'B', color: '#000' } }),
    ];
    const groups = groupInstallmentsByCard(installments);
    expect(groups[0].cardName).toBe('AAA Card');
    expect(groups[1].cardName).toBe('No Card');
  });

  it('returns empty array for empty input', () => {
    expect(groupInstallmentsByCard([])).toEqual([]);
  });

  it('uses default gray color for No Card group', () => {
    const installments = [
      makeInstallment({ id: 'i1', cardId: null, card: undefined }),
    ];
    const groups = groupInstallmentsByCard(installments);
    expect(groups[0].cardColor).toBe('#6b7280');
  });
});
