import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsApi } from '../lib/api';
import type { CreditCard, CreateCardInput, UpdateCardInput } from '../types';

export function useCards() {
  return useQuery<CreditCard[]>({
    queryKey: ['cards'],
    queryFn: cardsApi.list,
  });
}

export function useCard(id: string) {
  return useQuery<CreditCard>({
    queryKey: ['cards', id],
    queryFn: () => cardsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCardInput) => cardsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCardInput }) =>
      cardsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['cards', id] });
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cardsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

export function useCardCurrentStatement(id: string) {
  return useQuery({
    queryKey: ['cards', id, 'current-statement'],
    queryFn: () => cardsApi.getCurrentStatement(id),
    enabled: !!id,
  });
}

export function useMarkCardPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, paymentMonth }: { cardId: string; paymentMonth: string }) =>
      cardsApi.markPaid(cardId, paymentMonth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'billing-cycle-summary'] });
    },
  });
}
