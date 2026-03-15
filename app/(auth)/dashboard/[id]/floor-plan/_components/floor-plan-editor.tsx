"use client";

import { useState, useCallback, useTransition } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveFloorPlan } from "@/server/rooms/actions/save-floor-plan";
import type { RoomWithFloorPlan } from "@/server/rooms/types";
import { FloorPlanCanvas } from "./floor-plan-canvas";
import { RoomSelector } from "./room-selector";
import { TableSheet } from "./table-sheet";
import type { LocalElement, RoomEntry, EditorTool, DecorationPreset } from "./types";

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;

function roomWithFloorPlanToLocalElements(room: RoomWithFloorPlan): LocalElement[] {
  if (!room.floorPlan) return [];

  return room.floorPlan.elements.map((el) => {
    if (el.type === "table") {
      return {
        id: el.id,
        type: "table" as const,
        tableId: el.tableId,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        rotation: el.rotation,
        shape: el.shape,
        tableLabel: el.table?.label,
        tableCapacity: el.table?.capacity,
        tableIsActive: el.table?.isActive,
      };
    }
    return {
      id: el.id,
      type: "decoration" as const,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      rotation: el.rotation ?? 0,
      shape: el.shape,
      fill: el.fill,
      stroke: el.stroke,
      label: el.label,
    };
  });
}

interface FloorPlanEditorProps {
  restaurantId: string;
  restaurantName: string;
  roomsWithFloorPlan: RoomWithFloorPlan[];
  rooms: RoomEntry[];
}

