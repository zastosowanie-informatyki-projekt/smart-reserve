import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
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
    <Link href={`/dashboard/${id}`} className="block">
      <Card className="transition-colors hover:border-primary/40 hover:bg-muted/20">
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            <CardDescription>
              {city}
              {cuisineText ? ` · ${cuisineText}` : ""}
            </CardDescription>
            <p className="mt-2 text-xs font-medium text-muted-foreground">Go to restaurant</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
      </Card>
    </Link>
  );
};
