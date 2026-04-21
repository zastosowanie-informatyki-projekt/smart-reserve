"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Konva from "konva";
import { Stage, Layer, Rect, Circle, Line, Group, Text, Transformer } from "react-konva";
import type { LocalElement, EditorTool } from "./types";

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;
const GRID_SIZE = 20;
const ROTATION_SNAP_STEP = 45;
const ROTATION_SNAPS = [0, 45, 90, 135, 180, 225, 270, 315];

function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

function snapRotation(value: number): number {
  const snapped = Math.round(value / ROTATION_SNAP_STEP) * ROTATION_SNAP_STEP;
  const normalized = ((snapped % 360) + 360) % 360;
  return normalized;
}

// ─── Table shape ──────────────────────────────────────────────────────────────
const TableElement = ({
  el,
  isSelected,
  onSelect,
  onChange,
}: {
  el: LocalElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updated: Partial<LocalElement>) => void;
}) => {
  const groupRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
    if (!isSelected && trRef.current) {
      trRef.current.nodes([]);
    }
  }, [isSelected]);

  const fill = el.tableIsActive === false ? "#fca5a5" : "#86efac";
  const stroke = isSelected ? "#2563eb" : "#16a34a";

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({ x: snapToGrid(e.target.x()), y: snapToGrid(e.target.y()) });
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    onChange({
      x: snapToGrid(node.x()),
      y: snapToGrid(node.y()),
      width: snapToGrid(Math.max(GRID_SIZE, el.width * scaleX)),
      height: snapToGrid(Math.max(GRID_SIZE, el.height * scaleY)),
      rotation: snapRotation(node.rotation()),
    });
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={el.x}
        y={el.y}
        rotation={el.rotation}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {el.shape === "circle" ? (
          <Circle
            x={el.width / 2}
            y={el.height / 2}
            radius={Math.min(el.width, el.height) / 2}
            fill={fill}
            stroke={stroke}
            strokeWidth={isSelected ? 2 : 1.5}
          />
        ) : (
          <Rect
            width={el.width}
            height={el.height}
            fill={fill}
            stroke={stroke}
            strokeWidth={isSelected ? 2 : 1.5}
            cornerRadius={4}
          />
        )}
        <Text
          text={el.tableLabel ?? "New"}
          fontSize={12}
          fontStyle="bold"
          fill="#166534"
          width={el.width}
          height={el.height}
          align="center"
          verticalAlign="middle"
          listening={false}
        />
        {el.tableCapacity !== undefined && (
          <Text
            text={String(el.tableCapacity)}
            fontSize={10}
            fill="#166534"
            x={el.width - 18}
            y={4}
            listening={false}
          />
        )}
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          rotationSnaps={ROTATION_SNAPS}
          rotationSnapTolerance={8}
          keepRatio={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < GRID_SIZE || newBox.height < GRID_SIZE) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
};

