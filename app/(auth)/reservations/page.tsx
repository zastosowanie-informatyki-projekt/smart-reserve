import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserReservations } from "@/server/reservations/actions/get-user-reservations";
import { ReservationList } from "./_components/reservation-list";

export const metadata = {
  title: "My Reservations | TableSpot",
};

export default async function ReservationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const result = await getUserReservations();
  const reservations = result.success ? result.data : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Reservations</h1>
        <p className="text-muted-foreground">
          View and manage your restaurant reservations
        </p>
      </div>
      <ReservationList reservations={reservations} />
    </div>
  );
}
