"use client";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CUISINE_OPTIONS } from "@/lib/cuisines";
import type { CuisineType } from "@/app/generated/prisma/client";
import { ChevronDown, X } from "lucide-react";

interface CuisineMultiSelectProps {
  selectedCuisines: CuisineType[];
  onToggleCuisine: (value: CuisineType) => void;
}

export const CuisineMultiSelect = ({
  selectedCuisines,
  onToggleCuisine,
}: CuisineMultiSelectProps) => {
  const selectedOptions = CUISINE_OPTIONS.filter((option) =>
    selectedCuisines.includes(option.value),
  );

  return (
    <div className="flex flex-col gap-1.5">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex min-h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          }
        >
          <div className="flex w-full items-center gap-2">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">Select cuisines...</span>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedOptions.map((option) => (
                  <Badge key={option.value} variant="secondary" className="gap-1">
                    {option.label}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleCuisine(option.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          onToggleCuisine(option.value);
                        }
                      }}
                      className="inline-flex rounded-full p-0.5 hover:bg-muted"
                      aria-label={`Remove ${option.label}`}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                ))}
              </div>
            )}
            <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="start" className="w-64">
          {CUISINE_OPTIONS.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selectedCuisines.includes(option.value)}
              onCheckedChange={() => onToggleCuisine(option.value)}
              closeOnClick={false}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
