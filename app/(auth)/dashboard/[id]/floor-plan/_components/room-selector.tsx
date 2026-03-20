"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DoorOpen, Pencil, Trash2, Check, X, Plus, Loader2 } from "lucide-react";
import { createRoom } from "@/server/rooms/actions/create-room";
import { updateRoom } from "@/server/rooms/actions/update-room";
import { deleteRoom } from "@/server/rooms/actions/delete-room";
import type { RoomEntry, LocalElement, EditorTool, DecorationPreset } from "./types";
import { cn } from "@/lib/utils";

interface RoomSelectorProps {
  restaurantId: string;
  rooms: RoomEntry[];
  activeRoomId: string | null;
  onRoomChange: (roomId: string) => void;
  onRoomsChanged: (rooms: RoomEntry[]) => void;
  onActiveRoomDeleted: () => void;
  elements: LocalElement[];
  activeTool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
  onAddDecoration: (preset: DecorationPreset) => void;
}

export const RoomSelector = ({
  restaurantId,
  rooms,
  activeRoomId,
  onRoomChange,
  onRoomsChanged,
  onActiveRoomDeleted,
  elements,
  activeTool,
  onToolChange,
  onAddDecoration,
}: RoomSelectorProps) => {
  const placedCount = elements.filter((e) => e.type === "table").length;

  const [isPending, startTransition] = useTransition();

  // Inline rename state
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  // Add-room form state
  const [addName, setAddName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Confirm-delete dialog state
  const [pendingDelete, setPendingDelete] = useState<{
    roomId: string;
    roomName: string;
    upcomingCount: number;
  } | null>(null);
  const [isForceDeleting, startForceDeleteTransition] = useTransition();

  // ── Rename ────────────────────────────────────────────────────────────────

  const handleStartRename = (room: RoomEntry) => {
    setEditingRoomId(room.id);
    setEditingName(room.name);
    setEditError(null);
  };

  const handleCancelRename = () => {
    setEditingRoomId(null);
    setEditError(null);
  };

  const handleSaveRename = (roomId: string) => {
    if (!editingName.trim()) return;
    setEditError(null);
    const fd = new FormData();
    fd.set("id", roomId);
    fd.set("name", editingName.trim());
    startTransition(async () => {
      const result = await updateRoom(fd);
      if (!result.success) {
        setEditError(result.error);
        return;
      }
      onRoomsChanged(
        rooms.map((r) => (r.id === roomId ? { ...r, name: editingName.trim() } : r)),
      );
      setEditingRoomId(null);
    });
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = (roomId: string) => {
    startTransition(async () => {
      const result = await deleteRoom(roomId);
      if (!result.success) return;
      if (result.data.upcomingReservations && result.data.upcomingReservations > 0) {
        const room = rooms.find((r) => r.id === roomId);
        setPendingDelete({
          roomId,
          roomName: room?.name ?? "this room",
          upcomingCount: result.data.upcomingReservations,
        });
        return;
      }
      const next = rooms.filter((r) => r.id !== roomId);
      onRoomsChanged(next);
      if (roomId === activeRoomId) onActiveRoomDeleted();
    });
  };

  const handleForceDelete = () => {
    if (!pendingDelete) return;
    const { roomId } = pendingDelete;
    startForceDeleteTransition(async () => {
      const result = await deleteRoom(roomId, true);
      if (!result.success) return;
      setPendingDelete(null);
      const next = rooms.filter((r) => r.id !== roomId);
      onRoomsChanged(next);
      if (roomId === activeRoomId) onActiveRoomDeleted();
    });
  };

  // ── Create ────────────────────────────────────────────────────────────────

  const handleAddRoom = () => {
    if (!addName.trim()) return;
    setAddError(null);
    const fd = new FormData();
    fd.set("restaurantId", restaurantId);
    fd.set("name", addName.trim());
    startTransition(async () => {
      const result = await createRoom(fd);
      if (!result.success) {
        setAddError(result.error);
        return;
      }
      const newRoom: RoomEntry = {
        id: result.data.id,
        name: addName.trim(),
        description: null,
        tables: [],
      };
      onRoomsChanged([...rooms, newRoom]);
      setAddName("");
      setShowAddForm(false);
      onRoomChange(result.data.id);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Rooms */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Rooms
        </p>
        <div className="flex flex-col gap-1">
          {rooms.length === 0 && !showAddForm ? (
            <p className="text-xs text-muted-foreground">No rooms yet.</p>
          ) : (
            rooms.map((room) => (
              <div key={room.id}>
                {editingRoomId === room.id ? (
                  // ── Inline rename row ──────────────────────────────────
                  <div className="flex flex-col gap-1 rounded-md border px-2 py-1.5">
                    <div className="flex items-center gap-1">
                      <Input
                        className="h-6 flex-1 text-xs"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename(room.id);
                          if (e.key === "Escape") handleCancelRename();
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRename(room.id)}
                        disabled={isPending || !editingName.trim()}
                        className="rounded p-0.5 hover:bg-muted disabled:opacity-50"
                        title="Save"
                      >
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      </button>
                      <button
                        onClick={handleCancelRename}
                        disabled={isPending}
                        className="rounded p-0.5 hover:bg-muted disabled:opacity-50"
                        title="Cancel"
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    {editError && (
                      <p className="text-[10px] text-destructive">{editError}</p>
                    )}
                  </div>
                ) : (
                  // ── Normal room row ────────────────────────────────────
                  <div
                    className={cn(
                      "group flex items-center gap-1 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                      room.id === activeRoomId
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted",
                    )}
                  >
                    <button
                      className="flex min-w-0 flex-1 items-center gap-1.5"
                      onClick={() => onRoomChange(room.id)}
                    >
                      <DoorOpen className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate font-medium">{room.name}</span>
                      <Badge
                        variant={room.id === activeRoomId ? "secondary" : "outline"}
                        className="ml-auto text-[10px]"
                      >
                        {room.id === activeRoomId ? placedCount : room.tables.length}
                      </Badge>
                    </button>
                    {/* Action icons — always visible on active, shown on hover otherwise */}
                    <div
                      className={cn(
                        "flex shrink-0 items-center gap-0.5",
                        room.id === activeRoomId ? "flex" : "hidden group-hover:flex",
                      )}
                    >
                      <button
                        onClick={() => handleStartRename(room)}
                        disabled={isPending}
                        className={cn(
                          "rounded p-0.5 disabled:opacity-50",
                          room.id === activeRoomId
                            ? "hover:bg-primary-foreground/20"
                            : "hover:bg-muted",
                        )}
                        title="Rename room"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        disabled={isPending}
                        className={cn(
                          "rounded p-0.5 disabled:opacity-50",
                          room.id === activeRoomId
                            ? "hover:bg-primary-foreground/20"
                            : "hover:bg-muted",
                        )}
                        title="Delete room"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add room */}
        {showAddForm ? (
          <div className="mt-2 flex flex-col gap-1">
            <Input
              className="h-7 text-xs"
              placeholder="Room name"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddRoom();
                if (e.key === "Escape") {
                  setShowAddForm(false);
                  setAddName("");
                  setAddError(null);
                }
              }}
              autoFocus
            />
            {addError && <p className="text-[10px] text-destructive">{addError}</p>}
            <div className="flex gap-1">
              <Button
                size="sm"
                className="h-6 flex-1 text-xs"
                onClick={handleAddRoom}
                disabled={isPending || !addName.trim()}
              >
                {isPending ? "Adding..." : "Add"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => {
                  setShowAddForm(false);
                  setAddName("");
                  setAddError(null);
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-1 flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted"
          >
            <Plus className="h-3 w-3" />
            Add room
          </button>
        )}
      </div>

      {/* Tools */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tool
        </p>
        <div className="flex flex-col gap-1">
          <Button
            variant={activeTool === "select" ? "default" : "outline"}
            size="sm"
            className="justify-start"
            onClick={() => onToolChange("select")}
          >
            Select / Move
          </Button>
          <Button
            variant={activeTool === "add-table" ? "default" : "outline"}
            size="sm"
            className="justify-start"
            onClick={() => onToolChange("add-table")}
            disabled={!activeRoomId}
          >
            Place Table
          </Button>
        </div>
      </div>

      {/* Decorations */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Add Element
        </p>
        <div className="flex flex-col gap-1">
          <Button
            variant="outline"
            size="sm"
            className="justify-start"
            onClick={() => onAddDecoration("door")}
            disabled={!activeRoomId}
          >
            + Door
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="justify-start"
            onClick={() => onAddDecoration("window")}
            disabled={!activeRoomId}
          >
            + Window
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="justify-start"
            onClick={() => onAddDecoration("wall")}
            disabled={!activeRoomId}
          >
            + Wall
          </Button>
        </div>
      </div>

      {activeTool === "add-table" && (
        <p className="rounded-md bg-primary/10 px-3 py-2 text-xs text-primary">
          Click anywhere on the canvas to place a new table.
        </p>
      )}

      {/* Confirm-delete dialog — shown when room has upcoming reservations */}
      <Dialog open={!!pendingDelete} onOpenChange={(open) => { if (!open) setPendingDelete(null); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete room with active reservations?</DialogTitle>
            <DialogDescription>
              <strong>{pendingDelete?.roomName}</strong> has{" "}
              <strong>{pendingDelete?.upcomingCount}</strong> upcoming{" "}
              {pendingDelete?.upcomingCount === 1 ? "reservation" : "reservations"} that will be
              permanently deleted along with the room and all its tables. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={isForceDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleForceDelete}
              disabled={isForceDeleting}
            >
              {isForceDeleting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Delete anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
