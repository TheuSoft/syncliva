"use client";

import { Calendar, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  view: "calendar" | "list";
  onViewChange: (view: "calendar" | "list") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center rounded-lg border p-1">
      <Button
        variant={view === "calendar" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("calendar")}
        className={cn(
          "flex items-center gap-2",
          view === "calendar" && "shadow-sm",
        )}
      >
        <Calendar className="h-4 w-4" />
        Calendário
      </Button>
      <Button
        variant={view === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("list")}
        className={cn(
          "flex items-center gap-2",
          view === "list" && "shadow-sm",
        )}
      >
        <List className="h-4 w-4" />
        Lista
      </Button>
    </div>
  );
}
