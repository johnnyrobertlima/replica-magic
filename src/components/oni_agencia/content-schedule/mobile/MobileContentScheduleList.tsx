
import React, { useState, useCallback } from 'react';
import { CalendarEvent } from "@/types/oni-agencia";
import { MobileEventList } from "./MobileEventList";
import { MobileContentLoading } from './MobileContentLoading';
import { useFilteredEvents } from './hooks/useFilteredEvents';
import { useIntersectionObserver } from './hooks/useIntersectionObserver';
import { LoadMoreIndicator } from './components/LoadMoreIndicator';
import { EmptyEventsList } from './components/EmptyEventsList';
import { EndOfListMessage } from './components/EndOfListMessage';
import { EventDialogHandler } from './components/EventDialogHandler';

interface MobileContentScheduleListProps {
  events: CalendarEvent[];
  clientId: string;
  selectedCollaborator?: string | null;
  isLoading: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export function MobileContentScheduleList({ 
  events, 
  clientId, 
  selectedCollaborator,
  isLoading,
  hasMore = false,
  onLoadMore,
  isLoadingMore = false
}: MobileContentScheduleListProps) {
  // Filter events based on collaborator and status
  const filteredEvents = useFilteredEvents(events, selectedCollaborator);
  
  // State for dialog and event selection
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Set up intersection observer for lazy loading
  const loadMoreRef = useIntersectionObserver({
    hasMore,
    onLoadMore,
    isLoadingMore: isLoadingMore || false
  });
  
  // Event handlers
  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(new Date(event.scheduled_date));
    setIsDialogOpen(true);
  }, []);
  
  const handleDialogClose = useCallback(() => {
    setSelectedEvent(undefined);
    setSelectedDate(undefined);
    setIsDialogOpen(false);
  }, []);
  
  // Render loading state if needed
  if (isLoading && (!events || events.length === 0)) {
    return <MobileContentLoading />;
  }

  // Render empty state if no events
  if (!isLoading && (!events || events.length === 0)) {
    return <EmptyEventsList onLoadMore={onLoadMore} />;
  }
  
  return (
    <div className="overflow-auto h-full bg-white shadow-sm rounded-md border p-2">
      <MobileEventList 
        events={filteredEvents}
        clientId={clientId}
        onEventClick={handleEventClick}
      />
      
      {/* Lazy loading component */}
      <LoadMoreIndicator
        hasMore={hasMore}
        isLoadingMore={isLoadingMore || false}
        onLoadMore={onLoadMore}
        loadMoreRef={loadMoreRef}
      />
      
      {/* End of list message */}
      <EndOfListMessage 
        show={filteredEvents.length > 0 && !hasMore && !isLoading} 
      />
      
      {/* Dialog for viewing/editing events */}
      <EventDialogHandler
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        clientId={clientId}
        selectedDate={selectedDate}
        filteredEvents={filteredEvents}
        selectedEvent={selectedEvent}
        onClose={handleDialogClose}
      />
    </div>
  );
}
