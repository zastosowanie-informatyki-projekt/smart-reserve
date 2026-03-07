"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { MoreHorizontal, Check, X, Clock, AlertTriangle } from "lucide-react";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  CONFIRMED: "default",
  CANCELLED: "destructive",
  COMPLETED: "secondary",
  NO_SHOW: "secondary",
};

const formatDateTime = (date: Date) => {
  return new Date(date).toLocaleString("en-US", {
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (id: string, status: string) => {
    startTransition(async () => {
      await updateReservationStatus({ id, status });
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservations</CardTitle>
        <CardDescription>
          View and manage incoming reservations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reservations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No reservations yet.
          </p>
        ) : (
          <div className="grid gap-3">
            {reservations.map((reservation) => (
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
                {reservation.status !== "CANCELLED" &&
                  reservation.status !== "COMPLETED" && (
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
                        {reservation.status === "PENDING" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(reservation.id, "CONFIRMED")
                            }
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Confirm
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(reservation.id, "COMPLETED")
                          }
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Mark Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(reservation.id, "NO_SHOW")
                          }
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Mark No-Show
                        </DropdownMenuItem>
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
