import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { addDays } from 'date-fns';
import type { RegisterInput, LoginInput, AcceptInviteInput } from '../types';

const SALT_ROUNDS = 10;
const INVITATION_EXPIRY_DAYS = 7;

export function createAuthService(prisma: PrismaClient) {
  return {
    async register(input: RegisterInput) {
      const { email, password, name, householdName } = input;

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Create household and user in transaction
      const result = await prisma.$transaction(async (tx) => {
        const household = await tx.household.create({
          data: { name: householdName },
        });

        const user = await tx.user.create({
          data: {
            email,
            passwordHash,
            name,
            householdId: household.id,
          },
          select: {
            id: true,
            email: true,
            name: true,
            householdId: true,
            createdAt: true,
          },
        });

        return user;
      });

      return result;
    },

    async login(input: LoginInput) {
      const { email, password } = input;

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          householdId: true,
          passwordHash: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        throw new Error('Invalid email or password');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    },

    async getUserById(id: string) {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          householdId: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    },

    async createInvitation(email: string, invitedById: string, householdId: string) {
      // Check if email already registered
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('This email is already registered');
      }

      // Check for existing pending invitation
      const existingInvitation = await prisma.invitation.findFirst({
        where: {
          email,
          householdId,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (existingInvitation) {
        // Return existing invitation
        return existingInvitation;
      }

      // Create new invitation
      const token = nanoid(32);
      const invitation = await prisma.invitation.create({
        data: {
          email,
          token,
          householdId,
          invitedById,
          expiresAt: addDays(new Date(), INVITATION_EXPIRY_DAYS),
        },
      });

      return invitation;
    },

    async getInvitation(token: string) {
      const invitation = await prisma.invitation.findUnique({
        where: { token },
        include: {
          invitedBy: {
            include: {
              household: true,
            },
          },
        },
      });

      if (!invitation) {
        throw new Error('Invitation not found');
      }

      if (invitation.usedAt) {
        throw new Error('Invitation has already been used');
      }

      if (invitation.expiresAt < new Date()) {
        throw new Error('Invitation has expired');
      }

      return {
        email: invitation.email,
        householdName: invitation.invitedBy.household.name,
      };
    },

    async acceptInvitation(input: AcceptInviteInput) {
      const { token, name, password } = input;

      const invitation = await prisma.invitation.findUnique({
        where: { token },
      });

      if (!invitation) {
        throw new Error('Invitation not found');
      }

      if (invitation.usedAt) {
        throw new Error('Invitation has already been used');
      }

      if (invitation.expiresAt < new Date()) {
        throw new Error('Invitation has expired');
      }

      // Check if email is already registered
      const existingUser = await prisma.user.findUnique({
        where: { email: invitation.email },
      });

      if (existingUser) {
        throw new Error('Email is already registered');
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Create user and mark invitation as used
      const user = await prisma.$transaction(async (tx) => {
        await tx.invitation.update({
          where: { id: invitation.id },
          data: { usedAt: new Date() },
        });

        return tx.user.create({
          data: {
            email: invitation.email,
            passwordHash,
            name,
            householdId: invitation.householdId,
          },
          select: {
            id: true,
            email: true,
            name: true,
            householdId: true,
            createdAt: true,
          },
        });
      });

      return user;
    },

    async getHouseholdMembers(householdId: string) {
      return prisma.user.findMany({
        where: { householdId },
        select: {
          id: true,
          email: true,
          name: true,
          householdId: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      });
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
