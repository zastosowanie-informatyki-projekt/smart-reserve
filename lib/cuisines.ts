import { CuisineType } from "@/app/generated/prisma/client";

export const CUISINE_OPTIONS: { value: CuisineType; label: string }[] = [
  { value: "ITALIAN", label: "Italian" },
  { value: "FRENCH", label: "French" },
  { value: "JAPANESE", label: "Japanese" },
  { value: "CHINESE", label: "Chinese" },
  { value: "INDIAN", label: "Indian" },
  { value: "MEXICAN", label: "Mexican" },
  { value: "AMERICAN", label: "American" },
  { value: "MEDITERRANEAN", label: "Mediterranean" },
  { value: "THAI", label: "Thai" },
  { value: "GREEK", label: "Greek" },
  { value: "SPANISH", label: "Spanish" },
  { value: "MIDDLE_EASTERN", label: "Middle Eastern" },
  { value: "KOREAN", label: "Korean" },
  { value: "VIETNAMESE", label: "Vietnamese" },
  { value: "POLISH", label: "Polish" },
  { value: "GERMAN", label: "German" },
  { value: "OTHER", label: "Other" },
];

export const CUISINE_LABEL: Record<CuisineType, string> = Object.fromEntries(
  CUISINE_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<CuisineType, string>;
