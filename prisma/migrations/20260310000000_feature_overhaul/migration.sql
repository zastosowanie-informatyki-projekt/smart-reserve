-- AlterEnum: Add EMPLOYEE to UserRole
ALTER TYPE "UserRole" ADD VALUE 'EMPLOYEE';

-- AlterTable: Add onboarded to user
ALTER TABLE "user" ADD COLUMN "onboarded" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Add website to restaurant
ALTER TABLE "restaurant" ADD COLUMN "website" TEXT;

-- CreateTable: room
CREATE TABLE "room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "room_restaurantId_idx" ON "room"("restaurantId");

ALTER TABLE "room" ADD CONSTRAINT "room_restaurantId_fkey"
    FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data migration: create a default "Main" room for each existing restaurant
INSERT INTO "room" ("id", "name", "restaurantId", "updatedAt")
SELECT
    gen_random_uuid()::text,
    'Main',
    r."id",
    NOW()
FROM "restaurant" r;

-- AlterTable: Add roomId to restaurant_table
ALTER TABLE "restaurant_table" ADD COLUMN "roomId" TEXT;

-- Data migration: set roomId for existing tables to the default room
UPDATE "restaurant_table" t
SET "roomId" = r."id"
FROM "room" r
WHERE r."restaurantId" = t."restaurantId";

-- Make roomId NOT NULL now that all rows have a value
ALTER TABLE "restaurant_table" ALTER COLUMN "roomId" SET NOT NULL;

-- Drop the old foreign key and index for restaurantId
ALTER TABLE "restaurant_table" DROP CONSTRAINT IF EXISTS "restaurant_table_restaurantId_fkey";
DROP INDEX IF EXISTS "restaurant_table_restaurantId_idx";

-- Drop restaurantId column from restaurant_table
ALTER TABLE "restaurant_table" DROP COLUMN "restaurantId";

-- Add new index and foreign key for roomId
CREATE INDEX "restaurant_table_roomId_idx" ON "restaurant_table"("roomId");

ALTER TABLE "restaurant_table" ADD CONSTRAINT "restaurant_table_roomId_fkey"
    FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: restaurant_photo
CREATE TABLE "restaurant_photo" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurant_photo_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "restaurant_photo_restaurantId_idx" ON "restaurant_photo"("restaurantId");

ALTER TABLE "restaurant_photo" ADD CONSTRAINT "restaurant_photo_restaurantId_fkey"
    FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: restaurant_employee
CREATE TABLE "restaurant_employee" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurant_employee_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "restaurant_employee_userId_restaurantId_key" ON "restaurant_employee"("userId", "restaurantId");
CREATE INDEX "restaurant_employee_userId_idx" ON "restaurant_employee"("userId");
CREATE INDEX "restaurant_employee_restaurantId_idx" ON "restaurant_employee"("restaurantId");

ALTER TABLE "restaurant_employee" ADD CONSTRAINT "restaurant_employee_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "restaurant_employee" ADD CONSTRAINT "restaurant_employee_restaurantId_fkey"
    FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: employee_invitation
CREATE TABLE "employee_invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_invitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "employee_invitation_token_key" ON "employee_invitation"("token");
CREATE INDEX "employee_invitation_email_idx" ON "employee_invitation"("email");
CREATE INDEX "employee_invitation_restaurantId_idx" ON "employee_invitation"("restaurantId");

ALTER TABLE "employee_invitation" ADD CONSTRAINT "employee_invitation_restaurantId_fkey"
    FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: notification
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notification_userId_read_idx" ON "notification"("userId", "read");

ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Mark existing users as onboarded so they don't get forced through onboarding
UPDATE "user" SET "onboarded" = true;
