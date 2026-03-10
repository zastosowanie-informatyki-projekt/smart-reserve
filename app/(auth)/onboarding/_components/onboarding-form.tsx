"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { setUserRole } from "@/server/auth/actions/set-user-role";
import { CalendarDays, Store, Briefcase } from "lucide-react";

export const OnboardingForm = ({ userName }: { userName: string }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (role: "USER" | "RESTAURANT_OWNER" | "EMPLOYEE") => {
    setError(null);
    startTransition(async () => {
      const result = await setUserRole(role);
      if (result.success) {
        router.push(role === "RESTAURANT_OWNER" ? "/dashboard" : "/restaurants");
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome, {userName}!</CardTitle>
        <CardDescription>
          How do you plan to use TableSpot?
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => handleSelect("USER")}
          disabled={isPending}
          className="flex items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-accent disabled:opacity-50"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <CalendarDays className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">I want to make reservations</p>
            <p className="text-sm text-muted-foreground">
              Browse restaurants and book tables
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleSelect("RESTAURANT_OWNER")}
          disabled={isPending}
          className="flex items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-accent disabled:opacity-50"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">I want to manage a restaurant</p>
            <p className="text-sm text-muted-foreground">
              Create and manage your restaurant listings
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleSelect("EMPLOYEE")}
          disabled={isPending}
          className="flex items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-accent disabled:opacity-50"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">I am a restaurant employee</p>
            <p className="text-sm text-muted-foreground">
              Get assigned to a restaurant by its owner
            </p>
          </div>
        </button>

        {error && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
};
