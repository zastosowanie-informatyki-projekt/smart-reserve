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
import { getAvailableTables } from "@/server/tables/actions/get-available-tables";
import { createReservation } from "@/server/reservations/actions/create-reservation";
import { TableList } from "./table-list";
import { Search } from "lucide-react";

export const ReservationForm = ({
  restaurantId,
  isAuthenticated,
}: {
  restaurantId: string;
  isAuthenticated: boolean;
}) => {
  const router = useRouter();
  const [isSearching, startSearchTransition] = useTransition();
  const [isBooking, startBookTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [guestCount, setGuestCount] = useState("");

  const [availableTables, setAvailableTables] = useState<
    Array<{
      id: string;
      label: string;
      capacity: number;
      description: string | null;
    }> | null
  >(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSelectedTableId(null);
    setAvailableTables(null);

    startSearchTransition(async () => {
      const result = await getAvailableTables({
        restaurantId,
        startTime,
        endTime,
        guestCount: Number(guestCount),
      });

      if (result.success) {
        setAvailableTables(result.data);
        setHasSearched(true);
      } else {
        setError(result.error);
      }
    });
  };

  const handleBook = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!selectedTableId) {
      setError("Please select a table");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("tableId", selectedTableId);
    formData.set("restaurantId", restaurantId);
    formData.set("startTime", startTime);
    formData.set("endTime", endTime);
    formData.set("guestCount", guestCount);

    startBookTransition(async () => {
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
          Choose your date, time, and party size to see available tables.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Step 1: Search */}
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setHasSearched(false);
                  setAvailableTables(null);
                  setSelectedTableId(null);
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setHasSearched(false);
                  setAvailableTables(null);
                  setSelectedTableId(null);
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="guestCount">Number of Guests</Label>
            <Input
              id="guestCount"
              type="number"
              min={1}
              required
              placeholder="2"
              value={guestCount}
              onChange={(e) => {
                setGuestCount(e.target.value);
                setHasSearched(false);
                setAvailableTables(null);
                setSelectedTableId(null);
              }}
            />
          </div>

          <Button type="submit" variant="secondary" disabled={isSearching}>
            <Search className="mr-2 h-4 w-4" />
            {isSearching ? "Searching..." : "Search Available Tables"}
          </Button>
        </form>

        {/* Step 2: Select table and book */}
        {hasSearched && availableTables !== null && (
          <>
            <Separator />

            {availableTables.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tables available for the selected date, time, and party size.
                Try different times or a smaller group.
              </p>
            ) : (
              <form onSubmit={handleBook} className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <Label>
                    Available Tables ({availableTables.length} found)
                  </Label>
                  <TableList
                    tables={availableTables}
                    selectedTableId={selectedTableId}
                    onSelect={setSelectedTableId}
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

                <Button type="submit" disabled={isBooking || !selectedTableId}>
                  {isBooking ? "Reserving..." : "Reserve Table"}
                </Button>
              </form>
            )}
          </>
        )}

        {!hasSearched && error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
};