export const FloorPlanEditor = ({
  restaurantId,
  restaurantName,
  roomsWithFloorPlan,
  rooms: initialRooms,
}: FloorPlanEditorProps) => {
  const [rooms, setRooms] = useState<RoomEntry[]>(initialRooms);

  const [activeRoomId, setActiveRoomId] = useState<string | null>(
    initialRooms.length > 0 ? initialRooms[0].id : null,
  );

  const [roomElements, setRoomElements] = useState<Map<string, LocalElement[]>>(() => {
    const map = new Map<string, LocalElement[]>();
    for (const room of roomsWithFloorPlan) {
      map.set(room.id, roomWithFloorPlanToLocalElements(room));
    }
    return map;
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<EditorTool>("select");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetElement, setSheetElement] = useState<LocalElement | null>(null);
  const [isNewElement, setIsNewElement] = useState(false);

  const currentElements: LocalElement[] =
    activeRoomId ? (roomElements.get(activeRoomId) ?? []) : [];

  const setCurrentElements = useCallback(
    (updater: (prev: LocalElement[]) => LocalElement[]) => {
      if (!activeRoomId) return;
      setRoomElements((prev) => {
        const next = new Map(prev);
        next.set(activeRoomId, updater(next.get(activeRoomId) ?? []));
        return next;
      });
    },
    [activeRoomId],
  );

  const handleRoomChange = (roomId: string) => {
    setActiveRoomId(roomId);
    setSelectedId(null);
    setActiveTool("select");
    setSheetOpen(false);
    setSheetElement(null);
  };

  const handleToolChange = (tool: EditorTool) => {
    setActiveTool(tool);
  };

  // Canvas placed a new table element — open Sheet immediately
  const handleAddElement = useCallback(
    (el: LocalElement) => {
      setCurrentElements((prev) => [...prev, el]);
      setSelectedId(el.id);
      setSheetElement(el);
      setIsNewElement(true);
      setSheetOpen(true);
      // Switch back to select so further canvas clicks don't keep adding
      setActiveTool("select");
    },
    [setCurrentElements],
  );

  // Clicking an existing table element opens Sheet pre-filled
  const handleSelectElement = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      if (!id) return;

      const el = currentElements.find((e) => e.id === id);
      if (el?.type === "table") {
        setSheetElement(el);
        setIsNewElement(false);
        setSheetOpen(true);
      }
    },
    [currentElements],
  );

  const handleElementChange = useCallback(
    (id: string, updated: Partial<LocalElement>) => {
      setCurrentElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, ...updated } : el)),
      );
    },
    [setCurrentElements],
  );

  const handleDeleteElement = useCallback(
    (id: string) => {
      setCurrentElements((prev) => prev.filter((el) => el.id !== id));
      setSelectedId(null);
    },
    [setCurrentElements],
  );

  // Door / window placed via sidebar buttons — no Sheet needed
  const handleAddDecoration = useCallback(
    (preset: DecorationPreset) => {
      const isDoor = preset === "door";
      const newEl: LocalElement = {
        id: crypto.randomUUID(),
        type: "decoration",
        x: Math.round(CANVAS_WIDTH / 2 / 20) * 20 - 40,
        y: Math.round(CANVAS_HEIGHT / 2 / 20) * 20 - 20,
        width: isDoor ? 60 : 120,
        height: isDoor ? 60 : 20,
        rotation: 0,
        shape: "rect",
        fill: isDoor ? "#92400e" : "#bae6fd",
        stroke: isDoor ? "#78350f" : "#0284c7",
        label: isDoor ? "DOOR" : "WINDOW",
      };
      setCurrentElements((prev) => [...prev, newEl]);
    },
    [setCurrentElements],
  );

  // Sheet callbacks ─────────────────────────────────────────────────────────

  const handleSheetCreated = useCallback(
    (
      elementId: string,
      tableId: string,
      label: string,
      capacity: number,
      description: string | undefined,
      shape: "rect" | "circle",
    ) => {
      setCurrentElements((prev) =>
        prev.map((el) =>
          el.id === elementId
            ? {
                ...el,
                tableId,
                shape,
                tableLabel: label,
                tableCapacity: capacity,
                tableDescription: description,
                tableIsActive: true,
              }
            : el,
        ),
      );
    },
    [setCurrentElements],
  );

  const handleSheetUpdated = useCallback(
    (
      elementId: string,
      label: string,
      capacity: number,
      description: string | undefined,
      shape: "rect" | "circle",
    ) => {
      setCurrentElements((prev) =>
        prev.map((el) =>
          el.id === elementId
            ? { ...el, shape, tableLabel: label, tableCapacity: capacity, tableDescription: description }
            : el,
        ),
      );
    },
    [setCurrentElements],
  );

  const handleSheetCancelNew = useCallback(
    (elementId: string) => {
      handleDeleteElement(elementId);
    },
    [handleDeleteElement],
  );

  const handleSheetDeleted = useCallback(
    (elementId: string) => {
      handleDeleteElement(elementId);
    },
    [handleDeleteElement],
  );

  const handleSave = () => {
    if (!activeRoomId) return;
    setSaveError(null);
    setSaveSuccess(false);

    const elements = roomElements.get(activeRoomId) ?? [];

    // Only save elements that are fully linked (tables must have tableId)
    const floorPlanElements = elements
      .filter((el) => el.type !== "table" || el.tableId)
      .map((el) => {
        if (el.type === "table") {
          return {
            id: el.id,
            type: "table" as const,
            tableId: el.tableId!,
            x: el.x,
            y: el.y,
            width: el.width,
            height: el.height,
            rotation: el.rotation,
            shape: el.shape as "rect" | "circle",
          };
        }
        return {
          id: el.id,
          type: "decoration" as const,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          rotation: el.rotation,
          shape: el.shape,
          fill: el.fill,
          stroke: el.stroke,
          label: el.label,
        };
      });

    startSaveTransition(async () => {
      const result = await saveFloorPlan({
        roomId: activeRoomId,
        floorPlan: {
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          elements: floorPlanElements,
        },
      });

      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(result.error);
      }
    });
  };

  const activeRoom = rooms.find((r) => r.id === activeRoomId);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 border-b px-4 py-3">
        <Link
          href={`/dashboard/${restaurantId}`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back
        </Link>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{restaurantName}</span>
          <span className="text-xs text-muted-foreground">
            {activeRoom ? `Editing: ${activeRoom.name}` : "Select a room to start"}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {saveSuccess && <span className="text-sm text-green-600">Saved!</span>}
          {saveError && <span className="text-sm text-destructive">{saveError}</span>}
          <Button size="sm" onClick={handleSave} disabled={isSaving || !activeRoomId}>
            {isSaving ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save Floor Plan"}
          </Button>
        </div>
      </div>

      {/* Body — 2-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-56 shrink-0 overflow-y-auto border-r p-3">
          <RoomSelector
            restaurantId={restaurantId}
            rooms={rooms}
            activeRoomId={activeRoomId}
            onRoomChange={handleRoomChange}
            onRoomsChanged={setRooms}
            onActiveRoomDeleted={() => {
              setActiveRoomId(null);
              setSelectedId(null);
              setActiveTool("select");
              setSheetOpen(false);
              setSheetElement(null);
            }}
            elements={currentElements}
            activeTool={activeTool}
            onToolChange={handleToolChange}
            onAddDecoration={handleAddDecoration}
          />
        </div>

        {/* Canvas */}
        <div className="flex flex-1 flex-col overflow-hidden p-4">
          {activeRoomId ? (
            <FloorPlanCanvas
              elements={currentElements}
              selectedId={selectedId}
              activeTool={activeTool}
              onSelect={handleSelectElement}
              onElementChange={handleElementChange}
              onAddElement={handleAddElement}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              Select a room from the sidebar to start editing its floor plan.
            </div>
          )}
          {(() => {
            const selectedEl = selectedId
              ? currentElements.find((e) => e.id === selectedId)
              : null;

            if (selectedEl?.type === "decoration") {
              const label =
                selectedEl.label === "DOOR"
                  ? "Door"
                  : selectedEl.label === "WINDOW"
                    ? "Window"
                    : "Decoration";
              return (
                <div className="mt-2 flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-1.5 text-xs">
                  <span className="text-muted-foreground">
                    Selected: <span className="font-medium text-foreground">{label}</span>
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="ml-auto h-6 px-2 text-xs"
                    onClick={() => handleDeleteElement(selectedEl.id)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              );
            }

            return (
              <p className="mt-2 text-xs text-muted-foreground">
                {activeTool === "select"
                  ? "Click a table to edit it. Drag to move. Use handles to resize or rotate."
                  : "Click on the canvas to place a new table."}
              </p>
            );
          })()}
        </div>
      </div>

      {/* Table Sheet — key ensures form state resets when switching between elements */}
      {activeRoomId && (
        <TableSheet
          key={sheetElement?.id ?? "new"}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          element={sheetElement}
          isNew={isNewElement}
          roomId={activeRoomId}
          onCreated={handleSheetCreated}
          onUpdated={handleSheetUpdated}
          onCancelNew={handleSheetCancelNew}
          onDeleted={handleSheetDeleted}
        />
      )}
    </div>
  );
};
