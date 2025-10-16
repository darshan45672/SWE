"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const PRESET_COLORS = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Purple", value: "#A855F7" },
  { name: "Pink", value: "#EC4899" },
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Green", value: "#22C55E" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Fuchsia", value: "#D946EF" },
  { name: "Rose", value: "#F43F5E" },
  { name: "Emerald", value: "#10B981" },
  { name: "Lime", value: "#84CC16" },
  { name: "Amber", value: "#F59E0B" },
];

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
  const [open, setOpen] = React.useState(false);
  const selectedColor = value || "#3B82F6";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-start gap-2"
          disabled={disabled}
        >
          <div
            className="h-4 w-4 rounded-full border"
            style={{ backgroundColor: selectedColor }}
          />
          <span className="flex-1 text-left">
            {PRESET_COLORS.find((c) => c.value === selectedColor)?.name || "Custom"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-3" align="start">
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">
            Select a color
          </div>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => {
                  onChange(color.value);
                  setOpen(false);
                }}
                className={cn(
                  "group relative flex h-12 w-full items-center justify-center rounded-md border-2 transition-all hover:scale-105",
                  selectedColor === color.value
                    ? "border-primary shadow-sm"
                    : "border-transparent hover:border-muted-foreground/20"
                )}
                title={color.name}
              >
                <div
                  className="h-8 w-8 rounded-sm"
                  style={{ backgroundColor: color.value }}
                />
                {selectedColor === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white drop-shadow-lg" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="border-t pt-3">
            <label className="text-sm font-medium text-muted-foreground">
              Custom color
            </label>
            <div className="mt-2 flex gap-2">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => onChange(e.target.value)}
                className="h-10 w-full cursor-pointer rounded-md border bg-background"
                disabled={disabled}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                className="px-3"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
