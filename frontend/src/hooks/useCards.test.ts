import { renderHook, waitFor } from '@testing-library/react';
import { useCards, useCard, useCreateCard, useUpdateCard, useDeleteCard, useCardCurrentStatement, useMarkCardPaid } from './useCards';
import { cardsApi } from '../lib/api';
import { createWrapper } from '../__tests__/test-utils';

vi.mock('../lib/api', () => ({
  cardsApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getCurrentStatement: vi.fn(),
    markPaid: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const mockCards = [
  { id: 'c1', name: 'TTB Reserve', bank: 'TTB' },
  { id: 'c2', name: 'KTC', bank: 'KTC' },
];

describe('useCards', () => {
  it('should fetch cards list', async () => {
    (cardsApi.list as any).mockResolvedValue(mockCards);

    const { result } = renderHook(() => useCards(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockCards);
    });
  });
});

describe('useCard', () => {
  it('should fetch a single card', async () => {
    (cardsApi.get as any).mockResolvedValue(mockCards[0]);

    const { result } = renderHook(() => useCard('c1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockCards[0]);
    });
  });

  it('should not fetch when id is empty', () => {
    const { result } = renderHook(() => useCard(''), { wrapper: createWrapper() });

    expect(result.current.data).toBeUndefined();
    expect(cardsApi.get).not.toHaveBeenCalled();
  });
});

describe('useCreateCard', () => {
  it('should create a card', async () => {
    (cardsApi.create as any).mockResolvedValue(mockCards[0]);

    const { result } = renderHook(() => useCreateCard(), { wrapper: createWrapper() });

    await result.current.mutateAsync({
      name: 'TTB Reserve',
      bank: 'TTB',
      lastFour: '1234',
      color: '#000',
      cutoffDay: 25,
      dueDay: 5,
      creditLimit: 50000,
    });

    expect(cardsApi.create).toHaveBeenCalled();
  });
});

describe('useUpdateCard', () => {
  it('should update a card', async () => {
    (cardsApi.update as any).mockResolvedValue(mockCards[0]);

    const { result } = renderHook(() => useUpdateCard(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ id: 'c1', data: { name: 'Updated' } });

    expect(cardsApi.update).toHaveBeenCalledWith('c1', { name: 'Updated' });
  });
});

describe('useDeleteCard', () => {
  it('should delete a card', async () => {
    (cardsApi.delete as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteCard(), { wrapper: createWrapper() });

    await result.current.mutateAsync('c1');

    expect(cardsApi.delete).toHaveBeenCalledWith('c1');
  });
});

describe('useCardCurrentStatement', () => {
  it('should fetch current statement', async () => {
    const mockStatement = { totalAmount: 5000, transactions: [] };
    (cardsApi.getCurrentStatement as any).mockResolvedValue(mockStatement);

    const { result } = renderHook(() => useCardCurrentStatement('c1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockStatement);
    });
  });
});

describe('useMarkCardPaid', () => {
  it('should mark card as paid', async () => {
    (cardsApi.markPaid as any).mockResolvedValue({});

    const { result } = renderHook(() => useMarkCardPaid(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ cardId: 'c1', paymentMonth: '2026-04' });

    expect(cardsApi.markPaid).toHaveBeenCalledWith('c1', '2026-04');
  });
});
