"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createRoom } from "@/server/rooms/actions/create-room";
import { deleteRoom } from "@/server/rooms/actions/delete-room";
import { createTable } from "@/server/tables/actions/create-table";
import { deleteTable } from "@/server/tables/actions/delete-table";
import { Plus, Trash2, Users, DoorOpen } from "lucide-react";

export const RoomManagement = ({
  restaurantId,
  rooms,
}: {
  restaurantId: string;
  rooms: Array<{
    id: string;
    name: string;
    description: string | null;
    tables: Array<{
      id: string;
      label: string;
      capacity: number;
      description: string | null;
      isActive: boolean;
    }>;
  }>;
}) => {

  const [isPending, startTransition] = useTransition();
  const [roomError, setRoomError] = useState<string | null>(null);
  const [tableErrors, setTableErrors] = useState<Record<string, string | null>>({});

  const handleAddRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRoomError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("restaurantId", restaurantId);
    const form = e.currentTarget;

    startTransition(async () => {
      const result = await createRoom(formData);
      if (result.success) {
        form.reset();
      } else {
        setRoomError(result.error);
      }
    });
  };

  const handleDeleteRoom = (roomId: string) => {
    startTransition(async () => {
      await deleteRoom(roomId);
    });
  };

  const handleAddTable = (roomId: string, form: HTMLFormElement) => {
    setTableErrors((prev) => ({ ...prev, [roomId]: null }));

    const formData = new FormData(form);
    formData.set("roomId", roomId);

    startTransition(async () => {
      const result = await createTable(formData);
      if (result.success) {
        form.reset();
      } else {
        setTableErrors((prev) => ({ ...prev, [roomId]: result.error }));
      }
    });
  };

  const handleDeleteTable = (tableId: string) => {
    startTransition(async () => {
      await deleteTable(tableId);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rooms & Tables</CardTitle>
        <CardDescription>
          Organize your restaurant into rooms and manage tables within each room
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {rooms.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No rooms added yet. Create a room to start adding tables.
          </p>
        ) : (
          rooms.map((room) => (
            <div key={room.id} className="rounded-lg border">
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-2">
                  <DoorOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{room.name}</span>
                  {room.description && (
                    <span className="text-sm text-muted-foreground">
                      — {room.description}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteRoom(room.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>

              <div className="p-4">
                <div className="grid gap-2">
                  {room.tables.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No tables in this room yet.
                    </p>
                  ) : (
                    room.tables.map((table) => (
                      <div
                        key={table.id}
                        className="flex items-center justify-between rounded-md border p-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-medium">{table.label}</p>
                          {table.description && (
                            <p className="text-xs text-muted-foreground">
                              {table.description}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {table.capacity}
                          </div>
                          {!table.isActive && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTable(table.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddTable(room.id, e.currentTarget);
                  }}
                  className="mt-3 flex flex-col gap-3 rounded-md border p-3"
                >
                  <p className="text-xs font-medium">Add Table</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input name="label" required placeholder="Table label" />
                    <Input
                      name="capacity"
                      type="number"
                      min={1}
                      required
                      placeholder="Capacity"
                    />
                    <Input name="description" placeholder="Description" />
                  </div>
                  {tableErrors[room.id] && (
                    <p className="text-sm text-destructive">{tableErrors[room.id]}</p>
                  )}
                  <Button type="submit" disabled={isPending} size="sm" className="w-fit">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    {isPending ? "Adding..." : "Add Table"}
                  </Button>
                </form>
              </div>
            </div>
          ))
        )}

        <form onSubmit={handleAddRoom} className="flex flex-col gap-4 rounded-lg border p-4">
          <p className="text-sm font-medium">Add New Room</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="room-name">Name</Label>
              <Input
                id="room-name"
                name="name"
                required
                placeholder="Main Hall"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="room-description">Description</Label>
              <Input
                id="room-description"
                name="description"
                placeholder="Ground floor dining area"
              />
            </div>
          </div>
          {roomError && <p className="text-sm text-destructive">{roomError}</p>}
          <Button type="submit" disabled={isPending} size="sm" className="w-fit">
            <Plus className="mr-1.5 h-4 w-4" />
            {isPending ? "Adding..." : "Add Room"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
