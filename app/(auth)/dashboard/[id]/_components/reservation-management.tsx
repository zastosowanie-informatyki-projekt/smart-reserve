"use client";

import { useMemo, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateReservationStatus } from "@/server/reservations/actions/update-reservation-status";
import { MoreHorizontal, Check, X } from "lucide-react";
import { APP_TIMEZONE } from "@/lib/date-utils";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  CONFIRMED: "default",
  CANCELLED: "destructive",
  COMPLETED: "secondary",
};

const STATUS_FILTERS = ["ALL", "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"] as const;

const formatDateTime = (date: Date) => {
  return new Date(date).toLocaleString("en-US", {
    timeZone: APP_TIMEZONE,
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const ReservationManagement = ({
  reservations,
}: {
  reservations: Array<{
    id: string;
    startTime: Date;
    endTime: Date;
    guestCount: number;
    status: string;
    notes: string | null;
    createdAt: Date;
    table: { id: string; label: string };
    user: { id: string; name: string; email: string };
  }>;
}) => {

  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("ALL");

  const handleStatusChange = (id: string, status: string) => {
    startTransition(async () => {
      await updateReservationStatus({ id, status });
    });
  };

  const filteredReservations = useMemo(
    () =>
      statusFilter === "ALL"
        ? reservations
        : reservations.filter((reservation) => reservation.status === statusFilter),
    [reservations, statusFilter],
  );

  const groupedReservations = useMemo(
    () => ({
      PENDING: filteredReservations.filter((reservation) => reservation.status === "PENDING"),
      CONFIRMED: filteredReservations.filter((reservation) => reservation.status === "CONFIRMED"),
      CANCELLED: filteredReservations.filter((reservation) => reservation.status === "CANCELLED"),
      COMPLETED: filteredReservations.filter((reservation) => reservation.status === "COMPLETED"),
    }),
    [filteredReservations],
  );

  const renderReservation = (reservation: (typeof reservations)[0]) => (
    <div
      key={reservation.id}
      className="flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {reservation.user.name}
          </span>
          <Badge variant={STATUS_VARIANT[reservation.status] ?? "outline"}>
            {reservation.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {reservation.user.email}
        </p>
        <p className="text-xs text-muted-foreground">
          {reservation.table.label} · {reservation.guestCount} guests
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDateTime(reservation.startTime)} -{" "}
          {formatDateTime(reservation.endTime)}
        </p>
        {reservation.notes && (
          <p className="text-xs text-muted-foreground">
            Notes: {reservation.notes}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {reservation.status === "PENDING" && (
          <>
            <Button
              size="sm"
              onClick={() => handleStatusChange(reservation.id, "CONFIRMED")}
              disabled={isPending}
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleStatusChange(reservation.id, "CANCELLED")}
              disabled={isPending}
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Reject
            </Button>
          </>
        )}
        {reservation.status === "CONFIRMED" && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                />
              }
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  handleStatusChange(reservation.id, "CANCELLED")
                }
                className="text-destructive"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservations</CardTitle>
        <CardDescription>
          View and manage incoming reservations
        </CardDescription>
        <div className="flex flex-wrap gap-2 pt-2">
          {STATUS_FILTERS.map((status) => (
            <Button
              key={status}
              type="button"
              size="sm"
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
            >
              {status === "ALL" ? "All" : status}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {filteredReservations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No reservations found for this filter.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {groupedReservations.PENDING.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold">
                  Pending Approval ({groupedReservations.PENDING.length})
                </h3>
                <div className="grid gap-3">
                  {groupedReservations.PENDING.map(renderReservation)}
                </div>
              </div>
            )}
            {groupedReservations.CONFIRMED.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold">
                  Confirmed ({groupedReservations.CONFIRMED.length})
                </h3>
                <div className="grid gap-3">
                  {groupedReservations.CONFIRMED.map(renderReservation)}
                </div>
              </div>
            )}
            {groupedReservations.CANCELLED.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold">
                  Cancelled ({groupedReservations.CANCELLED.length})
                </h3>
                <div className="grid gap-3">
                  {groupedReservations.CANCELLED.map(renderReservation)}
                </div>
              </div>
            )}
            {groupedReservations.COMPLETED.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold">
                  Completed ({groupedReservations.COMPLETED.length})
                </h3>
                <div className="grid gap-3">
                  {groupedReservations.COMPLETED.map(renderReservation)}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
