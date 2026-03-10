"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateRestaurant } from "@/server/restaurants/actions/update-restaurant";
import { deleteRestaurant } from "@/server/restaurants/actions/delete-restaurant";
import { Trash2 } from "lucide-react";

export const EditRestaurantForm = ({
  restaurant,
}: {
  restaurant: {
    id: string;
    name: string;
    description: string | null;
    address: string;
    city: string;
    phone: string | null;
    email: string | null;
    website: string | null;
    cuisine: string | null;
  };
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("id", restaurant.id);

    startTransition(async () => {
      const result = await updateRestaurant(formData);
      if (!result.success) {
        setError(result.error);
      }
    });
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteRestaurant(restaurant.id);
      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error);
        setDeleteOpen(false);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Restaurant Details</CardTitle>
            <CardDescription>Update your restaurant information</CardDescription>
          </div>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger
              render={<Button variant="destructive" size="sm" />}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Restaurant</DialogTitle>
                <DialogDescription>
                  This will permanently delete {restaurant.name} and all its
                  tables, reservations, and opening hours. This action cannot be
                  undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Restaurant"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                name="name"
                defaultValue={restaurant.name}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-cuisine">Cuisine</Label>
              <Input
                id="edit-cuisine"
                name="cuisine"
                defaultValue={restaurant.cuisine ?? ""}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              name="description"
              defaultValue={restaurant.description ?? ""}
              rows={3}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                name="address"
                defaultValue={restaurant.address}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-city">City</Label>
              <Input
                id="edit-city"
                name="city"
                defaultValue={restaurant.city}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                name="phone"
                defaultValue={restaurant.phone ?? ""}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="email"
                defaultValue={restaurant.email ?? ""}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-website">Website</Label>
            <Input
              id="edit-website"
              name="website"
              type="url"
              defaultValue={restaurant.website ?? ""}
              placeholder="https://myrestaurant.com"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isPending} className="w-fit">
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
