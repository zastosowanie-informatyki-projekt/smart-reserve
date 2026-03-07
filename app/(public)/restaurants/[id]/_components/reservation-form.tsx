"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createReservation } from "@/server/reservations/actions/create-reservation";
import { TableList } from "./table-list";

export const ReservationForm = ({
  restaurantId,
  tables,
  isAuthenticated,
}: {
  restaurantId: string;
  tables: Array<{
    id: string;
    label: string;
    capacity: number;
    description: string | null;
  }>;
  isAuthenticated: boolean;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!selectedTableId) {
      setError("Please select a table");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("tableId", selectedTableId);
    formData.set("restaurantId", restaurantId);

    startTransition(async () => {
      const result = await createReservation(formData);
      if (result.success) {
        router.push("/reservations");
      } else {
        setError(result.error);
      }
    });
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Make a Reservation</CardTitle>
          <CardDescription>
            Please sign in to make a reservation.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a Reservation</CardTitle>
        <CardDescription>
          Select a table and choose your preferred time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Label>Select a Table</Label>
            <TableList
              tables={tables}
              selectedTableId={selectedTableId}
              onSelect={setSelectedTableId}
            />
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                name="startTime"
                type="datetime-local"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                name="endTime"
                type="datetime-local"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="guestCount">Number of Guests</Label>
            <Input
              id="guestCount"
              name="guestCount"
              type="number"
              min={1}
              required
              placeholder="2"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any special requests..."
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Reserving..." : "Reserve Table"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
