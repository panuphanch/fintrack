import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Default categories to seed
const DEFAULT_CATEGORIES = [
  { name: 'HOME', label: 'Home', color: '#3b82f6', icon: 'home', sortOrder: 0, isSystem: true },
  { name: 'HEALTH', label: 'Health', color: '#22c55e', icon: 'heart', sortOrder: 1, isSystem: true },
  { name: 'GADGET', label: 'Gadget', color: '#8b5cf6', icon: 'device-mobile', sortOrder: 2, isSystem: true },
  { name: 'CLOTHES', label: 'Clothes', color: '#ec4899', icon: 'shopping-bag', sortOrder: 3, isSystem: true },
  { name: 'CAR', label: 'Car', color: '#f97316', icon: 'truck', sortOrder: 4, isSystem: true },
  { name: 'CAR_MAINTENANCE', label: 'Car Maintenance', color: '#f59e0b', icon: 'wrench', sortOrder: 5, isSystem: true },
  { name: 'BAKERY', label: 'Bakery', color: '#a855f7', icon: 'cake', sortOrder: 6, isSystem: true },
  { name: 'FOOD_DINING', label: 'Food & Dining', color: '#ef4444', icon: 'fire', sortOrder: 7, isSystem: true },
  { name: 'ENTERTAINMENT', label: 'Entertainment', color: '#06b6d4', icon: 'film', sortOrder: 8, isSystem: true },
  { name: 'TRAVEL', label: 'Travel', color: '#14b8a6', icon: 'globe', sortOrder: 9, isSystem: true },
  { name: 'FIXED', label: 'Fixed', color: '#6b7280', icon: 'calendar', sortOrder: 10, isSystem: true },
  { name: 'OTHERS', label: 'Others', color: '#9ca3af', icon: 'dots-horizontal', sortOrder: 11, isSystem: true },
];

async function main() {
  console.log('Seeding database...');

  // Create a test household
  const household = await prisma.household.create({
    data: {
      name: 'Demo Family',
    },
  });

  console.log(`Created household: ${household.name}`);

  // Create categories for the household
  const categoryMap = new Map<string, string>();
  for (const catData of DEFAULT_CATEGORIES) {
    const category = await prisma.category.create({
      data: {
        ...catData,
        householdId: household.id,
      },
    });
    categoryMap.set(category.name, category.id);
  }

  console.log(`Created ${DEFAULT_CATEGORIES.length} categories`);

  const getCategoryId = (name: string): string => {
    const id = categoryMap.get(name);
    if (!id) throw new Error(`Category not found: ${name}`);
    return id;
  };

  // Create test users
  const passwordHash = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      passwordHash,
      name: 'Alice',
      householdId: household.id,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      passwordHash,
      name: 'Bob',
      householdId: household.id,
    },
  });

  console.log(`Created users: ${user1.name}, ${user2.name}`);

  // Create credit cards
  const card1 = await prisma.creditCard.create({
    data: {
      name: 'Main Card',
      bank: 'Bank A',
      lastFour: '1234',
      color: '#3b82f6',
      cutoffDay: 12,
      dueDay: 1,
      creditLimit: 200000,
      householdId: household.id,
      ownerId: user1.id,
    },
  });

  const card2 = await prisma.creditCard.create({
    data: {
      name: 'Rewards Card',
      bank: 'Bank B',
      lastFour: '5678',
      color: '#22c55e',
      cutoffDay: 15,
      dueDay: 8,
      creditLimit: 100000,
      householdId: household.id,
      ownerId: user2.id,
    },
  });

  console.log('Created 2 credit cards');

  // Create installments
  const installments = [
    { cardId: card1.id, name: 'Laptop', monthlyAmount: 3000, current: 3, total: 10, category: 'GADGET' },
    { cardId: card1.id, name: 'Sofa', monthlyAmount: 2500, current: 5, total: 12, category: 'HOME' },
    { cardId: card2.id, name: 'Phone', monthlyAmount: 1500, current: 2, total: 10, category: 'GADGET' },
  ];

  for (const inst of installments) {
    await prisma.installment.create({
      data: {
        name: inst.name,
        totalAmount: inst.monthlyAmount * inst.total,
        monthlyAmount: inst.monthlyAmount,
        currentInstallment: inst.current,
        totalInstallments: inst.total,
        categoryId: getCategoryId(inst.category),
        startDate: new Date('2024-01-01'),
        householdId: household.id,
        cardId: inst.cardId,
        createdById: user1.id,
        isActive: inst.current <= inst.total,
      },
    });
  }

  console.log(`Created ${installments.length} installments`);

  // Create fixed costs
  const fixedCosts = [
    { name: 'Home Loan', amount: 15000, category: 'FIXED', dueDay: null },
    { name: 'Car Loan', amount: 12000, category: 'FIXED', dueDay: null },
    { name: 'Electric Bill', amount: 3000, category: 'FIXED', dueDay: null },
    { name: 'Internet', amount: 800, category: 'FIXED', dueDay: 1 },
    { name: 'Streaming', amount: 350, category: 'ENTERTAINMENT', dueDay: 1 },
  ];

  for (const fc of fixedCosts) {
    await prisma.fixedCost.create({
      data: {
        name: fc.name,
        amount: fc.amount,
        categoryId: getCategoryId(fc.category),
        dueDay: fc.dueDay,
        householdId: household.id,
        createdById: user1.id,
      },
    });
  }

  console.log(`Created ${fixedCosts.length} fixed costs`);

  // Create budgets
  const budgets = [
    { category: 'GADGET', monthlyLimit: 15000 },
    { category: 'HOME', monthlyLimit: 20000 },
    { category: 'FOOD_DINING', monthlyLimit: 10000 },
  ];

  for (const budget of budgets) {
    await prisma.budget.create({
      data: {
        categoryId: getCategoryId(budget.category),
        monthlyLimit: budget.monthlyLimit,
        householdId: household.id,
      },
    });
  }

  console.log(`Created ${budgets.length} budgets`);

  console.log('Seeding completed!');
  console.log('\nTest accounts:');
  console.log('  Email: user1@example.com');
  console.log('  Email: user2@example.com');
  console.log('  Password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
