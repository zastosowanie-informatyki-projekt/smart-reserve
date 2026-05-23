import type { LocalElement, RoomShapePresetId } from "./types";
import { decorationPresetToElementFields, getDecorationPreset } from "./decoration-presets";

export interface RoomShapeWallSegment {
  x: number;
  y: number;
  width: number;
  rotation: number;
}

export interface RoomShapePreset {
  id: RoomShapePresetId;
  label: string;
  description: string;
  walls: RoomShapeWallSegment[];
}

/** Predefined room outlines as connected wall segments (grid-aligned). */
export const ROOM_SHAPE_PRESETS: RoomShapePreset[] = [
  {
    id: "rectangle",
    label: "Rectangle",
    description: "Standard dining room",
    walls: [
      { x: 160, y: 100, width: 580, rotation: 0 },
      { x: 740, y: 100, width: 400, rotation: 90 },
      { x: 160, y: 500, width: 580, rotation: 0 },
      { x: 160, y: 100, width: 400, rotation: 90 },
    ],
  },
  {
    id: "square",
    label: "Square",
    description: "Compact square room",
    walls: [
      { x: 250, y: 100, width: 400, rotation: 0 },
      { x: 650, y: 100, width: 400, rotation: 90 },
      { x: 250, y: 500, width: 400, rotation: 0 },
      { x: 250, y: 100, width: 400, rotation: 90 },
    ],
  },
  {
    id: "l-shape",
    label: "L-shape",
    description: "L-shaped layout",
    walls: [
      { x: 160, y: 80, width: 560, rotation: 0 },
      { x: 720, y: 80, width: 240, rotation: 90 },
      { x: 520, y: 320, width: 200, rotation: 0 },
      { x: 520, y: 320, width: 160, rotation: 90 },
      { x: 160, y: 480, width: 360, rotation: 0 },
      { x: 160, y: 80, width: 400, rotation: 90 },
    ],
  },
];

export function getRoomShapePreset(id: RoomShapePresetId): RoomShapePreset {
  const preset = ROOM_SHAPE_PRESETS.find((entry) => entry.id === id);
  if (!preset) {
    throw new Error(`Unknown room shape preset: ${id}`);
  }
  return preset;
}

export function isWallElement(el: LocalElement): boolean {
  return el.type === "decoration" && (el.shape === "line" || el.decorationPreset === "wall");
}

export function buildRoomShapeElements(shapeId: RoomShapePresetId): LocalElement[] {
  const shape = getRoomShapePreset(shapeId);
  const wallPreset = getDecorationPreset("wall");
  const wallFields = decorationPresetToElementFields(wallPreset);

  return shape.walls.map((segment) => ({
    id: crypto.randomUUID(),
    type: "decoration" as const,
    x: segment.x,
    y: segment.y,
    width: segment.width,
    height: wallFields.height,
    rotation: segment.rotation,
    shape: wallFields.shape,
    fill: wallFields.fill,
    stroke: wallFields.stroke,
    label: wallFields.label,
    decorationPreset: wallFields.decorationPreset,
  }));
}

export function countWallElements(elements: LocalElement[]): number {
  return elements.filter(isWallElement).length;
}
