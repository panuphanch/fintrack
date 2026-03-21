import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagsApi } from '../lib/api';
import type { Tag, CreateTagInput } from '../types';

export function useTags() {
  return useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: tagsApi.list,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTagInput) => tagsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tagsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}
