
import React from 'react';
import { ContentCalendar } from "../ContentCalendar";
import { ContentScheduleList } from "../ContentScheduleList";
import { CalendarEvent } from "@/types/oni-agencia";
import { OptimizedContentScheduleList } from "../OptimizedContentScheduleList";

interface ContentAreaProps {
  viewMode: "calendar" | "list";
  filteredSchedules: CalendarEvent[];
  clientId: string;
  month: number;
  year: number;
  selectedCollaborator: string | null;
  onMonthYearChange: (month: number, year: number) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  showLoadingState: boolean;
  isCollapsed: boolean;
  onManualRefetch?: () => void;
}

export function ContentArea({
  viewMode,
  filteredSchedules,
  clientId,
  month,
  year,
  selectedCollaborator,
  onMonthYearChange,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  showLoadingState,
  isCollapsed,
  onManualRefetch
}: ContentAreaProps) {
  console.log(`ContentArea received ${filteredSchedules.length} events, showLoadingState=${showLoadingState}`);

  const heightClass = isCollapsed ? "h-[calc(100vh-16rem)]" : "h-[calc(100vh-19.5rem)]";

  return (
    <div className={`w-full pt-4 ${heightClass} overflow-hidden`}>
      {viewMode === "calendar" ? (
        <ContentCalendar
          events={filteredSchedules}
          clientId={clientId}
          month={month}
          year={year}
          onMonthChange={onMonthYearChange}
          selectedCollaborator={selectedCollaborator}
          onManualRefetch={onManualRefetch}
        />
      ) : (
        <ContentScheduleList
          events={filteredSchedules}
          clientId={clientId}
          selectedCollaborator={selectedCollaborator}
          onManualRefetch={onManualRefetch}
        />
      )}
    </div>
  );
}
