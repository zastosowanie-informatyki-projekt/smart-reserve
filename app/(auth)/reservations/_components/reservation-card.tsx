"use client";

import { useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Users } from "lucide-react";
import { cancelReservation } from "@/server/reservations/actions/cancel-reservation";
import { APP_TIMEZONE } from "@/lib/date-utils";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  CONFIRMED: "default",
  CANCELLED: "destructive",
  COMPLETED: "secondary",
};

const formatDateTime = (date: Date) => {
  return new Date(date).toLocaleString("en-US", {
    timeZone: APP_TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const ReservationCard = ({
  id,
  startTime,
  endTime,
  guestCount,
  status,
  notes,
  table,
  restaurant,
}: {
  id: string;
  startTime: Date;
  endTime: Date;
  guestCount: number;
  status: string;
  notes: string | null;
  table: { label: string };
  restaurant: { id: string; name: string };
}) => {

  const [isPending, startTransition] = useTransition();
  const canCancel = status === "PENDING" || status === "CONFIRMED";

  const handleCancel = () => {
    startTransition(async () => {
      await cancelReservation(id);
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm">{restaurant.name}</CardTitle>
            <CardDescription>{table.label}</CardDescription>
            <CardDescription className="mt-0.5 flex items-center gap-1.5 text-xs">
              <Users className="h-3 w-3" />
              {guestCount} guests
            </CardDescription>
          </div>
          <Badge variant={STATUS_VARIANT[status] ?? "outline"}>{status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5 pt-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3" />
            <span>{formatDateTime(startTime)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>
              until{" "}
              {new Date(endTime).toLocaleTimeString("en-US", {
                timeZone: APP_TIMEZONE,
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        {(notes || canCancel) && (
          <div className="flex flex-wrap items-center gap-2">
            {notes && (
              <p className="text-xs text-muted-foreground">
                Notes: {notes}
              </p>
            )}
            {canCancel && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancel}
                disabled={isPending}
                className="ml-auto h-7 px-2.5 text-xs"
              >
                {isPending ? "Cancelling..." : "Cancel Reservation"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