// ─── Decoration shape ─────────────────────────────────────────────────────────
const DecorationElement = ({
  el,
  isSelected,
  onSelect,
  onChange,
}: {
  el: LocalElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updated: Partial<LocalElement>) => void;
}) => {
  const groupRef = useRef<Konva.Group>(null);
  const lineRef = useRef<Konva.Line>(null);
  const trRef = useRef<Konva.Transformer>(null);

  const activeRef = el.shape === "line" ? lineRef : groupRef;

  useEffect(() => {
    const node = activeRef.current;
    if (isSelected && trRef.current && node) {
      trRef.current.nodes([node]);
      trRef.current.getLayer()?.batchDraw();
    }
    if (!isSelected && trRef.current) {
      trRef.current.nodes([]);
    }
  }, [isSelected, activeRef]);

  // Trust the per-element fill/stroke (stored in the floor-plan JSON) so that
  // renaming a door/window/toilet does not change its color.
  const fill = el.fill ?? "#e2e8f0";
  const stroke = el.stroke ?? "#94a3b8";
  const strokeWidth = isSelected ? 2 : 1;
  // Door fill is dark brown — show the door with rounded corners and light text.
  const isDoor = fill === "#92400e";
  // Window fill is light sky-blue — show dark text for contrast.
  const isWindow = fill === "#bae6fd";

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({ x: snapToGrid(e.target.x()), y: snapToGrid(e.target.y()) });
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    onChange({
      x: snapToGrid(node.x()),
      y: snapToGrid(node.y()),
      width: snapToGrid(Math.max(GRID_SIZE, el.width * scaleX)),
      height: snapToGrid(Math.max(GRID_SIZE, el.height * scaleY)),
      rotation: snapRotation(node.rotation()),
    });
  };

  if (el.shape === "line") {
    return (
      <>
        <Line
          ref={lineRef}
          x={el.x}
          y={el.y}
          rotation={el.rotation}
          points={[0, 0, el.width, 0]}
          stroke={stroke}
          strokeWidth={isSelected ? 10 : 8}
          lineCap="square"
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        />
        {isSelected && (
          <Transformer
            ref={trRef}
            rotateEnabled
            rotationSnaps={ROTATION_SNAPS}
            rotationSnapTolerance={8}
            enabledAnchors={["middle-left", "middle-right"]}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Group
        ref={groupRef}
        x={el.x}
        y={el.y}
        rotation={el.rotation}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        <Rect
          width={el.width}
          height={el.height}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          cornerRadius={isDoor ? 2 : 0}
        />
        {el.label && (
          <Text
            y={el.height / 2 - 6}
            width={el.width}
            text={el.label}
            fontSize={11}
            fontStyle="bold"
            fill={isDoor ? "#fff7ed" : isWindow ? "#0c4a6e" : "#475569"}
            align="center"
            listening={false}
          />
        )}
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          rotationSnaps={ROTATION_SNAPS}
          rotationSnapTolerance={8}
          keepRatio={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < GRID_SIZE || newBox.height < GRID_SIZE) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
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

// ─── Main canvas ──────────────────────────────────────────────────────────────
interface FloorPlanCanvasProps {
  elements: LocalElement[];
  selectedId: string | null;
  activeTool: EditorTool;
  onSelect: (id: string | null) => void;
  onElementChange: (id: string, updated: Partial<LocalElement>) => void;
  onAddElement: (el: LocalElement) => void;
}

export const FloorPlanCanvas = ({
  elements,
  selectedId,
  activeTool,
  onSelect,
  onElementChange,
  onAddElement,
}: FloorPlanCanvasProps) => {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

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

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const isBackground =
        e.target === e.target.getStage() || e.target.name() === "bg";

      if (activeTool === "select") {
        if (isBackground) onSelect(null);
        return;
      }

      if (activeTool === "add-table") {
        const stage = stageRef.current;
        if (!stage) return;
        const pos = stage.getPointerPosition();
        if (!pos) return;
        const x = snapToGrid(pos.x / scale);
        const y = snapToGrid(pos.y / scale);

        const newEl: LocalElement = {
          id: crypto.randomUUID(),
          type: "table",
          // tableId intentionally absent — Sheet will assign after createTable
          x,
          y,
          width: 80,
          height: 80,
          rotation: 0,
          shape: "rect",
          tableIsActive: true,
        };
        onAddElement(newEl);
      }
    },
    [activeTool, onSelect, onAddElement, scale],
  );

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-lg border bg-white"
      style={{ cursor: activeTool !== "select" ? "crosshair" : "default" }}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        onClick={handleStageClick}
      >
        <Layer>
          <Rect name="bg" x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#f8fafc" />
          <GridLines />
          {elements.map((el) =>
            el.type === "table" ? (
              <TableElement
                key={el.id}
                el={el}
                isSelected={selectedId === el.id}
                onSelect={() => onSelect(el.id)}
                onChange={(updated) => onElementChange(el.id, updated)}
              />
            ) : (
              <DecorationElement
                key={el.id}
                el={el}
                isSelected={selectedId === el.id}
                onSelect={() => onSelect(el.id)}
                onChange={(updated) => onElementChange(el.id, updated)}
              />
            ),
          )}
        </Layer>
      </Stage>
    </div>
  );
};
