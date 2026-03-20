import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const OpeningHoursDisplay = ({
  hours,
}: {
  hours: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
}) => {
  if (hours.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Opening Hours</CardTitle>
          <CardDescription>Opening hours not set yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const sortedHours = [...hours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Opening Hours</CardTitle>
        <CardDescription>Plan your visit around the weekly schedule.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-1.5">
          {sortedHours.map((entry) => (
            <div
              key={entry.dayOfWeek}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span className="text-muted-foreground">
                {DAY_NAMES[entry.dayOfWeek]}
              </span>
              <span>
                {entry.isClosed
                  ? "Closed"
                  : `${entry.openTime} - ${entry.closeTime}`}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
