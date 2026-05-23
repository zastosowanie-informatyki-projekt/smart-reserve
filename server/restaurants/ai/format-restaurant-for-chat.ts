const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface OpeningHoursEntry {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface RestaurantForChatInput {
  id: string;
  name: string;
  description: string | null;
  street: string;
  buildingNumber: string;
  city: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  hasDisabledFacilities: boolean;
  openingHours: OpeningHoursEntry[];
}

export interface RestaurantChatResult {
  id: string;
  name: string;
  city: string;
  cuisines: string[];
  wheelchair_accessible: boolean;
  address: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  opening_hours_summary: string;
}

function formatOpeningHoursSummary(hours: OpeningHoursEntry[]): string {
  if (hours.length === 0) return "Not listed";

  return [...hours]
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    .map((entry) => {
      const day = DAY_NAMES[entry.dayOfWeek] ?? `Day ${entry.dayOfWeek}`;
      if (entry.isClosed) return `${day}: closed`;
      return `${day}: ${entry.openTime}–${entry.closeTime}`;
    })
    .join("; ");
}

export function formatRestaurantForChat(
  restaurant: RestaurantForChatInput,
  cuisineLabels: string[],
): RestaurantChatResult {
  return {
    id: restaurant.id,
    name: restaurant.name,
    city: restaurant.city,
    cuisines: cuisineLabels,
    wheelchair_accessible: restaurant.hasDisabledFacilities,
    address: `${restaurant.street} ${restaurant.buildingNumber}, ${restaurant.city}`,
    phone: restaurant.phone,
    email: restaurant.email,
    website: restaurant.website,
    description: restaurant.description,
    opening_hours_summary: formatOpeningHoursSummary(restaurant.openingHours),
  };
}
