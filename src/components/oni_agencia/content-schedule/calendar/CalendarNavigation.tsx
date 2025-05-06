
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarNavigationProps {
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarNavigation({ onPrevMonth, onNextMonth }: CalendarNavigationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b">
      <Button
        variant="outline"
        size="icon"
        onClick={onPrevMonth}
        title="Mês anterior"
        className="h-7 w-7"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onNextMonth}
        title="Próximo mês"
        className="h-7 w-7"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
