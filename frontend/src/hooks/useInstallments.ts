import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { installmentsApi } from '../lib/api';
import type { Installment, CreateInstallmentInput, UpdateInstallmentInput } from '../types';

export function useInstallments(activeOnly = true) {
  return useQuery<Installment[]>({
    queryKey: ['installments', { activeOnly }],
    queryFn: () => installmentsApi.list(activeOnly),
  });
}

export function useInstallment(id: string) {
  return useQuery<Installment>({
    queryKey: ['installments', id],
    queryFn: () => installmentsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateInstallment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInstallmentInput) => installmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installments'] });
      queryClient.invalidateQueries({ queryKey: ['installments-monthly-total'] });
    },
  });
}

export function useUpdateInstallment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInstallmentInput }) =>
      installmentsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['installments'] });
      queryClient.invalidateQueries({ queryKey: ['installments', id] });
      queryClient.invalidateQueries({ queryKey: ['installments-monthly-total'] });
    },
  });
}

export function useIncrementInstallment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => installmentsApi.increment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['installments'] });
      queryClient.invalidateQueries({ queryKey: ['installments', id] });
      queryClient.invalidateQueries({ queryKey: ['installments-monthly-total'] });
    },
  });
}

export function useDeleteInstallment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => installmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installments'] });
      queryClient.invalidateQueries({ queryKey: ['installments-monthly-total'] });
    },
  });
}

export function useInstallmentsMonthlyTotal() {
  return useQuery<{ total: number }>({
    queryKey: ['installments-monthly-total'],
    queryFn: installmentsApi.getMonthlyTotal,
  });
}
