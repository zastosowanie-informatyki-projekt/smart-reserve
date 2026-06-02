import type { TableCapacityPreset } from "@/app/(auth)/dashboard/[id]/floor-plan/_components/table-presets";
import { getTablePreset } from "@/app/(auth)/dashboard/[id]/floor-plan/_components/table-presets";
import type { CopilotAction, FloorPlanCopilotContext } from "./types";

const GRID_GAP = 40;
const MARGIN = 80;

interface ComputeTableLayoutInput {
  count: number;
  capacity: TableCapacityPreset;
  layout: "grid" | "row";
  context: FloorPlanCopilotContext;
  labelPrefix?: string;
}

export function computeTableLayout(input: ComputeTableLayoutInput): CopilotAction {
  const preset = getTablePreset(input.capacity);
  const existingTables = input.context.elements.filter((el) => el.type === "table").length;
  const cols = input.layout === "row" ? input.count : Math.ceil(Math.sqrt(input.count));
  const rows = Math.ceil(input.count / cols);

  const blockWidth = cols * preset.width + (cols - 1) * GRID_GAP;
  const blockHeight = rows * preset.height + (rows - 1) * GRID_GAP;
  const startX = Math.max(
    MARGIN,
    Math.round((input.context.canvasWidth - blockWidth) / 2 / 20) * 20,
  );
  const startY = Math.max(
    MARGIN,
    Math.round((input.context.canvasHeight - blockHeight) / 2 / 20) * 20,
  );

  const tables = Array.from({ length: input.count }, (_, index) => {
    const col = input.layout === "row" ? index : index % cols;
    const row = input.layout === "row" ? 0 : Math.floor(index / cols);
    const tableNumber = existingTables + index + 1;

    return {
      label: `${input.labelPrefix ?? "Table"} ${tableNumber}`,
      capacity: input.capacity,
      x: startX + col * (preset.width + GRID_GAP),
      y: startY + row * (preset.height + GRID_GAP),
      width: preset.width,
      height: preset.height,
      shape: preset.shape,
    };
  });

  return { type: "add_tables", tables };
}
