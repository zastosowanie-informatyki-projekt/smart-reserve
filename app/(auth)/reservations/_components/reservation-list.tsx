import { ReservationCard } from "./reservation-card";

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
  if (reservations.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        You don't have any reservations yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {reservations.map((reservation) => (
        <ReservationCard key={reservation.id} {...reservation} />
      ))}
    </div>
  );
};
