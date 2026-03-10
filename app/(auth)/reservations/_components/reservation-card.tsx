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
  NO_SHOW: "secondary",
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
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{restaurant.name}</CardTitle>
            <CardDescription>{table.label}</CardDescription>
          </div>
          <Badge variant={STATUS_VARIANT[status] ?? "outline"}>{status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{formatDateTime(startTime)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>
              until{" "}
              {new Date(endTime).toLocaleTimeString("en-US", {
                timeZone: APP_TIMEZONE,
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{guestCount} guests</span>
          </div>
        </div>
        {notes && (
          <p className="text-sm text-muted-foreground">
            Notes: {notes}
          </p>
        )}
        {canCancel && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleCancel}
            disabled={isPending}
            className="w-fit"
          >
            {isPending ? "Cancelling..." : "Cancel Reservation"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
