import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateRestaurantForm } from "./_components/create-restaurant-form";

export const metadata = {
  title: "Create Restaurant | TableSpot",
};

export default async function CreateRestaurantPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Restaurant</CardTitle>
          <CardDescription>
            Fill in the details below to list your restaurant on TableSpot.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateRestaurantForm />
        </CardContent>
      </Card>
    </div>
  );
}
