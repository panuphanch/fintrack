import { renderHook, waitFor } from '@testing-library/react';
import {
  useFixedCosts,
  useFixedCost,
  useCreateFixedCost,
  useUpdateFixedCost,
  useDeleteFixedCost,
  useFixedCostsMonthlyTotal,
} from './useFixedCosts';
import { fixedCostsApi } from '../lib/api';
import { createWrapper } from '../__tests__/test-utils';

vi.mock('../lib/api', () => ({
  fixedCostsApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getMonthlyTotal: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const mockFixedCosts = [
  { id: 'fc1', name: 'Rent', amount: 15000, isActive: true },
  { id: 'fc2', name: 'Internet', amount: 500, isActive: true },
];

describe('useFixedCosts', () => {
  it('should fetch active fixed costs by default', async () => {
    (fixedCostsApi.list as any).mockResolvedValue(mockFixedCosts);

    const { result } = renderHook(() => useFixedCosts(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockFixedCosts);
    });
    expect(fixedCostsApi.list).toHaveBeenCalledWith(true);
  });

  it('should fetch all fixed costs when activeOnly is false', async () => {
    (fixedCostsApi.list as any).mockResolvedValue([]);

    renderHook(() => useFixedCosts(false), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(fixedCostsApi.list).toHaveBeenCalledWith(false);
    });
  });
});

describe('useFixedCost', () => {
  it('should fetch single fixed cost', async () => {
    (fixedCostsApi.get as any).mockResolvedValue(mockFixedCosts[0]);

    const { result } = renderHook(() => useFixedCost('fc1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockFixedCosts[0]);
    });
  });
});

describe('useCreateFixedCost', () => {
  it('should create a fixed cost', async () => {
    (fixedCostsApi.create as any).mockResolvedValue(mockFixedCosts[0]);

    const { result } = renderHook(() => useCreateFixedCost(), { wrapper: createWrapper() });

    await result.current.mutateAsync({
      name: 'Rent',
      amount: 15000,
      categoryId: 'cat-1',
    });

    expect(fixedCostsApi.create).toHaveBeenCalled();
  });
});

describe('useUpdateFixedCost', () => {
  it('should update a fixed cost', async () => {
    (fixedCostsApi.update as any).mockResolvedValue(mockFixedCosts[0]);

    const { result } = renderHook(() => useUpdateFixedCost(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ id: 'fc1', data: { name: 'Updated' } });

    expect(fixedCostsApi.update).toHaveBeenCalledWith('fc1', { name: 'Updated' });
  });
});

describe('useDeleteFixedCost', () => {
  it('should delete a fixed cost', async () => {
    (fixedCostsApi.delete as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteFixedCost(), { wrapper: createWrapper() });

    await result.current.mutateAsync('fc1');

    expect(fixedCostsApi.delete).toHaveBeenCalledWith('fc1');
  });
});

describe('useFixedCostsMonthlyTotal', () => {
  it('should fetch monthly total', async () => {
    (fixedCostsApi.getMonthlyTotal as any).mockResolvedValue({ total: 25000 });

    const { result } = renderHook(() => useFixedCostsMonthlyTotal(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ total: 25000 });
    });
  });
});
