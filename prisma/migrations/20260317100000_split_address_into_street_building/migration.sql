-- Drop old address column and add street + buildingNumber
ALTER TABLE "restaurant" DROP COLUMN "address";
ALTER TABLE "restaurant" ADD COLUMN "street" TEXT NOT NULL DEFAULT '';
ALTER TABLE "restaurant" ADD COLUMN "buildingNumber" TEXT NOT NULL DEFAULT '';
