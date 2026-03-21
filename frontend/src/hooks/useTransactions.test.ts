import { renderHook, waitFor } from '@testing-library/react';
import { useTransactions, useTransaction, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from './useTransactions';
import { transactionsApi } from '../lib/api';
import { createWrapper } from '../__tests__/test-utils';

vi.mock('../lib/api', () => ({
  transactionsApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const mockTransactions = [
  { id: 't1', amount: 500, merchant: 'Restaurant' },
  { id: 't2', amount: 1000, merchant: 'Store' },
];

describe('useTransactions', () => {
  it('should fetch transactions', async () => {
    (transactionsApi.list as any).mockResolvedValue(mockTransactions);

    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockTransactions);
    });
  });

  it('should pass filters to API', async () => {
    (transactionsApi.list as any).mockResolvedValue([]);
    const filters = { cardId: 'c1', startDate: '2025-03-01' };

    renderHook(() => useTransactions(filters), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(transactionsApi.list).toHaveBeenCalledWith(filters);
    });
  });
});

describe('useTransaction', () => {
  it('should fetch single transaction', async () => {
    (transactionsApi.get as any).mockResolvedValue(mockTransactions[0]);

    const { result } = renderHook(() => useTransaction('t1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockTransactions[0]);
    });
  });
});

describe('useCreateTransaction', () => {
  it('should create a transaction', async () => {
    (transactionsApi.create as any).mockResolvedValue(mockTransactions[0]);

    const { result } = renderHook(() => useCreateTransaction(), { wrapper: createWrapper() });

    await result.current.mutateAsync({
      cardId: 'c1',
      amount: 500,
      merchant: 'Restaurant',
      categoryId: 'cat-1',
      date: '2025-03-15',
    });

    expect(transactionsApi.create).toHaveBeenCalled();
  });
});

describe('useUpdateTransaction', () => {
  it('should update a transaction', async () => {
    (transactionsApi.update as any).mockResolvedValue(mockTransactions[0]);

    const { result } = renderHook(() => useUpdateTransaction(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ id: 't1', data: { merchant: 'Updated' } });

    expect(transactionsApi.update).toHaveBeenCalledWith('t1', { merchant: 'Updated' });
  });
});

describe('useDeleteTransaction', () => {
  it('should delete a transaction', async () => {
    (transactionsApi.delete as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteTransaction(), { wrapper: createWrapper() });

    await result.current.mutateAsync('t1');

    expect(transactionsApi.delete).toHaveBeenCalledWith('t1');
  });
});
