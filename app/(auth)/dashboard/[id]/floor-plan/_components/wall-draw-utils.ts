import Konva from "konva";
import type { LocalElement } from "./types";
import { decorationPresetToElementFields, getDecorationPreset } from "./decoration-presets";

export const GRID_SIZE = 20;
const WALL_ANGLE_SNAP_STEP = 45;

export interface CanvasPoint {
  x: number;
  y: number;
}

export function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

export function snapCanvasPoint(point: CanvasPoint): CanvasPoint {
  return { x: snapToGrid(point.x), y: snapToGrid(point.y) };
}

/** Snap wall direction to 45° increments and length to grid (IKEA-style). */
export function snapWallEndpoint(start: CanvasPoint, end: CanvasPoint): CanvasPoint {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  if (length < GRID_SIZE) {
    return snapCanvasPoint(end);
  }

  const snapRad = (WALL_ANGLE_SNAP_STEP * Math.PI) / 180;
  const angle = Math.round(Math.atan2(dy, dx) / snapRad) * snapRad;
  const snappedLength = Math.max(GRID_SIZE, snapToGrid(length));

  return {
    x: snapToGrid(start.x + Math.cos(angle) * snappedLength),
    y: snapToGrid(start.y + Math.sin(angle) * snappedLength),
  };
}

export function createWallElementFromPoints(
  start: CanvasPoint,
  end: CanvasPoint,
): LocalElement | null {
  const origin = snapCanvasPoint(start);
  const target = snapWallEndpoint(origin, end);

  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const width = Math.hypot(dx, dy);
  if (width < GRID_SIZE) return null;

  const wallPreset = getDecorationPreset("wall");
  const wallFields = decorationPresetToElementFields(wallPreset);
  const rotation = (Math.atan2(dy, dx) * 180) / Math.PI;

  return {
    id: crypto.randomUUID(),
    type: "decoration",
    x: origin.x,
    y: origin.y,
    width: snapToGrid(width),
    height: wallFields.height,
    rotation,
    shape: wallFields.shape,
    fill: wallFields.fill,
    stroke: wallFields.stroke,
    label: wallFields.label,
    decorationPreset: wallFields.decorationPreset,
  };
}

export function stagePointerToCanvas(
  pointer: CanvasPoint,
  scale: number,
): CanvasPoint {
  return {
    x: pointer.x / scale,
    y: pointer.y / scale,
  };
}

/** Map screen pointer position to floor-plan canvas coordinates (accounts for pan/zoom). */
export function getCanvasPointFromStage(stage: Konva.Stage): CanvasPoint | null {
  const pointer = stage.getPointerPosition();
  if (!pointer) return null;
  const transform = stage.getAbsoluteTransform().copy().invert();
  return transform.point(pointer);
}

export function wallElementEndPoint(
  wall: Pick<LocalElement, "x" | "y" | "width" | "rotation">,
): CanvasPoint {
  const radians = (wall.rotation * Math.PI) / 180;
  return {
    x: wall.x + Math.cos(radians) * wall.width,
    y: wall.y + Math.sin(radians) * wall.width,
  };
}
