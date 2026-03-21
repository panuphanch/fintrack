import { renderHook, waitFor } from '@testing-library/react';
import { useMonthlySummary, useCategoryAnalytics, useCardAnalytics, useBillingCycleSummary, useMonthlyTrend } from './useAnalytics';
import { analyticsApi } from '../lib/api';
import { createWrapper } from '../__tests__/test-utils';

vi.mock('../lib/api', () => ({
  analyticsApi: {
    monthlySummary: vi.fn(),
    byCategory: vi.fn(),
    byCard: vi.fn(),
    billingCycleSummary: vi.fn(),
    monthlyTrend: vi.fn(),
  },
}));

vi.mock('../lib/format', () => ({
  getCurrentMonth: () => '2026-03',
  getDefaultPaymentMonth: () => '2026-04',
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useMonthlySummary', () => {
  it('should fetch summary for given month', async () => {
    const mockSummary = { month: '2026-03', totalSpent: 5000 };
    (analyticsApi.monthlySummary as any).mockResolvedValue(mockSummary);

    const { result } = renderHook(() => useMonthlySummary('2026-03'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockSummary);
    });
    expect(analyticsApi.monthlySummary).toHaveBeenCalledWith('2026-03');
  });

  it('should use current month as default', async () => {
    (analyticsApi.monthlySummary as any).mockResolvedValue({});

    renderHook(() => useMonthlySummary(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(analyticsApi.monthlySummary).toHaveBeenCalledWith('2026-03');
    });
  });
});

describe('useCategoryAnalytics', () => {
  it('should fetch category analytics', async () => {
    const mockData = [{ categoryName: 'FOOD', amount: 3000 }];
    (analyticsApi.byCategory as any).mockResolvedValue(mockData);

    const { result } = renderHook(() => useCategoryAnalytics('2026-03'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });
  });
});

describe('useCardAnalytics', () => {
  it('should fetch card analytics', async () => {
    const mockData = [{ cardName: 'TTB', amount: 5000 }];
    (analyticsApi.byCard as any).mockResolvedValue(mockData);

    const { result } = renderHook(() => useCardAnalytics('2026-03'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });
  });
});

describe('useBillingCycleSummary', () => {
  it('should fetch billing cycle summary', async () => {
    const mockData = { paymentMonth: '2026-04', totals: { grandTotal: 50000 } };
    (analyticsApi.billingCycleSummary as any).mockResolvedValue(mockData);

    const { result } = renderHook(() => useBillingCycleSummary('2026-04'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });
  });

  it('should use default payment month', async () => {
    (analyticsApi.billingCycleSummary as any).mockResolvedValue({});

    renderHook(() => useBillingCycleSummary(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(analyticsApi.billingCycleSummary).toHaveBeenCalledWith('2026-04');
    });
  });
});

describe('useMonthlyTrend', () => {
  it('should fetch monthly trend data', async () => {
    const mockData = [
      { month: '2026-01', transactions: 5000, installments: 2000, fixedCosts: 3000, total: 10000 },
    ];
    (analyticsApi.monthlyTrend as any).mockResolvedValue(mockData);

    const { result } = renderHook(() => useMonthlyTrend(6), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });
    expect(analyticsApi.monthlyTrend).toHaveBeenCalledWith(6);
  });

  it('should default to 6 months', async () => {
    (analyticsApi.monthlyTrend as any).mockResolvedValue([]);

    renderHook(() => useMonthlyTrend(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(analyticsApi.monthlyTrend).toHaveBeenCalledWith(6);
    });
  });
});
