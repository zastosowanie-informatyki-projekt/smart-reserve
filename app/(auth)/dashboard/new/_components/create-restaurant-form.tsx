"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createRestaurant } from "@/server/restaurants/actions/create-restaurant";

export const CreateRestaurantForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createRestaurant(formData);
      if (result.success) {
        router.push(`/dashboard/${result.data.id}`);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Restaurant Name *</Label>
          <Input id="name" name="name" required placeholder="My Restaurant" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cuisine">Cuisine</Label>
          <Input id="cuisine" name="cuisine" placeholder="e.g. Italian" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Tell customers about your restaurant..."
          rows={3}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address">Address *</Label>
          <Input id="address" name="address" required placeholder="123 Main St" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">City *</Label>
          <Input id="city" name="city" required placeholder="Warsaw" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" placeholder="+48 123 456 789" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="contact@restaurant.com" />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Creating..." : "Create Restaurant"}
      </Button>
    </form>
  );
};
