import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export const TableList = ({
  tables,
  selectedTableId,
  onSelect,
}: {
  tables: Array<{
    id: string;
    label: string;
    capacity: number;
    description: string | null;
  }>;
  selectedTableId: string | null;
  onSelect: (id: string) => void;
}) => {
  if (tables.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No tables available at this restaurant.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {tables.map((table) => (
        <Card
          key={table.id}
          className={`cursor-pointer transition-colors ${
            selectedTableId === table.id
              ? "border-primary bg-primary/5"
              : "hover:border-primary/50"
          }`}
          onClick={() => onSelect(table.id)}
        >
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{table.label}</p>
              {table.description && (
                <p className="text-xs text-muted-foreground">
                  {table.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{table.capacity}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
