import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { CUISINE_LABEL } from "@/lib/cuisines";
import type { CuisineType } from "@/app/generated/prisma/client";

export const RestaurantOwnerCard = ({
  id,
  name,
  city,
  cuisines,
}: {
  id: string;
  name: string;
  city: string;
  cuisines: CuisineType[];
}) => {
  const cuisineText = cuisines.map((c) => CUISINE_LABEL[c]).join(", ");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">{name}</CardTitle>
          <CardDescription>
            {city}
            {cuisineText ? ` · ${cuisineText}` : ""}
          </CardDescription>
        </div>
        <Link href={`/dashboard/${id}`}>
          <Button variant="outline" size="sm">
            <Settings className="mr-1.5 h-4 w-4" />
            Manage
          </Button>
        </Link>
      </CardHeader>
    </Card>
  );
};
