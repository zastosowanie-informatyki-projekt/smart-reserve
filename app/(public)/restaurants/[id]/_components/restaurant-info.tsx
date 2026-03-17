import { Badge } from "@/components/ui/badge";
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
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
        {cuisines.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {cuisines.map((c) => (
              <Badge key={c} variant="secondary">
                {CUISINE_LABEL[c]}
              </Badge>
            ))}
          </div>
        )}
      </div>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
      <div className="flex flex-col gap-2 text-sm">
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
  );
};
