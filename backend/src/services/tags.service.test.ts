import { mockPrisma, resetMocks } from '../__mocks__/prisma';
import { createTagsService } from './tags.service';

const service = createTagsService(mockPrisma);
const householdId = 'household-1';

beforeEach(() => {
  resetMocks();
});

describe('TagsService', () => {
  describe('list', () => {
    it('should return tags ordered by name', async () => {
      const tags = [
        { id: '1', name: 'Food', householdId },
        { id: '2', name: 'Travel', householdId },
      ];
      (mockPrisma.tag.findMany as any).mockResolvedValue(tags);

      const result = await service.list(householdId);

      expect(result).toEqual(tags);
      expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
        where: { householdId },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('should create a tag', async () => {
      const newTag = { id: '1', name: 'Food', householdId };
      (mockPrisma.tag.findFirst as any).mockResolvedValue(null);
      (mockPrisma.tag.create as any).mockResolvedValue(newTag);

      const result = await service.create({ name: 'Food' }, householdId);

      expect(result).toEqual(newTag);
      expect(mockPrisma.tag.create).toHaveBeenCalledWith({
        data: { name: 'Food', householdId },
      });
    });

    it('should throw if tag name already exists', async () => {
      (mockPrisma.tag.findFirst as any).mockResolvedValue({ id: '1', name: 'Food', householdId });

      await expect(service.create({ name: 'Food' }, householdId)).rejects.toThrow(
        'Tag with this name already exists'
      );
      expect(mockPrisma.tag.create).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a tag not in use', async () => {
      (mockPrisma.tag.findFirst as any).mockResolvedValue({ id: '1', name: 'Food', householdId });
      (mockPrisma.transactionTag.count as any).mockResolvedValue(0);

      await service.delete('1', householdId);

      expect(mockPrisma.tag.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw if tag not found', async () => {
      (mockPrisma.tag.findFirst as any).mockResolvedValue(null);

      await expect(service.delete('999', householdId)).rejects.toThrow('Tag not found');
      expect(mockPrisma.tag.delete).not.toHaveBeenCalled();
    });

    it('should throw if tag is in use', async () => {
      (mockPrisma.tag.findFirst as any).mockResolvedValue({ id: '1', name: 'Food', householdId });
      (mockPrisma.transactionTag.count as any).mockResolvedValue(3);

      await expect(service.delete('1', householdId)).rejects.toThrow(
        'Tag is used in 3 transactions. Remove it from transactions first.'
      );
      expect(mockPrisma.tag.delete).not.toHaveBeenCalled();
    });
  });
});
