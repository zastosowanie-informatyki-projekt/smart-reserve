-- Drop old columns from employee_invitation
ALTER TABLE "employee_invitation" DROP COLUMN IF EXISTS "email";
ALTER TABLE "employee_invitation" DROP COLUMN IF EXISTS "token";
ALTER TABLE "employee_invitation" DROP COLUMN IF EXISTS "expiresAt";

-- Add new columns
ALTER TABLE "employee_invitation" ADD COLUMN "userId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "employee_invitation" ADD COLUMN "declinedAt" TIMESTAMP(3);

-- Remove the DEFAULT after backfill (column now has real data)
ALTER TABLE "employee_invitation" ALTER COLUMN "userId" DROP DEFAULT;

-- Add foreign key to user
ALTER TABLE "employee_invitation" ADD CONSTRAINT "employee_invitation_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add unique constraint
ALTER TABLE "employee_invitation" ADD CONSTRAINT "employee_invitation_userId_restaurantId_key"
  UNIQUE ("userId", "restaurantId");

-- Add index on userId
CREATE INDEX "employee_invitation_userId_idx" ON "employee_invitation"("userId");

-- Add relation column on user side (no DB change needed, Prisma handles this)
