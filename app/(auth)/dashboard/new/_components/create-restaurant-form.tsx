"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createRestaurant } from "@/server/restaurants/actions/create-restaurant";
import { CUISINE_OPTIONS } from "@/lib/cuisines";
import type { CuisineType } from "@/app/generated/prisma/client";

export const CreateRestaurantForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedCuisines, setSelectedCuisines] = useState<CuisineType[]>([]);

  const toggleCuisine = (value: CuisineType) => {
    setSelectedCuisines((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value],
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    selectedCuisines.forEach((c) => formData.append("cuisines", c));

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
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Cuisines</Label>
        <div className="flex flex-wrap gap-2">
          {CUISINE_OPTIONS.map((option) => {
            const active = selectedCuisines.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleCuisine(option.value)}
                className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {option.label}
              </button>
            );
          })}
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
          <Label htmlFor="street">Street *</Label>
          <Input id="street" name="street" required placeholder="ul. Marszałkowska" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="buildingNumber">Building Number *</Label>
          <Input id="buildingNumber" name="buildingNumber" required placeholder="10A" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" type="url" placeholder="https://myrestaurant.com" />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Creating..." : "Create Restaurant"}
      </Button>
    </form>
  );
};
