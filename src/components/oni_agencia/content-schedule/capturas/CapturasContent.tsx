
import React, { useState } from "react";
import { ContentCalendar } from "../../content-schedule/ContentCalendar";
import { ContentScheduleList } from "../../content-schedule/ContentScheduleList";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { CaptureScheduleManager } from "./CaptureScheduleManager";
import { CalendarEvent } from "@/types/oni-agencia";

interface CapturasContentProps {
  viewMode: "calendar" | "list";
  filteredSchedules: CalendarEvent[];
  clientId: string;
  month: number;
  year: number;
  selectedCollaborator: string | null;
  onMonthYearChange: (month: number, year: number) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  showLoadingState?: boolean;
  isCollapsed?: boolean;
  onManualRefetch?: () => void;
  onDialogStateChange?: (isOpen: boolean) => void;
}

export function CapturasContent({
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
  onManualRefetch,
  onDialogStateChange
}: CapturasContentProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleDateSelect = (date: Date) => {
    console.log("Date selected in CapturasContent:", date);
    if (clientId) {
      setSelectedDate(date);
      setIsDialogOpen(true);
      if (onDialogStateChange) onDialogStateChange(true);
    } else {
      console.warn("Cannot open capture dialog: client ID not provided");
    }
  };
  
  const handleDialogClose = () => {
    console.log("Closing capture dialog in CapturasContent");
    setSelectedDate(undefined);
    setIsDialogOpen(false);
    if (onDialogStateChange) onDialogStateChange(false);
  };
  
  return (
    <div className="mt-4">
      {viewMode === "calendar" ? (
        <ContentCalendar
          events={filteredSchedules}
          month={month}
          year={year}
          clientId={clientId}
          onMonthYearChange={onMonthYearChange}
          isCollapsed={isCollapsed}
          onManualRefetch={onManualRefetch}
          useCaptureDate={true}
          selectedCollaborator={selectedCollaborator}
          defaultTab="capture"
          prioritizeCaptureDate={true}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
          isDialogOpen={isDialogOpen}
          onDialogClose={handleDialogClose}
          onDialogOpenChange={setIsDialogOpen}
        />
      ) : (
        <ContentScheduleList
          events={filteredSchedules}
          clientId={clientId}
          selectedCollaborator={selectedCollaborator}
          onManualRefetch={onManualRefetch}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          showLoadingState={showLoadingState}
        />
      )}
      
      {/* Use CaptureScheduleManager para criar/editar capturas */}
      {selectedDate && clientId && (
        <CaptureScheduleManager
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          clientId={clientId}
          selectedDate={selectedDate}
          onCaptureCreated={onManualRefetch}
        />
      )}
    </div>
  );
}
