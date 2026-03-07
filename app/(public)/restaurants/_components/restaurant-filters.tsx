"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";

export const RestaurantFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [cuisine, setCuisine] = useState(searchParams.get("cuisine") ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (cuisine) params.set("cuisine", cuisine);
    router.push(`/restaurants?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          placeholder="e.g. Warsaw"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cuisine">Cuisine</Label>
        <Input
          id="cuisine"
          placeholder="e.g. Italian"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
        />
      </div>
      <Button type="submit">
        <Search className="mr-2 h-4 w-4" />
        Search
      </Button>
    </form>
  );
};
