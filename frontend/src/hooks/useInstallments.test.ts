import { renderHook, waitFor } from '@testing-library/react';
import {
  useInstallments,
  useInstallment,
  useCreateInstallment,
  useUpdateInstallment,
  useIncrementInstallment,
  useInstallmentsMonthlyTotal,
  useDeleteInstallment,
} from './useInstallments';
import { installmentsApi } from '../lib/api';
import { createWrapper } from '../__tests__/test-utils';

vi.mock('../lib/api', () => ({
  installmentsApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    increment: vi.fn(),
    delete: vi.fn(),
    getMonthlyTotal: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const mockInstallments = [
  { id: 'i1', name: 'iPhone', monthlyAmount: 4500, currentInstallment: 5, totalInstallments: 10 },
];

describe('useInstallments', () => {
  it('should fetch active installments by default', async () => {
    (installmentsApi.list as any).mockResolvedValue(mockInstallments);

    const { result } = renderHook(() => useInstallments(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockInstallments);
    });
    expect(installmentsApi.list).toHaveBeenCalledWith(true);
  });

  it('should fetch all installments when activeOnly is false', async () => {
    (installmentsApi.list as any).mockResolvedValue([]);

    renderHook(() => useInstallments(false), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(installmentsApi.list).toHaveBeenCalledWith(false);
    });
  });
});

describe('useInstallment', () => {
  it('should fetch single installment', async () => {
    (installmentsApi.get as any).mockResolvedValue(mockInstallments[0]);

    const { result } = renderHook(() => useInstallment('i1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockInstallments[0]);
    });
  });
});

describe('useCreateInstallment', () => {
  it('should create an installment', async () => {
    (installmentsApi.create as any).mockResolvedValue(mockInstallments[0]);

    const { result } = renderHook(() => useCreateInstallment(), { wrapper: createWrapper() });

    await result.current.mutateAsync({
      name: 'iPhone',
      totalAmount: 45000,
      monthlyAmount: 4500,
      totalInstallments: 10,
      categoryId: 'cat-1',
      startDate: '2025-01-01',
    });

    expect(installmentsApi.create).toHaveBeenCalled();
  });
});

describe('useIncrementInstallment', () => {
  it('should increment an installment', async () => {
    (installmentsApi.increment as any).mockResolvedValue({
      ...mockInstallments[0],
      currentInstallment: 6,
    });

    const { result } = renderHook(() => useIncrementInstallment(), { wrapper: createWrapper() });

    await result.current.mutateAsync('i1');

    expect(installmentsApi.increment).toHaveBeenCalledWith('i1');
  });
});

describe('useUpdateInstallment', () => {
  it('should update an installment', async () => {
    (installmentsApi.update as any).mockResolvedValue(mockInstallments[0]);

    const { result } = renderHook(() => useUpdateInstallment(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ id: 'i1', data: { name: 'Updated' } });

    expect(installmentsApi.update).toHaveBeenCalledWith('i1', { name: 'Updated' });
  });
});

describe('useDeleteInstallment', () => {
  it('should delete an installment', async () => {
    (installmentsApi.delete as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteInstallment(), { wrapper: createWrapper() });

    await result.current.mutateAsync('i1');

    expect(installmentsApi.delete).toHaveBeenCalledWith('i1');
  });
});

describe('useInstallmentsMonthlyTotal', () => {
  it('should fetch monthly total', async () => {
    (installmentsApi.getMonthlyTotal as any).mockResolvedValue({ total: 15000 });

    const { result } = renderHook(() => useInstallmentsMonthlyTotal(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ total: 15000 });
    });
  });
});
