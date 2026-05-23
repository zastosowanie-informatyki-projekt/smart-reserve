export type TableCapacityPreset = 2 | 4 | 6;

export interface TablePreset {
  capacity: TableCapacityPreset;
  label: string;
  /** Approximate real-world size hint shown in the UI */
  sizeHint: string;
  width: number;
  height: number;
  shape: "rect" | "circle";
}

/** Grid-aligned defaults based on common restaurant table dimensions. */
export const TABLE_PRESETS: TablePreset[] = [
  {
    capacity: 2,
    label: "2 seats",
    sizeHint: "~60 cm",
    width: 60,
    height: 60,
    shape: "circle",
  },
  {
    capacity: 4,
    label: "4 seats",
    sizeHint: "~80 cm",
    width: 80,
    height: 80,
    shape: "rect",
  },
  {
    capacity: 6,
    label: "6 seats",
    sizeHint: "~120×80 cm",
    width: 120,
    height: 80,
    shape: "rect",
  },
];

export const DEFAULT_TABLE_PRESET: TableCapacityPreset = 4;

export function getTablePreset(capacity: TableCapacityPreset): TablePreset {
  const preset = TABLE_PRESETS.find((entry) => entry.capacity === capacity);
  if (!preset) {
    throw new Error(`Unknown table preset: ${capacity}`);
  }
  return preset;
}

export function findClosestTablePreset(capacity: number): TableCapacityPreset {
  const match = TABLE_PRESETS.find((entry) => entry.capacity === capacity);
  if (match) return match.capacity;

  if (capacity <= 2) return 2;
  if (capacity <= 4) return 4;
  return 6;
}
