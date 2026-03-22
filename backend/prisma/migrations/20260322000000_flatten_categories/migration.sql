-- Step 1: Reassign CAR_MAINTENANCE foreign keys to CAR (per household)

-- Reassign transactions
UPDATE "Transaction" t
SET "categoryId" = c_car."id"
FROM "Category" c_maint, "Category" c_car
WHERE t."categoryId" = c_maint."id"
  AND c_maint."name" = 'CAR_MAINTENANCE'
  AND c_car."name" = 'CAR'
  AND c_car."householdId" = c_maint."householdId";

-- Reassign installments
UPDATE "Installment" i
SET "categoryId" = c_car."id"
FROM "Category" c_maint, "Category" c_car
WHERE i."categoryId" = c_maint."id"
  AND c_maint."name" = 'CAR_MAINTENANCE'
  AND c_car."name" = 'CAR'
  AND c_car."householdId" = c_maint."householdId";

-- Reassign fixed costs
UPDATE "FixedCost" fc
SET "categoryId" = c_car."id"
FROM "Category" c_maint, "Category" c_car
WHERE fc."categoryId" = c_maint."id"
  AND c_maint."name" = 'CAR_MAINTENANCE'
  AND c_car."name" = 'CAR'
  AND c_car."householdId" = c_maint."householdId";

-- Delete CAR_MAINTENANCE budgets where CAR budget already exists
DELETE FROM "Budget" b
USING "Category" c_maint, "Category" c_car
WHERE b."categoryId" = c_maint."id"
  AND c_maint."name" = 'CAR_MAINTENANCE'
  AND c_car."name" = 'CAR'
  AND c_car."householdId" = c_maint."householdId"
  AND EXISTS (
    SELECT 1 FROM "Budget" b2 WHERE b2."categoryId" = c_car."id"
  );

-- Reassign remaining CAR_MAINTENANCE budgets to CAR
UPDATE "Budget" b
SET "categoryId" = c_car."id"
FROM "Category" c_maint, "Category" c_car
WHERE b."categoryId" = c_maint."id"
  AND c_maint."name" = 'CAR_MAINTENANCE'
  AND c_car."name" = 'CAR'
  AND c_car."householdId" = c_maint."householdId";

-- Step 2: Delete CAR_MAINTENANCE categories
DELETE FROM "Category" WHERE "name" = 'CAR_MAINTENANCE';

-- Step 3: Drop parentId column and index
DROP INDEX IF EXISTS "Category_parentId_idx";
ALTER TABLE "Category" DROP COLUMN IF EXISTS "parentId";
