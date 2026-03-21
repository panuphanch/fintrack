import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../lib/api';
import type { MonthlySummary, CategorySummary, CardSummary, BillingCycleSummary, MonthlyTrend } from '../types';
import { getCurrentMonth, getDefaultPaymentMonth } from '../lib/format';

export function useMonthlySummary(month?: string) {
  const targetMonth = month || getCurrentMonth();

  return useQuery<MonthlySummary>({
    queryKey: ['analytics', 'monthly-summary', targetMonth],
    queryFn: () => analyticsApi.monthlySummary(targetMonth),
  });
}

export function useCategoryAnalytics(month?: string) {
  const targetMonth = month || getCurrentMonth();

  return useQuery<CategorySummary[]>({
    queryKey: ['analytics', 'by-category', targetMonth],
    queryFn: () => analyticsApi.byCategory(targetMonth),
  });
}

export function useCardAnalytics(month?: string) {
  const targetMonth = month || getCurrentMonth();

  return useQuery<CardSummary[]>({
    queryKey: ['analytics', 'by-card', targetMonth],
    queryFn: () => analyticsApi.byCard(targetMonth),
  });
}

export function useBillingCycleSummary(paymentMonth?: string) {
  const targetMonth = paymentMonth || getDefaultPaymentMonth();

  return useQuery<BillingCycleSummary>({
    queryKey: ['analytics', 'billing-cycle-summary', targetMonth],
    queryFn: () => analyticsApi.billingCycleSummary(targetMonth),
  });
}

export function useMonthlyTrend(months: number = 6) {
  return useQuery<MonthlyTrend[]>({
    queryKey: ['analytics', 'monthly-trend', months],
    queryFn: () => analyticsApi.monthlyTrend(months),
    staleTime: 60_000,
  });
}
