import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Globe } from "lucide-react";
import { CUISINE_LABEL } from "@/lib/cuisines";
import type { CuisineType } from "@/app/generated/prisma/client";

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const RestaurantOverviewCard = ({
  name,
  description,
  street,
  buildingNumber,
  city,
  phone,
  email,
  website,
  cuisines,
  openingHours,
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
  openingHours: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
}) => {
  const sortedHours = [...openingHours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight whitespace-nowrap">{name}</h1>
              {cuisines.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {cuisines.map((cuisine) => (
                    <Badge key={cuisine} variant="secondary">
                      {CUISINE_LABEL[cuisine]}
                    </Badge>
                  ))}
                </div>
              )}
              {description && (
                <p className="max-w-3xl text-muted-foreground">{description}</p>
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
          </div>

          <div className="space-y-3">
            <div>
              <h2 className="text-base font-semibold">Opening Hours</h2>
              <p className="text-sm text-muted-foreground">Weekly schedule</p>
            </div>

            {sortedHours.length === 0 ? (
              <p className="text-sm text-muted-foreground">Opening hours not set yet.</p>
            ) : (
              <div className="grid gap-1.5 sm:grid-cols-2">
                {sortedHours.map((entry) => (
                  <div
                    key={entry.dayOfWeek}
                    className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1 text-[11px]"
                  >
                    <span className="text-muted-foreground">{DAY_NAMES[entry.dayOfWeek]}</span>
                    <span>
                      {entry.isClosed
                        ? "Closed"
                        : `${entry.openTime} - ${entry.closeTime}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
