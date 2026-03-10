"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { uploadPhoto } from "@/server/photos/actions/upload-photo";
import { deletePhoto } from "@/server/photos/actions/delete-photo";
import { Plus, Trash2, ImageIcon } from "lucide-react";

export const PhotoManagement = ({
  restaurantId,
  photos,
}: {
  restaurantId: string;
  photos: Array<{
    id: string;
    url: string;
    altText: string | null;
    order: number;
  }>;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const formData = new FormData();
    formData.set("file", file);
    formData.set("restaurantId", restaurantId);

    startTransition(async () => {
      const result = await uploadPhoto(formData);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    });
  };

  const handleDelete = (photoId: string) => {
    startTransition(async () => {
      await deletePhoto(photoId);
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photos</CardTitle>
        <CardDescription>Upload photos of your restaurant</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No photos uploaded yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative aspect-video overflow-hidden rounded-lg border">
                <img
                  src={photo.url}
                  alt={photo.altText ?? "Restaurant photo"}
                  className="h-full w-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => handleDelete(photo.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            {isPending ? "Uploading..." : "Upload Photo"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
