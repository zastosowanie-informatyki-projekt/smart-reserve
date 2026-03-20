import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Globe } from "lucide-react";
import { CUISINE_LABEL } from "@/lib/cuisines";
import type { CuisineType } from "@/app/generated/prisma/client";

export const RestaurantInfo = ({
  name,
  description,
  street,
  buildingNumber,
  city,
  phone,
  email,
  website,
  cuisines,
}: {
  name: string;
  description: string | null;
  street: string;
  buildingNumber: string;
  city: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  cuisines: CuisineType[];
}) => {
  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
            {description && (
              <p className="max-w-3xl text-muted-foreground">{description}</p>
            )}
          </div>
          {cuisines.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {cuisines.map((c) => (
                <Badge key={c} variant="secondary">
                  {CUISINE_LABEL[c]}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>
              {street} {buildingNumber}, {city}
            </span>
          </div>

          {phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0" />
              <span>{phone}</span>
            </div>
          )}
          {email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <span>{email}</span>
            </div>
          )}
          {website && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4 shrink-0" />
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                {website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
