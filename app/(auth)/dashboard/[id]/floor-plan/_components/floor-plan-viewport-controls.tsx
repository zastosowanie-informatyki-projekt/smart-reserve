"use client";

import { Button } from "@/components/ui/button";
import { Grid3x3, Minus, Plus, RotateCcw } from "lucide-react";

interface FloorPlanViewportControlsProps {
  zoom: number;
  showGrid: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onToggleGrid: () => void;
}

export const FloorPlanViewportControls = ({
  zoom,
  showGrid,
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleGrid,
}: FloorPlanViewportControlsProps) => {
  return (
    <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-md border bg-background/95 p-1 shadow-sm backdrop-blur">
      <Button
        type="button"
        variant={showGrid ? "default" : "outline"}
        size="icon-sm"
        onClick={onToggleGrid}
        title="Toggle grid"
        aria-label="Toggle grid"
      >
        <Grid3x3 className="h-3.5 w-3.5" />
      </Button>
      <div className="mx-0.5 h-4 w-px bg-border" />
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={onZoomOut}
        title="Zoom out"
        aria-label="Zoom out"
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <span className="min-w-10 text-center text-[10px] font-medium tabular-nums text-muted-foreground">
        {Math.round(zoom * 100)}%
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={onZoomIn}
        title="Zoom in"
        aria-label="Zoom in"
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={onResetView}
        title="Reset view"
        aria-label="Reset view"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

export const MIN_VIEW_ZOOM = 0.5;
export const MAX_VIEW_ZOOM = 3;
export const VIEW_ZOOM_STEP = 0.15;

export function clampViewZoom(value: number): number {
  return Math.min(MAX_VIEW_ZOOM, Math.max(MIN_VIEW_ZOOM, value));
}
