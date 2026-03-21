import { renderHook, waitFor } from '@testing-library/react';
import {
  useCategories,
  useCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useReorderCategories,
  useCategoryById,
  useCategoryMap,
} from './useCategories';
import { categoriesApi } from '../lib/api';
import { createWrapper } from '../__tests__/test-utils';

vi.mock('../lib/api', () => ({
  categoriesApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    reorder: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const mockCategories = [
  { id: 'cat-1', name: 'FOOD_DINING', label: 'Food & Dining', color: '#ef4444' },
  { id: 'cat-2', name: 'TRAVEL', label: 'Travel', color: '#3b82f6' },
];

describe('useCategories', () => {
  it('should fetch categories', async () => {
    (categoriesApi.list as any).mockResolvedValue(mockCategories);

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockCategories);
    });
  });
});

describe('useCategory', () => {
  it('should fetch single category', async () => {
    (categoriesApi.get as any).mockResolvedValue(mockCategories[0]);

    const { result } = renderHook(() => useCategory('cat-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockCategories[0]);
    });
  });

  it('should not fetch when id is empty', () => {
    const { result } = renderHook(() => useCategory(''), { wrapper: createWrapper() });

    expect(result.current.data).toBeUndefined();
    expect(categoriesApi.get).not.toHaveBeenCalled();
  });
});

describe('useCreateCategory', () => {
  it('should create a category', async () => {
    (categoriesApi.create as any).mockResolvedValue(mockCategories[0]);

    const { result } = renderHook(() => useCreateCategory(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ name: 'Food', label: 'Food & Dining', color: '#ef4444' });

    expect(categoriesApi.create).toHaveBeenCalled();
  });
});

describe('useUpdateCategory', () => {
  it('should update a category', async () => {
    (categoriesApi.update as any).mockResolvedValue(mockCategories[0]);

    const { result } = renderHook(() => useUpdateCategory(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ id: 'cat-1', data: { label: 'Updated' } });

    expect(categoriesApi.update).toHaveBeenCalledWith('cat-1', { label: 'Updated' });
  });
});

describe('useDeleteCategory', () => {
  it('should delete a category', async () => {
    (categoriesApi.delete as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteCategory(), { wrapper: createWrapper() });

    await result.current.mutateAsync('cat-1');

    expect(categoriesApi.delete).toHaveBeenCalledWith('cat-1');
  });
});

describe('useReorderCategories', () => {
  it('should reorder categories', async () => {
    (categoriesApi.reorder as any).mockResolvedValue(mockCategories);

    const { result } = renderHook(() => useReorderCategories(), { wrapper: createWrapper() });

    await result.current.mutateAsync([
      { id: 'cat-2', sortOrder: 0 },
      { id: 'cat-1', sortOrder: 1 },
    ]);

    expect(categoriesApi.reorder).toHaveBeenCalled();
  });
});

describe('useCategoryById', () => {
  it('should find category from cached list', async () => {
    (categoriesApi.list as any).mockResolvedValue(mockCategories);

    const { result } = renderHook(() => useCategoryById('cat-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current).toEqual(mockCategories[0]);
    });
  });

  it('should return undefined for unknown id', async () => {
    (categoriesApi.list as any).mockResolvedValue(mockCategories);

    const { result } = renderHook(() => useCategoryById('unknown'), { wrapper: createWrapper() });

    await waitFor(() => {
      // Wait for query to settle, then check
      expect(result.current).toBeUndefined();
    });
  });
});

describe('useCategoryMap', () => {
  it('should build a map of categories', async () => {
    (categoriesApi.list as any).mockResolvedValue(mockCategories);

    const { result } = renderHook(() => useCategoryMap(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.size).toBe(2);
      expect(result.current.get('cat-1')).toEqual(mockCategories[0]);
    });
  });
});
