"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Opening Hours</CardTitle>
        <CardDescription>Set your weekly opening schedule</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-3">
            {hours.map((day, index) => (
              <div
                key={day.dayOfWeek}
                className="flex flex-wrap items-center gap-3 rounded-lg border p-3"
              >
                <div className="w-24">
                  <Label className="text-sm font-medium">
                    {DAY_NAMES[index]}
                  </Label>
                </div>
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
                {!day.isClosed && (
                  <>
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
                  </>
                )}
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isPending} className="w-fit">
            {isPending ? "Saving..." : "Save Opening Hours"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
