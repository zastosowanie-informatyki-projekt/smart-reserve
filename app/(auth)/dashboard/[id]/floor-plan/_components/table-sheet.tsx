"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { createTable } from "@/server/tables/actions/create-table";
import { updateTable } from "@/server/tables/actions/update-table";
import { deleteTable } from "@/server/tables/actions/delete-table";
import type { LocalElement, TableCapacityPreset } from "./types";
import {
  TABLE_PRESETS,
  findClosestTablePreset,
  getTablePreset,
} from "./table-presets";

interface TableSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The element being created or edited (null when closed) */
  element: LocalElement | null;
  /** True if this is a brand-new element that hasn't been saved to DB yet */
  isNew: boolean;
  /** The room this table belongs to */
  roomId: string;
  /** Called after a successful createTable — provides the new tableId + metadata */
  onCreated: (
    elementId: string,
    tableId: string,
    label: string,
    capacity: number,
    description: string | undefined,
    shape: "rect" | "circle",
  ) => void;
  /** Called after a successful updateTable */
  onUpdated: (
    elementId: string,
    label: string,
    capacity: number,
    description: string | undefined,
    shape: "rect" | "circle",
  ) => void;
  /** Called when the user cancels a new-element creation */
  onCancelNew: (elementId: string) => void;
  /** Called after a successful deleteTable */
  onDeleted: (elementId: string) => void;
  /** Applies preset dimensions on the canvas element (user can still resize manually) */
  onApplyPreset: (elementId: string, preset: TableCapacityPreset) => void;
}

