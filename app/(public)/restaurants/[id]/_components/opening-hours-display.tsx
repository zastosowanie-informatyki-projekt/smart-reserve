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
      <p className="text-sm text-muted-foreground">
        Opening hours not set yet.
      </p>
    );
  }

  const sortedHours = [...hours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-sm font-medium">Opening Hours</h3>
      <div className="grid gap-1">
        {sortedHours.map((entry) => (
          <div
            key={entry.dayOfWeek}
            className="flex justify-between text-sm"
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
    </div>
  );
};
