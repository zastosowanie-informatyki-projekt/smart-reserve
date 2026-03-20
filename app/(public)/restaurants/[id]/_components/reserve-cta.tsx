"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export const ReserveCta = ({ restaurantId }: { restaurantId: string }) => {
  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `/restaurants/${restaurantId}/reserve`,
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignIn}
    >
      <LogIn className="mr-1.5 h-4 w-4" />
      Sign in to reserve
    </Button>
  );
};
