"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getAvailableTables } from "@/server/tables/actions/get-available-tables";
import { createReservation } from "@/server/reservations/actions/create-reservation";
import { FloorPlanViewer } from "./floor-plan-viewer";
import { Search, AlertCircle } from "lucide-react";
import { toUTC } from "@/lib/date-utils";
import type { RoomWithFloorPlan } from "@/server/rooms/types";

type OpeningHoursEntry = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

function generateTimeSlots(open: string, close: string): string[] {
  const slots: string[] = [];
  const [openH, openM] = open.split(":").map(Number);
  const [closeH, closeM] = close.split(":").map(Number);
  const startMinutes = openH * 60 + openM;
  const endMinutes = closeH * 60 + closeM;

  for (let m = startMinutes; m <= endMinutes; m += 30) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  }
  return slots;
}

function getDayOfWeekFromDate(dateStr: string): number {
  const date = new Date(dateStr + "T00:00:00");
  const jsDay = date.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const ReservationForm = ({
  restaurantId,
  isAuthenticated,
  openingHours,
  floorPlan,
}: {
  restaurantId: string;
  isAuthenticated: boolean;
  openingHours: OpeningHoursEntry[];
  floorPlan: RoomWithFloorPlan[];
}) => {
  const router = useRouter();
  const [isSearching, startSearchTransition] = useTransition();
  const [isBooking, startBookTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState("");
  const [startTimeSlot, setStartTimeSlot] = useState("");
  const [endTimeSlot, setEndTimeSlot] = useState("");
  const [guestCount, setGuestCount] = useState("");

  const [availableTables, setAvailableTables] = useState<Array<{
    id: string;
    label: string;
    capacity: number;
    description: string | null;
  }> | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const hasOpeningHours = openingHours.length > 0;

  const selectedDayHours = useMemo(() => {
    if (!date || !hasOpeningHours) return null;
    const dow = getDayOfWeekFromDate(date);
    return openingHours.find((h) => h.dayOfWeek === dow) ?? null;
  }, [date, openingHours, hasOpeningHours]);

  const isDayClosed = selectedDayHours?.isClosed === true;

  const startTimeSlots = useMemo(() => {
    if (!selectedDayHours || isDayClosed) return [];
    return generateTimeSlots(selectedDayHours.openTime, selectedDayHours.closeTime);
  }, [selectedDayHours, isDayClosed]);

  const endTimeSlots = useMemo(() => {
    if (!startTimeSlot || !selectedDayHours || isDayClosed) return [];
    return generateTimeSlots(selectedDayHours.openTime, selectedDayHours.closeTime).filter(
      (slot) => slot > startTimeSlot,
    );
  }, [startTimeSlot, selectedDayHours, isDayClosed]);

  const resetSearch = () => {
    setHasSearched(false);
    setAvailableTables(null);
    setSelectedTableId(null);
  };

  const toUTCISO = (dateStr: string, timeStr: string) => toUTC(dateStr, timeStr).toISOString();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSelectedTableId(null);
    setAvailableTables(null);

    const startTime = toUTCISO(date, startTimeSlot);
    const endTime = toUTCISO(date, endTimeSlot);

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

    const startTime = toUTCISO(date, startTimeSlot);
    const endTime = toUTCISO(date, endTimeSlot);

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
          <CardDescription>Please sign in to make a reservation.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  // Build a set of available table IDs for the floor plan viewer
  const availableTableIds = new Set(availableTables?.map((t) => t.id) ?? []);

  // Only show the floor plan viewer when there is a floor plan and search results
  const hasFloorPlan =
    floorPlan.length > 0 && floorPlan.some((r) => (r.floorPlan?.elements.length ?? 0) > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a Reservation</CardTitle>
        <CardDescription>Choose your date, time, and party size to see available tables.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Step 1: Search */}
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              required
              min={today}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setStartTimeSlot("");
                setEndTimeSlot("");
                resetSearch();
              }}
            />
          </div>

          {date && hasOpeningHours && isDayClosed && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                The restaurant is closed on {DAY_NAMES[getDayOfWeekFromDate(date)]}s. Please select a
                different date.
              </span>
            </div>
          )}

          {date && hasOpeningHours && !isDayClosed && selectedDayHours && (
            <p className="text-xs text-muted-foreground">
              Open on {DAY_NAMES[getDayOfWeekFromDate(date)]}: {selectedDayHours.openTime} &ndash;{" "}
              {selectedDayHours.closeTime}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startTimeSlot">Start Time</Label>
              {hasOpeningHours ? (
                <Select
                  value={startTimeSlot}
                  onValueChange={(val) => {
                    setStartTimeSlot(val ?? "");
                    setEndTimeSlot("");
                    resetSearch();
                  }}
                  disabled={!date || isDayClosed}
                >
                  <SelectTrigger id="startTimeSlot">
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {startTimeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="startTimeSlot"
                  type="time"
                  required
                  value={startTimeSlot}
                  onChange={(e) => {
                    setStartTimeSlot(e.target.value);
                    setEndTimeSlot("");
                    resetSearch();
                  }}
                />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endTimeSlot">End Time</Label>
              {hasOpeningHours ? (
                <Select
                  value={endTimeSlot}
                  onValueChange={(val) => {
                    setEndTimeSlot(val ?? "");
                    resetSearch();
                  }}
                  disabled={!startTimeSlot || isDayClosed}
                >
                  <SelectTrigger id="endTimeSlot">
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent>
                    {endTimeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="endTimeSlot"
                  type="time"
                  required
                  value={endTimeSlot}
                  onChange={(e) => {
                    setEndTimeSlot(e.target.value);
                    resetSearch();
                  }}
                />
              )}
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
                resetSearch();
              }}
            />
          </div>

          <Button
            type="submit"
            variant="secondary"
            disabled={isSearching || !date || !startTimeSlot || !endTimeSlot || !guestCount || isDayClosed}
          >
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
                No tables available for the selected date, time, and party size. Try different times or a
                smaller group.
              </p>
            ) : (
              <form onSubmit={handleBook} className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <Label>Available Tables ({availableTables.length} found)</Label>

                  {hasFloorPlan ? (
                    <FloorPlanViewer
                      rooms={floorPlan}
                      availableTableIds={availableTableIds}
                      selectedTableId={selectedTableId}
                      onSelect={setSelectedTableId}
                    />
                  ) : (
                    // Fallback: simple list when no floor plan exists
                    <div className="grid gap-3 sm:grid-cols-2">
                      {availableTables.map((table) => (
                        <button
                          key={table.id}
                          type="button"
                          onClick={() => setSelectedTableId(table.id)}
                          className={`rounded-lg border p-4 text-left transition-colors ${
                            selectedTableId === table.id
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/50"
                          }`}
                        >
                          <p className="font-medium">{table.label}</p>
                          {table.description && (
                            <p className="text-xs text-muted-foreground">{table.description}</p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            Capacity: {table.capacity}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea id="notes" name="notes" placeholder="Any special requests..." rows={3} />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" disabled={isBooking || !selectedTableId}>
                  {isBooking ? "Reserving..." : "Reserve Table"}
                </Button>
              </form>
            )}
          </>
        )}

        {!hasSearched && error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
};
