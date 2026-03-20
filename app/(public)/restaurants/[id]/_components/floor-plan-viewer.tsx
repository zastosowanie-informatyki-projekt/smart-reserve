"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Konva from "konva";
import { Stage, Layer, Rect, Circle, Line, Group, Text } from "react-konva";
import type { RoomWithFloorPlan } from "@/server/rooms/types";

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;
const GRID_SIZE = 20;

// ─── Read-only table element ──────────────────────────────────────────────────
const TableNode = ({
  el,
  isAvailable,
  isSelected,
  onSelect,
  onDeselect,
}: {
  el: {
    id: string;
    tableId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    shape: "rect" | "circle";
    label: string;
    capacity: number;
  };
  isAvailable: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
}) => {
  const fill = isSelected
    ? "#4ade80"
    : isAvailable
      ? "#86efac"
      : "#d1d5db";
  const stroke = isSelected
    ? "#16a34a"
    : isAvailable
      ? "#22c55e"
      : "#9ca3af";
  const textFill = isAvailable ? "#166534" : "#6b7280";
  const cursor = isAvailable ? "pointer" : "not-allowed";

  return (
    <Group
      x={el.x}
      y={el.y}
      rotation={el.rotation}
      onClick={isAvailable ? (isSelected ? onDeselect : onSelect) : undefined}
      onTap={isAvailable ? (isSelected ? onDeselect : onSelect) : undefined}
      style={{ cursor }}
      opacity={isAvailable ? 1 : 0.5}
    >
      {el.shape === "circle" ? (
        <Circle
          x={el.width / 2}
          y={el.height / 2}
          radius={Math.min(el.width, el.height) / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={isSelected ? 2.5 : 1.5}
        />
      ) : (
        <Rect
          width={el.width}
          height={el.height}
          fill={fill}
          stroke={stroke}
          strokeWidth={isSelected ? 2.5 : 1.5}
          cornerRadius={4}
        />
      )}
      <Text
        text={el.label}
        fontSize={12}
        fontStyle="bold"
        fill={textFill}
        width={el.width}
        height={el.height}
        align="center"
        verticalAlign="middle"
        listening={false}
      />
      <Text
        text={String(el.capacity)}
        fontSize={10}
        fill={textFill}
        x={el.width - 18}
        y={4}
        listening={false}
      />
    </Group>
  );
};

// ─── Read-only decoration element ─────────────────────────────────────────────
const DecorationNode = ({
  el,
}: {
  el: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    shape: "rect" | "circle" | "line";
    fill?: string | null;
    stroke?: string | null;
    label?: string | null;
  };
}) => {
  const isDoor = el.label === "DOOR";
  const isWindow = el.label === "WINDOW";
  const isWall = el.label === "WALL";
  const fill = isDoor ? "#92400e" : isWindow ? "#bae6fd" : (el.fill ?? "#e2e8f0");
  const stroke = isDoor ? "#78350f" : isWindow ? "#0284c7" : (el.stroke ?? "#94a3b8");
  const textFill = isDoor ? "#fff7ed" : isWindow ? "#0c4a6e" : "#475569";

  if (el.shape === "line") {
    return (
      <Line
        x={el.x}
        y={el.y}
        rotation={el.rotation}
        points={[0, 0, el.width, 0]}
        stroke={stroke}
        strokeWidth={isWall ? 8 : 2}
        lineCap={isWall ? "square" : "butt"}
        listening={false}
      />
    );
  }

  return (
    <Group x={el.x} y={el.y} rotation={el.rotation} listening={false}>
      <Rect
        width={el.width}
        height={el.height}
        fill={fill}
        stroke={stroke}
        strokeWidth={1}
        cornerRadius={isDoor ? 2 : 0}
      />
      {el.label && (
        <Text
          y={el.height / 2 - 6}
          width={el.width}
          text={el.label}
          fontSize={11}
          fontStyle="bold"
          fill={textFill}
          align="center"
          listening={false}
        />
      )}
    </Group>
  );
};

// ─── Grid lines ───────────────────────────────────────────────────────────────
const GridLines = () => {
  const lines = [];
  for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
    lines.push(
      <Line
        key={`v${x}`}
        points={[x, 0, x, CANVAS_HEIGHT]}
        stroke="#e2e8f0"
        strokeWidth={0.5}
        listening={false}
      />,
    );
  }
  for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
    lines.push(
      <Line
        key={`h${y}`}
        points={[0, y, CANVAS_WIDTH, y]}
        stroke="#e2e8f0"
        strokeWidth={0.5}
        listening={false}
      />,
    );
  }
  return <>{lines}</>;
};

// ─── Main viewer ──────────────────────────────────────────────────────────────
interface FloorPlanViewerProps {
  rooms: RoomWithFloorPlan[];
  availableTableIds: Set<string>;
  selectedTableId: string | null;
  onSelect: (tableId: string | null) => void;
}

export const FloorPlanViewer = ({
  rooms,
  availableTableIds,
  selectedTableId,
  onSelect,
}: FloorPlanViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = entry.contentRect.width;
      setStageSize({
        width: w,
        height: Math.round(w * (CANVAS_HEIGHT / CANVAS_WIDTH)),
      });
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const scale = stageSize.width / CANVAS_WIDTH;
  const activeRoom = rooms[activeRoomIndex];

  if (!activeRoom) {
    return (
      <p className="text-sm text-muted-foreground">
        No floor plan available for this restaurant.
      </p>
    );
  }

  const elements = activeRoom.floorPlan?.elements ?? [];

  return (
    <div className="flex flex-col gap-2">
      {/* Room tabs */}
      {rooms.length > 1 && (
        <div className="flex gap-1">
          {rooms.map((room, i) => (
            <button
              key={room.id}
              onClick={() => setActiveRoomIndex(i)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                i === activeRoomIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {room.name}
            </button>
          ))}
        </div>
      )}

      {/* Canvas */}
      <div ref={containerRef} className="w-full overflow-hidden rounded-lg border bg-white">
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          scaleX={scale}
          scaleY={scale}
        >
          <Layer>
            <Rect
              name="bg"
              x={0}
              y={0}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              fill="#f8fafc"
              listening={false}
            />
            <GridLines />
            {elements.map((el) => {
              if (el.type === "decoration") {
                return <DecorationNode key={el.id} el={{ ...el, rotation: el.rotation ?? 0 }} />;
              }
              // table element
              const tableId = el.tableId;
              const meta = el.table;
              return (
                <TableNode
                  key={el.id}
                  el={{
                    id: el.id,
                    tableId,
                    x: el.x,
                    y: el.y,
                    width: el.width,
                    height: el.height,
                    rotation: el.rotation,
                    shape: el.shape,
                    label: meta?.label ?? "?",
                    capacity: meta?.capacity ?? 0,
                  }}
                  isAvailable={availableTableIds.has(tableId)}
                  isSelected={selectedTableId === tableId}
                  onSelect={() => onSelect(tableId)}
                  onDeselect={() => onSelect(null)}
                />
              );
            })}
          </Layer>
        </Stage>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-green-300" />
          Available — click to select
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-gray-300 opacity-50" />
          Unavailable
        </span>
      </div>
    </div>
  );
};
