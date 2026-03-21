import { renderHook, waitFor } from '@testing-library/react';
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from './useBudgets';
import { budgetsApi } from '../lib/api';
import { createWrapper } from '../__tests__/test-utils';

vi.mock('../lib/api', () => ({
  budgetsApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const mockBudgets = [
  { id: 'b1', categoryId: 'cat-1', monthlyLimit: 5000, spent: 1500 },
];

describe('useBudgets', () => {
  it('should fetch budgets', async () => {
    (budgetsApi.list as any).mockResolvedValue(mockBudgets);

    const { result } = renderHook(() => useBudgets(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockBudgets);
    });
  });
});

describe('useCreateBudget', () => {
  it('should create a budget', async () => {
    (budgetsApi.create as any).mockResolvedValue(mockBudgets[0]);

    const { result } = renderHook(() => useCreateBudget(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ categoryId: 'cat-1', monthlyLimit: 5000 });

    expect(budgetsApi.create).toHaveBeenCalled();
  });
});

describe('useUpdateBudget', () => {
  it('should update a budget', async () => {
    (budgetsApi.update as any).mockResolvedValue(mockBudgets[0]);

    const { result } = renderHook(() => useUpdateBudget(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ id: 'b1', data: { monthlyLimit: 8000 } });

    expect(budgetsApi.update).toHaveBeenCalledWith('b1', { monthlyLimit: 8000 });
  });
});

describe('useDeleteBudget', () => {
  it('should delete a budget', async () => {
    (budgetsApi.delete as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteBudget(), { wrapper: createWrapper() });

    await result.current.mutateAsync('b1');

    expect(budgetsApi.delete).toHaveBeenCalledWith('b1');
  });
});
