import bcrypt from 'bcrypt';
import { mockPrisma, resetMocks } from '../__mocks__/prisma';
import { createAuthService } from './auth.service';

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'mock-token-32chars-xxxxxxxxxxxx'),
}));

const service = createAuthService(mockPrisma);
const householdId = 'household-1';
const userId = 'user-1';

const mockUser = {
  id: userId,
  email: 'test@test.com',
  name: 'Test',
  householdId,
  passwordHash: 'hashed-password',
  createdAt: new Date(),
};

beforeEach(() => {
  resetMocks();
});

describe('AuthService', () => {
  describe('register', () => {
    it('should create user and household in transaction', async () => {
      (mockPrisma.user.findUnique as any).mockResolvedValue(null);
      (bcrypt.hash as any).mockResolvedValue('hashed-pass');
      // $transaction calls the callback with mockPrisma
      const expectedUser = { id: userId, email: 'test@test.com', name: 'Test', householdId };
      (mockPrisma.household.create as any).mockResolvedValue({ id: householdId, name: 'Home' });
      (mockPrisma.user.create as any).mockResolvedValue(expectedUser);

      const result = await service.register({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test',
        householdName: 'Home',
      });

      expect(result).toEqual(expectedUser);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should throw if email already registered', async () => {
      (mockPrisma.user.findUnique as any).mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@test.com',
          password: 'pass',
          name: 'Test',
          householdName: 'Home',
        })
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should return user without passwordHash on valid credentials', async () => {
      (mockPrisma.user.findUnique as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await service.login({ email: 'test@test.com', password: 'password123' });

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toBe('test@test.com');
    });

    it('should throw on invalid email', async () => {
      (mockPrisma.user.findUnique as any).mockResolvedValue(null);

      await expect(
        service.login({ email: 'bad@test.com', password: 'pass' })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw on wrong password', async () => {
      (mockPrisma.user.findUnique as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' })
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('getUserById', () => {
    it('should return user', async () => {
      const user = { id: userId, email: 'test@test.com', name: 'Test', householdId };
      (mockPrisma.user.findUnique as any).mockResolvedValue(user);

      const result = await service.getUserById(userId);

      expect(result).toEqual(user);
    });

    it('should throw if user not found', async () => {
      (mockPrisma.user.findUnique as any).mockResolvedValue(null);

      await expect(service.getUserById('bad-id')).rejects.toThrow('User not found');
    });
  });

  describe('createInvitation', () => {
    it('should create a new invitation', async () => {
      (mockPrisma.user.findUnique as any).mockResolvedValue(null);
      (mockPrisma.invitation.findFirst as any).mockResolvedValue(null);
      const mockInvitation = { id: 'inv-1', email: 'new@test.com', token: 'mock-token' };
      (mockPrisma.invitation.create as any).mockResolvedValue(mockInvitation);

      const result = await service.createInvitation('new@test.com', userId, householdId);

      expect(result).toEqual(mockInvitation);
      expect(mockPrisma.invitation.create).toHaveBeenCalled();
    });

    it('should return existing pending invitation', async () => {
      (mockPrisma.user.findUnique as any).mockResolvedValue(null);
      const existingInvitation = { id: 'inv-1', email: 'new@test.com' };
      (mockPrisma.invitation.findFirst as any).mockResolvedValue(existingInvitation);

      const result = await service.createInvitation('new@test.com', userId, householdId);

      expect(result).toEqual(existingInvitation);
      expect(mockPrisma.invitation.create).not.toHaveBeenCalled();
    });

    it('should throw if email already registered', async () => {
      (mockPrisma.user.findUnique as any).mockResolvedValue(mockUser);

      await expect(
        service.createInvitation('test@test.com', userId, householdId)
      ).rejects.toThrow('This email is already registered');
    });
  });

  describe('getInvitation', () => {
    it('should return valid invitation info', async () => {
      (mockPrisma.invitation.findUnique as any).mockResolvedValue({
        email: 'new@test.com',
        usedAt: null,
        expiresAt: new Date(Date.now() + 86400000), // tomorrow
        invitedBy: { household: { name: 'Home' } },
      });

      const result = await service.getInvitation('valid-token');

      expect(result).toEqual({ email: 'new@test.com', householdName: 'Home' });
    });

    it('should throw if invitation not found', async () => {
      (mockPrisma.invitation.findUnique as any).mockResolvedValue(null);

      await expect(service.getInvitation('bad-token')).rejects.toThrow('Invitation not found');
    });

    it('should throw if invitation already used', async () => {
      (mockPrisma.invitation.findUnique as any).mockResolvedValue({
        usedAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
        invitedBy: { household: { name: 'Home' } },
      });

      await expect(service.getInvitation('used-token')).rejects.toThrow(
        'Invitation has already been used'
      );
    });

    it('should throw if invitation expired', async () => {
      (mockPrisma.invitation.findUnique as any).mockResolvedValue({
        usedAt: null,
        expiresAt: new Date(Date.now() - 86400000), // yesterday
        invitedBy: { household: { name: 'Home' } },
      });

      await expect(service.getInvitation('expired-token')).rejects.toThrow(
        'Invitation has expired'
      );
    });
  });

  describe('acceptInvitation', () => {
    const validInvitation = {
      id: 'inv-1',
      email: 'new@test.com',
      token: 'valid-token',
      householdId,
      usedAt: null,
      expiresAt: new Date(Date.now() + 86400000),
    };

    it('should create user and mark invitation as used', async () => {
      (mockPrisma.invitation.findUnique as any).mockResolvedValue(validInvitation);
      (mockPrisma.user.findUnique as any).mockResolvedValue(null);
      (bcrypt.hash as any).mockResolvedValue('hashed-pass');
      const newUser = { id: 'user-2', email: 'new@test.com', name: 'New', householdId };
      (mockPrisma.invitation.update as any).mockResolvedValue({});
      (mockPrisma.user.create as any).mockResolvedValue(newUser);

      const result = await service.acceptInvitation({
        token: 'valid-token',
        name: 'New',
        password: 'password123',
      });

      expect(result).toEqual(newUser);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should throw if invitation not found', async () => {
      (mockPrisma.invitation.findUnique as any).mockResolvedValue(null);

      await expect(
        service.acceptInvitation({ token: 'bad', name: 'X', password: 'pass' })
      ).rejects.toThrow('Invitation not found');
    });

    it('should throw if invitation already used', async () => {
      (mockPrisma.invitation.findUnique as any).mockResolvedValue({
        ...validInvitation,
        usedAt: new Date(),
      });

      await expect(
        service.acceptInvitation({ token: 'used', name: 'X', password: 'pass' })
      ).rejects.toThrow('Invitation has already been used');
    });

    it('should throw if invitation expired', async () => {
      (mockPrisma.invitation.findUnique as any).mockResolvedValue({
        ...validInvitation,
        expiresAt: new Date(Date.now() - 86400000),
      });

      await expect(
        service.acceptInvitation({ token: 'expired', name: 'X', password: 'pass' })
      ).rejects.toThrow('Invitation has expired');
    });

    it('should throw if email already registered', async () => {
      (mockPrisma.invitation.findUnique as any).mockResolvedValue(validInvitation);
      (mockPrisma.user.findUnique as any).mockResolvedValue(mockUser);

      await expect(
        service.acceptInvitation({ token: 'valid', name: 'X', password: 'pass' })
      ).rejects.toThrow('Email is already registered');
    });
  });

  describe('getHouseholdMembers', () => {
    it('should return members ordered by creation date', async () => {
      const members = [
        { id: 'u1', email: 'a@test.com', name: 'A', householdId },
        { id: 'u2', email: 'b@test.com', name: 'B', householdId },
      ];
      (mockPrisma.user.findMany as any).mockResolvedValue(members);

      const result = await service.getHouseholdMembers(householdId);

      expect(result).toEqual(members);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { householdId },
          orderBy: { createdAt: 'asc' },
        })
      );
    });
  });
});
