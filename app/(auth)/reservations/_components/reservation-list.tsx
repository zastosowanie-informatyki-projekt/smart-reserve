"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ReservationCard } from "./reservation-card";

const STATUS_FILTERS = ["ALL", "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"] as const;

export const ReservationList = ({
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
    table: { label: string };
    restaurant: { id: string; name: string };
  }>;
}) => {
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("ALL");

  const filteredReservations = useMemo(
    () =>
      statusFilter === "ALL"
        ? reservations
        : reservations.filter((reservation) => reservation.status === statusFilter),
    [reservations, statusFilter],
  );

  if (reservations.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        You don't have any reservations yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
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

      {filteredReservations.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No reservations found for this filter.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredReservations.map((reservation) => (
            <ReservationCard key={reservation.id} {...reservation} />
          ))}
        </div>
      )}
    </div>
  );
};
