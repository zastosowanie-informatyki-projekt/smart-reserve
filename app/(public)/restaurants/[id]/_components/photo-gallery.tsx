"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PhotoGallery = ({
  photos,
}: {
  photos: Array<{
    id: string;
    url: string;
    altText: string | null;
  }>;
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className="aspect-video overflow-hidden rounded-lg border transition-opacity hover:opacity-80"
          >
            <img
              src={photo.url}
              alt={photo.altText ?? "Restaurant photo"}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      <Dialog
        open={selectedIndex !== null}
        onOpenChange={(open) => !open && setSelectedIndex(null)}
      >
        <DialogContent className="max-w-3xl p-0">
          {selectedIndex !== null && (
            <div className="relative">
              <img
                src={photos[selectedIndex].url}
                alt={photos[selectedIndex].altText ?? "Restaurant photo"}
                className="w-full rounded-lg object-contain"
              />
              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-background/80"
                    onClick={() =>
                      setSelectedIndex(
                        (selectedIndex - 1 + photos.length) % photos.length,
                      )
                    }
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-background/80"
                    onClick={() =>
                      setSelectedIndex((selectedIndex + 1) % photos.length)
                    }
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
