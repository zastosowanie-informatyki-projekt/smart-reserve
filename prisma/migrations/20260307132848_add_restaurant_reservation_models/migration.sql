-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'RESTAURANT_OWNER');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "restaurant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "imageUrl" TEXT,
    "cuisine" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_table" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "guestCount" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opening_hours" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "restaurantId" TEXT NOT NULL,

    CONSTRAINT "opening_hours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "restaurant_ownerId_idx" ON "restaurant"("ownerId");

-- CreateIndex
CREATE INDEX "restaurant_city_idx" ON "restaurant"("city");

-- CreateIndex
CREATE INDEX "restaurant_table_restaurantId_idx" ON "restaurant_table"("restaurantId");

-- CreateIndex
CREATE INDEX "reservation_userId_idx" ON "reservation"("userId");

-- CreateIndex
CREATE INDEX "reservation_tableId_idx" ON "reservation"("tableId");

-- CreateIndex
CREATE INDEX "reservation_restaurantId_idx" ON "reservation"("restaurantId");

-- CreateIndex
CREATE INDEX "reservation_startTime_tableId_idx" ON "reservation"("startTime", "tableId");

-- CreateIndex
CREATE UNIQUE INDEX "opening_hours_restaurantId_dayOfWeek_key" ON "opening_hours"("restaurantId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "restaurant" ADD CONSTRAINT "restaurant_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_table" ADD CONSTRAINT "restaurant_table_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "restaurant_table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opening_hours" ADD CONSTRAINT "opening_hours_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
