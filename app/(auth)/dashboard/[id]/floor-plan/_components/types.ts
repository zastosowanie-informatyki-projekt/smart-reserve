import type { RoomWithFloorPlan, EnrichedFloorPlanElement } from "@/server/rooms/types";

export type { RoomWithFloorPlan, EnrichedFloorPlanElement };

export interface LocalElement {
  id: string;
  type: "table" | "decoration";
  tableId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  shape: "rect" | "circle" | "line";
  fill?: string;
  stroke?: string;
  label?: string;
  // enriched / local-only data (not saved to DB directly)
  tableLabel?: string;
  tableCapacity?: number;
  tableDescription?: string;
  tableIsActive?: boolean;
}

export interface RoomEntry {
  id: string;
  name: string;
  description: string | null;
  tables: Array<{
    id: string;
    label: string;
    capacity: number;
    description: string | null;
    isActive: boolean;
  }>;
}

export type EditorTool = "select" | "add-table";
export type DecorationPreset = "door" | "window" | "wall" | "toilet";
