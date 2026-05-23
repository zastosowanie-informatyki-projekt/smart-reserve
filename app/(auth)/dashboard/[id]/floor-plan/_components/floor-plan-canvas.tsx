"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Konva from "konva";
import { Stage, Layer, Rect, Circle, Line, Group, Text, Transformer } from "react-konva";
import type { LocalElement, EditorTool, TableCapacityPreset } from "./types";
import { getTablePreset } from "./table-presets";
import { detectDecorationPreset, getDecorationPreset } from "./decoration-presets";
import {
  GRID_SIZE,
  snapToGrid,
  snapCanvasPoint,
  snapWallEndpoint,
  createWallElementFromPoints,
  getCanvasPointFromStage,
  wallElementEndPoint,
  type CanvasPoint,
} from "./wall-draw-utils";
import {
  FloorPlanViewportControls,
  clampViewZoom,
  VIEW_ZOOM_STEP,
} from "./floor-plan-viewport-controls";

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;
const GRID_MAJOR_EVERY = 5;
const ROTATION_SNAP_STEP = 45;
const ROTATION_SNAPS = [0, 45, 90, 135, 180, 225, 270, 315];

function snapRotation(value: number): number {
  const snapped = Math.round(value / ROTATION_SNAP_STEP) * ROTATION_SNAP_STEP;
  const normalized = ((snapped % 360) + 360) % 360;
  return normalized;
}

// ─── Table shape ──────────────────────────────────────────────────────────────
const TableElement = ({
  el,
  isSelected,
  interactive,
  onSelect,
  onChange,
}: {
  el: LocalElement;
  isSelected: boolean;
  interactive: boolean;
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
        draggable={interactive}
        listening={interactive}
        onClick={interactive ? onSelect : undefined}
        onTap={interactive ? onSelect : undefined}
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
  interactive,
  onSelect,
  onChange,
}: {
  el: LocalElement;
  isSelected: boolean;
  interactive: boolean;
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
  const presetId = el.decorationPreset ?? detectDecorationPreset({ fill, shape: el.shape });
  const preset = presetId ? getDecorationPreset(presetId) : null;
  const isDoor = preset?.id === "door";
  const isWindow = preset?.id === "window";

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({ x: snapToGrid(e.target.x()), y: snapToGrid(e.target.y()) });
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    if (el.shape === "line") {
      onChange({
        x: snapToGrid(node.x()),
        y: snapToGrid(node.y()),
        width: snapToGrid(Math.max(GRID_SIZE, el.width * scaleX)),
        rotation: snapRotation(node.rotation()),
      });
      return;
    }

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
          hitStrokeWidth={24}
          lineCap="square"
          draggable={interactive}
          listening={interactive}
          onClick={(e) => {
            if (!interactive) return;
            e.cancelBubble = true;
            onSelect();
          }}
          onTap={(e) => {
            if (!interactive) return;
            e.cancelBubble = true;
            onSelect();
          }}
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
        draggable={interactive}
        listening={interactive}
        onClick={interactive ? onSelect : undefined}
        onTap={interactive ? onSelect : undefined}
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
const GridLines = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;

  const lines = [];
  for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
    const isMajor = x % (GRID_SIZE * GRID_MAJOR_EVERY) === 0;
    lines.push(
      <Line
        key={`v${x}`}
        points={[x, 0, x, CANVAS_HEIGHT]}
        stroke={isMajor ? "#cbd5e1" : "#e2e8f0"}
        strokeWidth={isMajor ? 1 : 0.5}
        listening={false}
      />,
    );
  }
  for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
    const isMajor = y % (GRID_SIZE * GRID_MAJOR_EVERY) === 0;
    lines.push(
      <Line
        key={`h${y}`}
        points={[0, y, CANVAS_WIDTH, y]}
        stroke={isMajor ? "#cbd5e1" : "#e2e8f0"}
        strokeWidth={isMajor ? 1 : 0.5}
        listening={false}
      />,
    );
  }
  return <>{lines}</>;
};

const WallDrawPreview = ({
  start,
  end,
}: {
  start: CanvasPoint;
  end: CanvasPoint;
}) => {
  const snappedEnd = snapWallEndpoint(start, end);
  return (
    <>
      <Circle x={start.x} y={start.y} radius={5} fill="#2563eb" listening={false} />
      <Line
        points={[start.x, start.y, snappedEnd.x, snappedEnd.y]}
        stroke="#2563eb"
        strokeWidth={2}
        dash={[8, 6]}
        listening={false}
      />
    </>
  );
};

// ─── Main canvas ──────────────────────────────────────────────────────────────
interface FloorPlanCanvasProps {
  elements: LocalElement[];
  selectedId: string | null;
  activeTool: EditorTool;
  tablePreset: TableCapacityPreset;
  onSelect: (id: string | null) => void;
  onElementChange: (id: string, updated: Partial<LocalElement>) => void;
  onAddElement: (el: LocalElement) => void;
  onAddWall: (el: LocalElement) => void;
  onWallDrawComplete: () => void;
}

