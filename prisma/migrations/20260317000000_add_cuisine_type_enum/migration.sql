-- CreateEnum
CREATE TYPE "CuisineType" AS ENUM (
  'ITALIAN',
  'FRENCH',
  'JAPANESE',
  'CHINESE',
  'INDIAN',
  'MEXICAN',
  'AMERICAN',
  'MEDITERRANEAN',
  'THAI',
  'GREEK',
  'SPANISH',
  'MIDDLE_EASTERN',
  'KOREAN',
  'VIETNAMESE',
  'POLISH',
  'GERMAN',
  'OTHER'
);

-- AlterTable: drop old cuisine string column, add new cuisines array column
ALTER TABLE "restaurant" DROP COLUMN IF EXISTS "cuisine";
ALTER TABLE "restaurant" ADD COLUMN "cuisines" "CuisineType"[] NOT NULL DEFAULT '{}';
