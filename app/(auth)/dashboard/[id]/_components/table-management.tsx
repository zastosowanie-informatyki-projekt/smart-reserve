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
import { createTable } from "@/server/tables/actions/create-table";
import { deleteTable } from "@/server/tables/actions/delete-table";
import { Plus, Trash2, Users } from "lucide-react";

export const TableManagement = ({
  restaurantId,
  tables,
}: {
  restaurantId: string;
  tables: Array<{
    id: string;
    label: string;
    capacity: number;
    description: string | null;
    isActive: boolean;
  }>;
}) => {

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAddTable = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("restaurantId", restaurantId);

    const form = e.currentTarget;

    startTransition(async () => {
      const result = await createTable(formData);
      if (result.success) {
        form.reset();
      } else {
        setError(result.error);
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
        <CardTitle>Tables</CardTitle>
        <CardDescription>Manage tables at your restaurant</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-2">
          {tables.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tables added yet.
            </p>
          ) : (
            tables.map((table) => (
              <div
                key={table.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium">{table.label}</p>
                    {table.description && (
                      <p className="text-xs text-muted-foreground">
                        {table.description}
                      </p>
                    )}
                  </div>
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
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddTable} className="flex flex-col gap-4 rounded-lg border p-4">
          <p className="text-sm font-medium">Add New Table</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="table-label">Label</Label>
              <Input
                id="table-label"
                name="label"
                required
                placeholder="Table 1"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="table-capacity">Capacity</Label>
              <Input
                id="table-capacity"
                name="capacity"
                type="number"
                min={1}
                required
                placeholder="4"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="table-description">Description</Label>
              <Input
                id="table-description"
                name="description"
                placeholder="Window seat"
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={isPending} size="sm" className="w-fit">
            <Plus className="mr-1.5 h-4 w-4" />
            {isPending ? "Adding..." : "Add Table"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