export const FloorPlanCanvas = ({
  elements,
  selectedId,
  activeTool,
  tablePreset,
  onSelect,
  onElementChange,
  onAddElement,
  onAddWall,
  onWallDrawComplete,
}: FloorPlanCanvasProps) => {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
  const [wallDrawStart, setWallDrawStart] = useState<CanvasPoint | null>(null);
  const [wallDrawPreviewEnd, setWallDrawPreviewEnd] = useState<CanvasPoint | null>(null);
  const [viewZoom, setViewZoom] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [spacePressed, setSpacePressed] = useState(false);

  const interactive = activeTool === "select" && !spacePressed;
  const fitScale = stageSize.width / CANVAS_WIDTH;
  const stageScale = fitScale * viewZoom;
  const isPanMode = spacePressed && activeTool === "select";

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

  const finishWallDrawing = useCallback(() => {
    setWallDrawStart(null);
    setWallDrawPreviewEnd(null);
    onWallDrawComplete();
  }, [onWallDrawComplete]);

  useEffect(() => {
    if (activeTool !== "draw-wall") {
      setWallDrawStart(null);
      setWallDrawPreviewEnd(null);
    }
  }, [activeTool]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && activeTool === "select") {
        event.preventDefault();
        setSpacePressed(true);
      }
      if (event.key === "Escape" && activeTool === "draw-wall") {
        finishWallDrawing();
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        setSpacePressed(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activeTool, finishWallDrawing]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const direction = event.deltaY > 0 ? -1 : 1;
      const nextZoom = clampViewZoom(viewZoom + direction * VIEW_ZOOM_STEP);
      if (nextZoom === viewZoom) return;

      const mousePointTo = {
        x: (pointer.x - stagePos.x) / stageScale,
        y: (pointer.y - stagePos.y) / stageScale,
      };

      setViewZoom(nextZoom);
      setStagePos({
        x: pointer.x - mousePointTo.x * fitScale * nextZoom,
        y: pointer.y - mousePointTo.y * fitScale * nextZoom,
      });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [viewZoom, stageScale, stagePos.x, stagePos.y, fitScale]);

  const resetView = useCallback(() => {
    setViewZoom(1);
    setStagePos({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(() => {
    setViewZoom((prev) => clampViewZoom(prev + VIEW_ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setViewZoom((prev) => clampViewZoom(prev - VIEW_ZOOM_STEP));
  }, []);

  const getCanvasPointer = useCallback((): CanvasPoint | null => {
    const stage = stageRef.current;
    if (!stage) return null;
    return getCanvasPointFromStage(stage);
  }, []);

  const handleStageMouseMove = useCallback(() => {
    if (activeTool !== "draw-wall" || !wallDrawStart) return;
    const pointer = getCanvasPointer();
    if (!pointer) return;
    setWallDrawPreviewEnd(pointer);
  }, [activeTool, wallDrawStart, getCanvasPointer]);

  const handleStageDoubleClick = useCallback(() => {
    if (activeTool === "draw-wall") {
      finishWallDrawing();
    }
  }, [activeTool, finishWallDrawing]);

  const handleStageDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    if (!isPanMode) return;
    setStagePos({ x: e.target.x(), y: e.target.y() });
  }, [isPanMode]);

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (isPanMode) return;

      const isBackground =
        e.target === e.target.getStage() || e.target.name() === "bg";

      if (activeTool === "select") {
        if (isBackground) onSelect(null);
        return;
      }

      if (activeTool === "draw-wall") {
        if (!isBackground) return;
        const pointer = getCanvasPointer();
        if (!pointer) return;
        const point = { x: snapToGrid(pointer.x), y: snapToGrid(pointer.y) };

        if (!wallDrawStart) {
          setWallDrawStart(point);
          setWallDrawPreviewEnd(point);
          return;
        }

        const wall = createWallElementFromPoints(wallDrawStart, point);
        if (wall) {
          onAddWall(wall);
          const nextStart = snapCanvasPoint(wallElementEndPoint(wall));
          setWallDrawStart(nextStart);
          setWallDrawPreviewEnd(nextStart);
        }
        return;
      }

      if (activeTool === "add-table") {
        if (!isBackground) return;
        const pointer = getCanvasPointer();
        if (!pointer) return;
        const x = snapToGrid(pointer.x);
        const y = snapToGrid(pointer.y);

        const preset = getTablePreset(tablePreset);
        const newEl: LocalElement = {
          id: crypto.randomUUID(),
          type: "table",
          // tableId intentionally absent — Sheet will assign after createTable
          x: x - Math.round(preset.width / 2),
          y: y - Math.round(preset.height / 2),
          width: preset.width,
          height: preset.height,
          rotation: 0,
          shape: preset.shape,
          tableCapacity: preset.capacity,
          tableIsActive: true,
        };
        onAddElement(newEl);
      }
    },
    [activeTool, isPanMode, onSelect, onAddElement, onAddWall, getCanvasPointer, tablePreset, wallDrawStart],
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-lg border bg-white"
      style={{
        cursor: isPanMode ? "grab" : activeTool !== "select" ? "crosshair" : "default",
      }}
    >
      <FloorPlanViewportControls
        zoom={viewZoom}
        showGrid={showGrid}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetView={resetView}
        onToggleGrid={() => setShowGrid((prev) => !prev)}
      />
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        draggable={isPanMode}
        onDragEnd={handleStageDragEnd}
        onClick={handleStageClick}
        onMouseMove={handleStageMouseMove}
        onDblClick={handleStageDoubleClick}
      >
        <Layer>
          <Rect name="bg" x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#f8fafc" />
          <GridLines visible={showGrid} />
          {elements.map((el) =>
            el.type === "table" ? (
              <TableElement
                key={el.id}
                el={el}
                isSelected={selectedId === el.id}
                interactive={interactive}
                onSelect={() => onSelect(el.id)}
                onChange={(updated) => onElementChange(el.id, updated)}
              />
            ) : (
              <DecorationElement
                key={el.id}
                el={el}
                isSelected={selectedId === el.id}
                interactive={interactive}
                onSelect={() => onSelect(el.id)}
                onChange={(updated) => onElementChange(el.id, updated)}
              />
            ),
          )}
          {activeTool === "draw-wall" && wallDrawStart && wallDrawPreviewEnd && (
            <WallDrawPreview start={wallDrawStart} end={wallDrawPreviewEnd} />
          )}
        </Layer>
      </Stage>
    </div>
  );
};
