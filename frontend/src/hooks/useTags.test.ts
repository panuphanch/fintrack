import { renderHook, waitFor } from '@testing-library/react';
import { useTags, useCreateTag, useDeleteTag } from './useTags';
import { tagsApi } from '../lib/api';
import { createWrapper } from '../__tests__/test-utils';

vi.mock('../lib/api', () => ({
  tagsApi: {
    list: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useTags', () => {
  it('should fetch tags', async () => {
    const mockTags = [{ id: 't1', name: 'Food' }];
    (tagsApi.list as any).mockResolvedValue(mockTags);

    const { result } = renderHook(() => useTags(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockTags);
    });
  });
});

describe('useCreateTag', () => {
  it('should create a tag', async () => {
    (tagsApi.create as any).mockResolvedValue({ id: 't1', name: 'Food' });

    const { result } = renderHook(() => useCreateTag(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ name: 'Food' });

    expect(tagsApi.create).toHaveBeenCalledWith({ name: 'Food' });
  });
});

describe('useDeleteTag', () => {
  it('should delete a tag', async () => {
    (tagsApi.delete as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteTag(), { wrapper: createWrapper() });

    await result.current.mutateAsync('t1');

    expect(tagsApi.delete).toHaveBeenCalledWith('t1');
  });
});
