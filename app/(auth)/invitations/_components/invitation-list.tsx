"use client";

import { useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { acceptInvitation } from "@/server/invitations/actions/accept-invitation";
import { declineInvitation } from "@/server/invitations/actions/decline-invitation";
import { Check, X } from "lucide-react";

type Invitation = {
  id: string;
  createdAt: Date;
  restaurant: {
    id: string;
    name: string;
    city: string;
    cuisine: string | null;
    imageUrl: string | null;
  };
};

export const InvitationList = ({
  invitations,
}: {
  invitations: Invitation[];
}) => {
  const [isPending, startTransition] = useTransition();

  const handleAccept = (id: string) => {
    startTransition(async () => {
      const r = await acceptInvitation(id);
      if (r.success) {
        window.location.href = `/dashboard/${r.data.restaurantId}`;
      }
    });
  };

  const handleDecline = (id: string) => {
    startTransition(async () => {
      await declineInvitation(id);
    });
  };

  if (invitations.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        You don&apos;t have any pending invitations.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {invitations.map((inv) => (
        <Card key={inv.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{inv.restaurant.name}</CardTitle>
            <CardDescription>
              {inv.restaurant.city}
              {inv.restaurant.cuisine ? ` · ${inv.restaurant.cuisine}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleAccept(inv.id)}
              disabled={isPending}
            >
              <Check className="mr-1.5 h-4 w-4" />
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDecline(inv.id)}
              disabled={isPending}
            >
              <X className="mr-1.5 h-4 w-4" />
              Decline
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
