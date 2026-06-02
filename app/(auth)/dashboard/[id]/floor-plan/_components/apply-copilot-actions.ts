import { createTable } from "@/server/tables/actions/create-table";
import type { CopilotAction } from "@/lib/floor-plan-copilot/types";
import {
  decorationPresetToElementFields,
  getDecorationPreset,
} from "./decoration-presets";
import { buildRoomShapeElements, isWallElement } from "./room-shape-presets";
import type { LocalElement } from "./types";

interface ApplyCopilotActionsDeps {
  roomId: string;
  setCurrentElements: (updater: (prev: LocalElement[]) => LocalElement[]) => void;
}

export async function applyCopilotActions(
  actions: CopilotAction[],
  { roomId, setCurrentElements }: ApplyCopilotActionsDeps,
): Promise<{ applied: number; errors: string[] }> {
  let applied = 0;
  const errors: string[] = [];

  for (const action of actions) {
    if (action.type === "apply_room_outline") {
      const wallElements = buildRoomShapeElements(action.shape);
      setCurrentElements((prev) => [
        ...prev.filter((el) => !isWallElement(el)),
        ...wallElements,
      ]);
      applied += 1;
      continue;
    }

    if (action.type === "remove_walls") {
      setCurrentElements((prev) => prev.filter((el) => !isWallElement(el)));
      applied += 1;
      continue;
    }

    if (action.type === "add_decoration") {
      const preset = getDecorationPreset(action.decoration);
      const fields = decorationPresetToElementFields(preset);
      const newEl: LocalElement = {
        id: crypto.randomUUID(),
        type: "decoration",
        x: action.x,
        y: action.y,
        rotation: 0,
        ...fields,
      };
      setCurrentElements((prev) => [...prev, newEl]);
      applied += 1;
      continue;
    }

    if (action.type === "add_tables") {
      const createdElements: LocalElement[] = [];

      for (const table of action.tables) {
        const fd = new FormData();
        fd.set("roomId", roomId);
        fd.set("label", table.label);
        fd.set("capacity", String(table.capacity));

        const result = await createTable(fd);
        if (!result.success) {
          errors.push(`Failed to create ${table.label}: ${result.error}`);
          continue;
        }

        createdElements.push({
          id: crypto.randomUUID(),
          type: "table",
          tableId: result.data.id,
          x: table.x,
          y: table.y,
          width: table.width,
          height: table.height,
          rotation: 0,
          shape: table.shape,
          tableLabel: table.label,
          tableCapacity: table.capacity,
          tableIsActive: true,
        });
      }

      if (createdElements.length > 0) {
        setCurrentElements((prev) => [...prev, ...createdElements]);
        applied += 1;
      }
    }
  }

  return { applied, errors };
}

interface ToolMessagePart {
  type: string;
  state?: string;
  output?: unknown;
  toolCallId?: string;
}

export function extractCopilotActionsFromMessages(
  messages: Array<{ id: string; parts: ToolMessagePart[] }>,
  appliedToolCallIds: Set<string>,
): { actions: CopilotAction[]; toolCallIds: string[] } {
  const actions: CopilotAction[] = [];
  const toolCallIds: string[] = [];

  for (const message of messages) {
    for (const [index, part] of message.parts.entries()) {
      if (
        typeof part.type !== "string" ||
        !part.type.startsWith("tool-") ||
        part.state !== "output-available" ||
        !part.output
      ) {
        continue;
      }

      const dedupeKey = part.toolCallId ?? `${message.id}-${index}`;
      if (appliedToolCallIds.has(dedupeKey)) continue;

      const output = part.output as { actions?: CopilotAction[] };
      if (output.actions?.length) {
        actions.push(...output.actions);
        toolCallIds.push(dedupeKey);
      }
    }
  }

  return { actions, toolCallIds };
}
