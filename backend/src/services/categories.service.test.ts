import { mockPrisma, resetMocks } from '../__mocks__/prisma';
import { createCategoriesService } from './categories.service';

const service = createCategoriesService(mockPrisma);
const householdId = 'household-1';

const mockCategory = {
  id: 'cat-1',
  name: 'FOOD_DINING',
  label: 'Food & Dining',
  color: '#ef4444',
  icon: 'fire',
  sortOrder: 7,
  isSystem: true,
  householdId,
};

beforeEach(() => {
  resetMocks();
});

describe('CategoriesService', () => {
  describe('list', () => {
    it('should return categories ordered by sortOrder', async () => {
      (mockPrisma.category.findMany as any).mockResolvedValue([mockCategory]);

      const result = await service.list(householdId);

      expect(result).toEqual([mockCategory]);
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: { householdId },
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('getById', () => {
    it('should return a category', async () => {
      (mockPrisma.category.findFirst as any).mockResolvedValue(mockCategory);

      const result = await service.getById('cat-1', householdId);

      expect(result).toEqual(mockCategory);
    });

    it('should throw if not found', async () => {
      (mockPrisma.category.findFirst as any).mockResolvedValue(null);

      await expect(service.getById('999', householdId)).rejects.toThrow('Category not found');
    });
  });

  describe('getByName', () => {
    it('should return category by name', async () => {
      (mockPrisma.category.findFirst as any).mockResolvedValue(mockCategory);

      const result = await service.getByName('FOOD_DINING', householdId);

      expect(result).toEqual(mockCategory);
    });

    it('should return null if not found', async () => {
      (mockPrisma.category.findFirst as any).mockResolvedValue(null);

      const result = await service.getByName('NONEXISTENT', householdId);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create with auto sortOrder', async () => {
      (mockPrisma.category.findFirst as any).mockResolvedValue(null);
      (mockPrisma.category.aggregate as any).mockResolvedValue({ _max: { sortOrder: 11 } });
      const newCat = { ...mockCategory, id: 'cat-new', name: 'PETS', sortOrder: 12, isSystem: false };
      (mockPrisma.category.create as any).mockResolvedValue(newCat);

      const result = await service.create(
        { name: 'pets', label: 'Pets', color: '#000' },
        householdId
      );

      expect(result).toEqual(newCat);
      expect(mockPrisma.category.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'PETS',
            sortOrder: 12,
            isSystem: false,
          }),
        })
      );
    });

    it('should use provided sortOrder', async () => {
      (mockPrisma.category.findFirst as any).mockResolvedValue(null);
      (mockPrisma.category.create as any).mockResolvedValue({ ...mockCategory, sortOrder: 5 });

      await service.create(
        { name: 'pets', label: 'Pets', color: '#000', sortOrder: 5 },
        householdId
      );

      expect(mockPrisma.category.aggregate).not.toHaveBeenCalled();
    });

    it('should throw on duplicate name', async () => {
      (mockPrisma.category.findFirst as any).mockResolvedValue(mockCategory);

      await expect(
        service.create({ name: 'food_dining', label: 'Food', color: '#000' }, householdId)
      ).rejects.toThrow('Category with this name already exists');
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      (mockPrisma.category.findFirst as any).mockResolvedValue(mockCategory);
      const updated = { ...mockCategory, label: 'Updated' };
      (mockPrisma.category.update as any).mockResolvedValue(updated);

      const result = await service.update('cat-1', { label: 'Updated' }, householdId);

      expect(result.label).toBe('Updated');
    });

    it('should throw if not found', async () => {
      (mockPrisma.category.findFirst as any).mockResolvedValue(null);

      await expect(service.update('999', { label: 'X' }, householdId)).rejects.toThrow(
        'Category not found'
      );
    });

    it('should throw on duplicate name when renaming', async () => {
      (mockPrisma.category.findFirst as any)
        .mockResolvedValueOnce(mockCategory) // existing
        .mockResolvedValueOnce({ id: 'cat-2', name: 'TRAVEL' }); // duplicate

      await expect(
        service.update('cat-1', { name: 'travel' }, householdId)
      ).rejects.toThrow('Category with this name already exists');
    });
  });

  describe('delete', () => {
    it('should delete an unused non-system category', async () => {
      const customCat = { ...mockCategory, isSystem: false };
      (mockPrisma.category.findFirst as any).mockResolvedValue(customCat);
      (mockPrisma.transaction.count as any).mockResolvedValue(0);
      (mockPrisma.budget.count as any).mockResolvedValue(0);
      (mockPrisma.installment.count as any).mockResolvedValue(0);
      (mockPrisma.fixedCost.count as any).mockResolvedValue(0);

      await service.delete('cat-1', householdId);

      expect(mockPrisma.category.delete).toHaveBeenCalledWith({ where: { id: 'cat-1' } });
    });

    it('should throw if not found', async () => {
      (mockPrisma.category.findFirst as any).mockResolvedValue(null);

      await expect(service.delete('999', householdId)).rejects.toThrow('Category not found');
    });

    it('should throw for system categories', async () => {
      (mockPrisma.category.findFirst as any).mockResolvedValue(mockCategory); // isSystem: true

      await expect(service.delete('cat-1', householdId)).rejects.toThrow(
        'Cannot delete system categories'
      );
    });

    it('should throw if category is in use', async () => {
      const customCat = { ...mockCategory, isSystem: false };
      (mockPrisma.category.findFirst as any).mockResolvedValue(customCat);
      (mockPrisma.transaction.count as any).mockResolvedValue(3);
      (mockPrisma.budget.count as any).mockResolvedValue(1);
      (mockPrisma.installment.count as any).mockResolvedValue(0);
      (mockPrisma.fixedCost.count as any).mockResolvedValue(0);

      await expect(service.delete('cat-1', householdId)).rejects.toThrow(
        'Cannot delete category: it is used by 3 transactions, 1 budgets, 0 installments, and 0 fixed costs'
      );
    });
  });

  describe('reorder', () => {
    it('should update sortOrder for all items', async () => {
      const items = [
        { id: 'cat-1', sortOrder: 0 },
        { id: 'cat-2', sortOrder: 1 },
      ];
      (mockPrisma.category.findMany as any)
        .mockResolvedValueOnce([{ id: 'cat-1' }, { id: 'cat-2' }]) // validation
        .mockResolvedValueOnce([]); // list after reorder
      // $transaction with array of promises (not callback)
      (mockPrisma.$transaction as any).mockResolvedValue([]);

      await service.reorder(items, householdId);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should throw if some categories not found', async () => {
      (mockPrisma.category.findMany as any).mockResolvedValue([{ id: 'cat-1' }]);

      await expect(
        service.reorder(
          [
            { id: 'cat-1', sortOrder: 0 },
            { id: 'cat-999', sortOrder: 1 },
          ],
          householdId
        )
      ).rejects.toThrow('Some categories were not found');
    });
  });

  describe('createDefaultCategories', () => {
    it('should create defaults when no categories exist', async () => {
      (mockPrisma.category.count as any).mockResolvedValue(0);

      await service.createDefaultCategories(householdId);

      expect(mockPrisma.category.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ name: 'HOME', householdId }),
          ]),
        })
      );
    });

    it('should skip if categories already exist', async () => {
      (mockPrisma.category.count as any).mockResolvedValue(12);

      await service.createDefaultCategories(householdId);

      expect(mockPrisma.category.createMany).not.toHaveBeenCalled();
    });
  });
});
