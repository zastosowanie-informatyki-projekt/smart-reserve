import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export const RestaurantOwnerCard = ({
  id,
  name,
  city,
  cuisine,
}: {
  id: string;
  name: string;
  city: string;
  cuisine: string | null;
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">{name}</CardTitle>
          <CardDescription>
            {city}
            {cuisine ? ` · ${cuisine}` : ""}
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
