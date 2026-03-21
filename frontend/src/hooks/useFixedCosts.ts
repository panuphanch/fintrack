import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fixedCostsApi } from '../lib/api';
import type { FixedCost, CreateFixedCostInput, UpdateFixedCostInput } from '../types';

export function useFixedCosts(activeOnly = true) {
  return useQuery<FixedCost[]>({
    queryKey: ['fixed-costs', { activeOnly }],
    queryFn: () => fixedCostsApi.list(activeOnly),
  });
}

export function useFixedCost(id: string) {
  return useQuery<FixedCost>({
    queryKey: ['fixed-costs', id],
    queryFn: () => fixedCostsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateFixedCost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFixedCostInput) => fixedCostsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-costs'] });
      queryClient.invalidateQueries({ queryKey: ['fixed-costs-monthly-total'] });
    },
  });
}

export function useUpdateFixedCost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFixedCostInput }) =>
      fixedCostsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['fixed-costs'] });
      queryClient.invalidateQueries({ queryKey: ['fixed-costs', id] });
      queryClient.invalidateQueries({ queryKey: ['fixed-costs-monthly-total'] });
    },
  });
}

export function useDeleteFixedCost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fixedCostsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-costs'] });
      queryClient.invalidateQueries({ queryKey: ['fixed-costs-monthly-total'] });
    },
  });
}

export function useFixedCostsMonthlyTotal() {
  return useQuery<{ total: number }>({
    queryKey: ['fixed-costs-monthly-total'],
    queryFn: fixedCostsApi.getMonthlyTotal,
  });
}
