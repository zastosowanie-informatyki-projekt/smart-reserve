import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail } from "lucide-react";

export const RestaurantInfo = ({
  name,
  description,
  address,
  city,
  phone,
  email,
  cuisine,
}: {
  name: string;
  description: string | null;
  address: string;
  city: string;
  phone: string | null;
  email: string | null;
  cuisine: string | null;
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
        {cuisine && <Badge variant="secondary">{cuisine}</Badge>}
      </div>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>
            {address}, {city}
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
      </div>
    </div>
  );
};