export const TableSheet = ({
  open,
  onOpenChange,
  element,
  isNew,
  roomId,
  onCreated,
  onUpdated,
  onCancelNew,
  onDeleted,
  onApplyPreset,
}: TableSheetProps) => {
  const [label, setLabel] = useState(element?.tableLabel ?? "");
  const [capacity, setCapacity] = useState(
    element?.tableCapacity ? String(element.tableCapacity) : "",
  );
  const [description, setDescription] = useState(element?.tableDescription ?? "");
  const [shape, setShape] = useState<"rect" | "circle">(
    (element?.shape as "rect" | "circle") ?? "rect",
  );
  const [activePreset, setActivePreset] = useState<TableCapacityPreset>(() =>
    findClosestTablePreset(element?.tableCapacity ?? 4),
  );
  const [error, setError] = useState<string | null>(null);

  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  // Reset form when the element changes (sheet opens for a new element)
  const resetForm = (el: LocalElement | null) => {
    setLabel(el?.tableLabel ?? "");
    setCapacity(el?.tableCapacity ? String(el.tableCapacity) : "");
    setDescription(el?.tableDescription ?? "");
    setShape((el?.shape as "rect" | "circle") ?? "rect");
    setActivePreset(findClosestTablePreset(el?.tableCapacity ?? 4));
    setError(null);
  };

  // Sync form when element prop changes (sheet opening)
  const prevElementId = element?.id;
  // Use a key-based approach via the open prop changing — reset on open
  const handleOpenChange = (next: boolean) => {
    if (next && element) resetForm(element);
    if (!next && isNew && element) {
      onCancelNew(element.id);
    }
    onOpenChange(next);
  };

  const handleSave = () => {
    setError(null);
    if (!label.trim()) {
      setError("Label is required.");
      return;
    }
    const capacityNum = Number(capacity);
    if (!capacity || isNaN(capacityNum) || capacityNum < 1) {
      setError("Capacity must be a positive number.");
      return;
    }

    if (isNew) {
      const fd = new FormData();
      fd.set("roomId", roomId);
      fd.set("label", label.trim());
      fd.set("capacity", String(capacityNum));
      if (description.trim()) fd.set("description", description.trim());

      startSaveTransition(async () => {
        const result = await createTable(fd);
        if (!result.success) {
          setError(result.error);
          return;
        }
        onCreated(
          element!.id,
          result.data.id,
          label.trim(),
          capacityNum,
          description.trim() || undefined,
          shape,
        );
        onOpenChange(false);
      });
    } else {
      if (!element?.tableId) return;
      const fd = new FormData();
      fd.set("id", element.tableId);
      fd.set("label", label.trim());
      fd.set("capacity", String(capacityNum));
      if (description.trim()) fd.set("description", description.trim());

      startSaveTransition(async () => {
        const result = await updateTable(fd);
        if (!result.success) {
          setError(result.error);
          return;
        }
        onUpdated(
          element.id,
          label.trim(),
          capacityNum,
          description.trim() || undefined,
          shape,
        );
        onOpenChange(false);
      });
    }
  };

  const handlePresetSelect = (presetCapacity: TableCapacityPreset) => {
    if (!element) return;
    const preset = getTablePreset(presetCapacity);
    setActivePreset(presetCapacity);
    setCapacity(String(preset.capacity));
    setShape(preset.shape);
    onApplyPreset(element.id, presetCapacity);
  };

  const handleCapacityChange = (value: string) => {
    setCapacity(value);
    const capacityNum = Number(value);
    if (!value || isNaN(capacityNum)) return;
    setActivePreset(findClosestTablePreset(capacityNum));
  };

  const handleDelete = () => {
    if (!element?.tableId) return;
    startDeleteTransition(async () => {
      const result = await deleteTable(element.tableId!);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onDeleted(element.id);
      onOpenChange(false);
    });
  };

  // Keep form in sync when element changes while sheet is open
  const currentId = element?.id;
  if (currentId !== prevElementId && open && element) {
    resetForm(element);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{isNew ? "New Table" : "Edit Table"}</SheetTitle>
          <SheetDescription>
            {isNew
              ? "Fill in the details for this table. It will be added to the room."
              : "Update the table details below."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          {/* Size preset */}
          <div className="flex flex-col gap-1.5">
            <Label>Size preset</Label>
            <div className="grid grid-cols-3 gap-2">
              {TABLE_PRESETS.map((preset) => (
                <Button
                  key={preset.capacity}
                  type="button"
                  variant={activePreset === preset.capacity ? "default" : "outline"}
                  size="sm"
                  className="h-auto flex-col gap-0.5 py-2"
                  onClick={() => handlePresetSelect(preset.capacity)}
                >
                  <span className="text-xs font-semibold">{preset.capacity}</span>
                  <span className="text-[10px] font-normal opacity-70">seats</span>
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Presets set default size on the canvas. You can still resize manually.
            </p>
          </div>

          {/* Label */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="table-label">Label</Label>
            <Input
              id="table-label"
              placeholder="e.g. Table 1, Window Seat..."
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          {/* Capacity */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="table-capacity">Capacity</Label>
            <Input
              id="table-capacity"
              type="number"
              min={1}
              placeholder="4"
              value={capacity}
              onChange={(e) => handleCapacityChange(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="table-description">Description (optional)</Label>
            <Textarea
              id="table-description"
              placeholder="Any notes about this table..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Shape */}
          <div className="flex flex-col gap-1.5">
            <Label>Shape</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={shape === "rect" ? "default" : "outline"}
                size="sm"
                onClick={() => setShape("rect")}
              >
                Rectangle
              </Button>
              <Button
                type="button"
                variant={shape === "circle" ? "default" : "outline"}
                size="sm"
                onClick={() => setShape("circle")}
              >
                Circle
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <SheetFooter className="flex-col gap-2">
          <Button onClick={handleSave} disabled={isSaving || isDeleting}>
            {isSaving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {isNew ? "Create Table" : "Save Changes"}
          </Button>
          {!isNew && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSaving || isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-1.5 h-4 w-4" />
              )}
              Delete Table
            </Button>
          )}
          <SheetClose
            render={
              <Button
                variant="ghost"
                disabled={isSaving || isDeleting}
              />
            }
            onClick={() => {
              if (isNew && element) onCancelNew(element.id);
            }}
          >
            Cancel
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
