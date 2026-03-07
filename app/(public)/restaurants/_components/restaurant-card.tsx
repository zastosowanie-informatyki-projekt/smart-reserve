import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

export const RestaurantCard = ({
  id,
  name,
  description,
  city,
  cuisine,
}: {
  id: string;
  name: string;
  description: string | null;
  city: string;
  cuisine: string | null;
}) => {
  return (
    <Link href={`/restaurants/${id}`}>
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{name}</CardTitle>
            {cuisine && <Badge variant="secondary">{cuisine}</Badge>}
          </div>
          <CardDescription className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {city}
          </CardDescription>
        </CardHeader>
        {description && (
          <CardContent>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {description}
            </p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
};
