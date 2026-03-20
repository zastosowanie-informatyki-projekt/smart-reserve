import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getMyInvitations } from "@/server/invitations/actions/get-my-invitations";
import { InvitationList } from "./_components/invitation-list";

export const metadata = {
  title: "Invitations | TableSpot",
};

export default async function InvitationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const result = await getMyInvitations();
  const invitations = result.success ? result.data : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Invitations</h1>
        <p className="text-muted-foreground">
          Restaurants that have invited you to join their team
        </p>
      </div>

      <InvitationList invitations={invitations} />
    </div>
  );
}
