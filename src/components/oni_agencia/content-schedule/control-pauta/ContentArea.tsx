
import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarEvent } from "@/types/oni-agencia";

// Lazy load components for better initial loading
const ContentCalendar = lazy(() => 
  import("@/components/oni_agencia/content-schedule/ContentCalendar").then(
    module => ({ default: module.ContentCalendar })
  )
);

const OptimizedContentScheduleList = lazy(() => 
  import("@/components/oni_agencia/content-schedule/OptimizedContentScheduleList").then(
    module => ({ default: module.OptimizedContentScheduleList })
  )
);

// Fallback component for Suspense
const LoadingFallback = () => (
  <div className="w-full h-[calc(100vh-250px)] bg-white rounded-md border shadow-sm p-4">
    <Skeleton className="w-full h-full rounded-md" />
  </div>
);

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
  isCollapsed
}: ContentAreaProps) {
  return (
    <div className={`w-full overflow-x-auto ${isCollapsed ? 'h-[calc(100vh-150px)]' : 'h-[calc(100vh-250px)]'} transition-all duration-300`}>
      {showLoadingState ? (
        <LoadingFallback />
      ) : (
        <Suspense fallback={<LoadingFallback />}>
          {viewMode === "calendar" ? (
            <ContentCalendar
              events={filteredSchedules}
              clientId={clientId || "all"} 
              month={month}
              year={year}
              onMonthChange={onMonthYearChange}
              selectedCollaborator={selectedCollaborator}
            />
          ) : (
            <OptimizedContentScheduleList
              events={filteredSchedules}
              clientId={clientId || "all"}
              selectedCollaborator={selectedCollaborator}
              hasNextPage={!!hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
            />
          )}
        </Suspense>
      )}
    </div>
  );
}
