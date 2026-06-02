"use client";

import { useState, useCallback, useTransition, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { saveFloorPlan } from "@/server/rooms/actions/save-floor-plan";
import type { RoomWithFloorPlan } from "@/server/rooms/types";
import { FloorPlanCanvas } from "./floor-plan-canvas";
import { RoomSelector } from "./room-selector";
import { TableSheet } from "./table-sheet";
import type {
  LocalElement,
  RoomEntry,
  EditorTool,
  DecorationPreset,
  TableCapacityPreset,
  RoomShapePresetId,
} from "./types";
import { DEFAULT_TABLE_PRESET, getTablePreset } from "./table-presets";
import {
  detectDecorationPreset,
  decorationPresetToElementFields,
  getDecorationPreset,
} from "./decoration-presets";
import { buildRoomShapeElements, isWallElement } from "./room-shape-presets";
import { FloorPlanCopilotChat } from "./floor-plan-copilot-chat";
import type { FloorPlanCopilotContext } from "@/lib/floor-plan-copilot/types";

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;
const EMPTY_ELEMENTS: LocalElement[] = [];

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
      decorationPreset: detectDecorationPreset({ fill: el.fill, shape: el.shape }) ?? undefined,
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
  const [tablePreset, setTablePreset] = useState<TableCapacityPreset>(DEFAULT_TABLE_PRESET);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetElement, setSheetElement] = useState<LocalElement | null>(null);
  const [isNewElement, setIsNewElement] = useState(false);

  const currentElements = useMemo(
    () => (activeRoomId ? (roomElements.get(activeRoomId) ?? EMPTY_ELEMENTS) : EMPTY_ELEMENTS),
    [activeRoomId, roomElements],
  );

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
      setCurrentElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...updated } : el)));
      setSheetElement((prev) => (prev?.id === id ? { ...prev, ...updated } : prev));
    },
    [setCurrentElements],
  );

  const handleApplyTablePreset = useCallback(
    (elementId: string, presetCapacity: TableCapacityPreset) => {
      const preset = getTablePreset(presetCapacity);
      handleElementChange(elementId, {
        width: preset.width,
        height: preset.height,
        shape: preset.shape,
        tableCapacity: preset.capacity,
      });
    },
    [handleElementChange],
  );

  const handleDeleteElement = useCallback(
    (id: string) => {
      setCurrentElements((prev) => prev.filter((el) => el.id !== id));
      setSelectedId(null);
    },
    [setCurrentElements],
  );

  // Decorations placed via sidebar buttons — no Sheet needed
  const handleAddDecoration = useCallback(
    (presetId: DecorationPreset) => {
      const preset = getDecorationPreset(presetId);
      const fields = decorationPresetToElementFields(preset);
      const newEl: LocalElement = {
        id: crypto.randomUUID(),
        type: "decoration",
        x: Math.round(CANVAS_WIDTH / 2 / 20) * 20 - Math.round(fields.width / 2),
        y: Math.round(CANVAS_HEIGHT / 2 / 20) * 20 - Math.round(fields.height / 2),
        rotation: 0,
        ...fields,
      };
      setCurrentElements((prev) => [...prev, newEl]);
      setSelectedId(newEl.id);
    },
    [setCurrentElements],
  );

  const handleApplyDecorationPreset = useCallback(
    (elementId: string, presetId: DecorationPreset) => {
      const preset = getDecorationPreset(presetId);
      handleElementChange(elementId, {
        width: preset.width,
        height: preset.height,
        shape: preset.shape,
        fill: preset.fill,
        stroke: preset.stroke,
        decorationPreset: preset.id,
      });
    },
    [handleElementChange],
  );

  const handleWallDrawComplete = useCallback(() => {
    setActiveTool("select");
  }, []);

  const handleAddWall = useCallback(
    (el: LocalElement) => {
      setCurrentElements((prev) => [...prev, el]);
      setSelectedId(null);
    },
    [setCurrentElements],
  );

  const handleApplyRoomShape = useCallback(
    (shapeId: RoomShapePresetId) => {
      const wallElements = buildRoomShapeElements(shapeId);
      setCurrentElements((prev) => [...prev.filter((el) => !isWallElement(el)), ...wallElements]);
      setSelectedId(null);
      setActiveTool("select");
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

  const currentElementsRef = useRef(currentElements);
  useEffect(() => {
    currentElementsRef.current = currentElements;
  }, [currentElements]);

  const getCurrentElements = useCallback(() => currentElementsRef.current, []);

  const buildCopilotContext = useCallback((): FloorPlanCopilotContext | null => {
    if (!activeRoomId || !activeRoom) return null;

    return {
      activeRoomId,
      roomName: activeRoom.name,
      canvasWidth: CANVAS_WIDTH,
      canvasHeight: CANVAS_HEIGHT,
      elements: currentElements.map((el) => ({
        type: el.type,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        capacity: el.tableCapacity,
        decorationPreset: el.decorationPreset,
        shape: el.shape,
        label: el.label ?? el.tableLabel,
      })),
    };
  }, [activeRoomId, activeRoom, currentElements]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
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

      {/* Body — sidebar + canvas + copilot */}
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
            tablePreset={tablePreset}
            onTablePresetChange={setTablePreset}
            onAddDecoration={handleAddDecoration}
            onApplyRoomShape={handleApplyRoomShape}
            onFinishWallDraw={handleWallDrawComplete}
          />
        </div>

        {/* Canvas */}
        <div className="flex flex-1 flex-col overflow-hidden p-4">
          {activeRoomId ? (
            <FloorPlanCanvas
              elements={currentElements}
              selectedId={selectedId}
              activeTool={activeTool}
              tablePreset={tablePreset}
              onSelect={handleSelectElement}
              onElementChange={handleElementChange}
              onAddElement={handleAddElement}
              onAddWall={handleAddWall}
              onWallDrawComplete={handleWallDrawComplete}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              Select a room from the sidebar to start editing its floor plan.
            </div>
          )}
          {(() => {
            const selectedEl = selectedId ? currentElements.find((e) => e.id === selectedId) : null;

            if (selectedEl?.type === "decoration") {
              const presetId =
                selectedEl.decorationPreset ??
                detectDecorationPreset({ fill: selectedEl.fill, shape: selectedEl.shape });
              const preset = presetId ? getDecorationPreset(presetId) : null;
              const isWall = selectedEl.shape === "line" || preset?.id === "wall";
              const kindName = isWall ? "Wall" : (preset?.label ?? "Decoration");
              const isEditableLabel = !isWall && (preset?.editableLabel ?? Boolean(selectedEl.label));

              return (
                <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs">
                  <span className="text-muted-foreground">
                    Selected: <span className="font-medium text-foreground">{kindName}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {isWall ? "Length" : "Size"}:{" "}
                    <span className="font-medium text-foreground">
                      {isWall ? `${selectedEl.width} px` : `${selectedEl.width}×${selectedEl.height}`}
                    </span>
                  </span>
                  {preset && !isWall && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleApplyDecorationPreset(selectedEl.id, preset.id)}
                    >
                      Reset to preset ({preset.sizeHint})
                    </Button>
                  )}
                  {isWall && (
                    <span className="text-muted-foreground">Drag to move · handles to resize or rotate</span>
                  )}
                  {isEditableLabel && (
                    <>
                      <span className="text-muted-foreground">Label:</span>
                      <Input
                        className="h-6 w-40 text-xs"
                        value={selectedEl.label ?? ""}
                        onChange={(e) => handleElementChange(selectedEl.id, { label: e.target.value })}
                        placeholder={kindName.toUpperCase()}
                      />
                    </>
                  )}
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
                  ? "Click an element to select it. Drag to move, use handles to resize or rotate. Scroll to zoom, hold Space and drag to pan."
                  : activeTool === "draw-wall"
                    ? "Click to place wall corners. Esc, double-click, or Done to finish — then edit walls in Select mode."
                    : "Choose a table size, then click on the canvas to place it."}
              </p>
            );
          })()}
        </div>

        <div className="flex w-72 shrink-0 border-l max-lg:hidden">
          <FloorPlanCopilotChat
            restaurantId={restaurantId}
            activeRoomId={activeRoomId}
            buildContext={buildCopilotContext}
            setCurrentElements={setCurrentElements}
            getCurrentElements={getCurrentElements}
          />
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
          onApplyPreset={handleApplyTablePreset}
        />
      )}
    </div>
  );
};
