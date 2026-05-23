import type { DecorationPreset, LocalElement } from "./types";

export interface DecorationPresetConfig {
  id: DecorationPreset;
  label: string;
  sizeHint: string;
  width: number;
  height: number;
  shape: "rect" | "line";
  fill: string;
  stroke: string;
  defaultLabel: string;
  editableLabel: boolean;
}

/** Grid-aligned defaults based on common door/window/fixture dimensions. */
export const DECORATION_PRESETS: DecorationPresetConfig[] = [
  {
    id: "door",
    label: "Door",
    sizeHint: "90×24 px",
    width: 90,
    height: 24,
    shape: "rect",
    fill: "#92400e",
    stroke: "#78350f",
    defaultLabel: "DOOR",
    editableLabel: true,
  },
  {
    id: "window",
    label: "Window",
    sizeHint: "120×20 px",
    width: 120,
    height: 20,
    shape: "rect",
    fill: "#bae6fd",
    stroke: "#0284c7",
    defaultLabel: "WINDOW",
    editableLabel: true,
  },
  {
    id: "wall",
    label: "Wall",
    sizeHint: "200×12 px segment",
    width: 200,
    height: 12,
    shape: "line",
    fill: "#334155",
    stroke: "#0f172a",
    defaultLabel: "WALL",
    editableLabel: false,
  },
  {
    id: "toilet",
    label: "Toilet",
    sizeHint: "60×40 px",
    width: 60,
    height: 40,
    shape: "rect",
    fill: "#e0f2fe",
    stroke: "#0369a1",
    defaultLabel: "TOILET",
    editableLabel: true,
  },
];

export function getDecorationPreset(id: DecorationPreset): DecorationPresetConfig {
  const preset = DECORATION_PRESETS.find((entry) => entry.id === id);
  if (!preset) {
    throw new Error(`Unknown decoration preset: ${id}`);
  }
  return preset;
}

export function detectDecorationPreset(
  el: Pick<LocalElement, "fill" | "shape">,
): DecorationPreset | null {
  if (el.shape === "line") return "wall";

  const match = DECORATION_PRESETS.find(
    (preset) => preset.shape !== "line" && preset.fill === el.fill,
  );
  return match?.id ?? null;
}

export function decorationPresetToElementFields(
  preset: DecorationPresetConfig,
): Pick<LocalElement, "width" | "height" | "shape" | "fill" | "stroke" | "label" | "decorationPreset"> {
  return {
    width: preset.width,
    height: preset.height,
    shape: preset.shape,
    fill: preset.fill,
    stroke: preset.stroke,
    label: preset.defaultLabel,
    decorationPreset: preset.id,
  };
}
