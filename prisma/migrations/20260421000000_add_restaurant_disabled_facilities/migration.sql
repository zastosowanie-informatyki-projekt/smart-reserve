-- AlterTable: add accessibility flag for restaurants
ALTER TABLE "restaurant" ADD COLUMN "hasDisabledFacilities" BOOLEAN NOT NULL DEFAULT false;
