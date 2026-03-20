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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Clock3 } from "lucide-react";
import { setOpeningHours } from "@/server/restaurants/actions/set-opening-hours";

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const OpeningHoursForm = ({
  restaurantId,
  currentHours,
}: {
  restaurantId: string;
  currentHours: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
}) => {

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const getDefault = (dayOfWeek: number) => {
    const existing = currentHours.find((h) => h.dayOfWeek === dayOfWeek);
    return existing ?? { openTime: "09:00", closeTime: "22:00", isClosed: false };
  };

  const [hours, setHours] = useState(
    DAY_NAMES.map((_, i) => ({
      dayOfWeek: i,
      ...getDefault(i),
    })),
  );

  const updateDay = (
    index: number,
    field: "openTime" | "closeTime" | "isClosed",
    value: string | boolean,
  ) => {
    setHours((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await setOpeningHours({
        restaurantId,
        hours,
      });
      if (!result.success) {
        setError(result.error);
      }
    });
  };

  const openDaysCount = hours.filter((day) => !day.isClosed).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock3 className="h-4 w-4" />
          Opening Hours
        </CardTitle>
        <CardDescription>
          {openDaysCount} days open this week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Sheet>
          <SheetTrigger render={<Button variant="outline" size="sm" />}>
            Edit Schedule
          </SheetTrigger>
          <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-xl">
            <SheetHeader className="border-b p-4">
              <SheetTitle>Opening Hours</SheetTitle>
              <SheetDescription>Set your weekly opening schedule.</SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
              <div className="grid gap-3">
                {hours.map((day, index) => (
                  <div
                    key={day.dayOfWeek}
                    className="flex flex-col gap-3 rounded-lg border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">{DAY_NAMES[index]}</Label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={day.isClosed}
                          onChange={(e) =>
                            updateDay(index, "isClosed", e.target.checked)
                          }
                          className="rounded"
                        />
                        Closed
                      </label>
                    </div>
                    {!day.isClosed && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={day.openTime}
                          onChange={(e) =>
                            updateDay(index, "openTime", e.target.value)
                          }
                          className="w-32"
                        />
                        <span className="text-sm text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={day.closeTime}
                          onChange={(e) =>
                            updateDay(index, "closeTime", e.target.value)
                          }
                          className="w-32"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" disabled={isPending} className="w-fit">
                {isPending ? "Saving..." : "Save Opening Hours"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
};
