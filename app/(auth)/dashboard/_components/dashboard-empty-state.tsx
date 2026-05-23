import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Store } from "lucide-react";

interface DashboardEmptyStateProps {
  isOwner: boolean;
}

export const DashboardEmptyState = ({ isOwner }: DashboardEmptyStateProps) => {
  return (
    <Card className="border-dashed">
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Store className="h-7 w-7 text-muted-foreground" />
        </div>
        <CardTitle>
          {isOwner ? "No restaurants yet" : "No restaurants to manage"}
        </CardTitle>
        <CardDescription className="max-w-md">
          {isOwner
            ? "Add your first restaurant to start managing tables, reservations, and floor plans on TableSpot."
            : "You are not assigned to any restaurant yet. Accept an invitation to get started."}
        </CardDescription>
      </CardHeader>
      {isOwner && (
        <CardContent className="flex justify-center pb-8">
          <Link href="/dashboard/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Restaurant
            </Button>
          </Link>
        </CardContent>
      )}
    </Card>
  );
};
