
import React from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { EventDateSection } from "./components/EventDateSection";
import { EventsEmptyState } from "./components/EventsEmptyState";

interface MobileEventListProps {
  events: CalendarEvent[];
  clientId: string;
  onEventClick?: (event: CalendarEvent) => void;
}

export function MobileEventList({ 
  events, 
  clientId,
  onEventClick 
}: MobileEventListProps) {
  // If no events, show empty state
  if (!events || events.length === 0) {
    return <EventsEmptyState />;
  }

  // Group events by date
  const groupedEvents = events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const dateKey = event.scheduled_date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedEvents).sort();

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  return (
    <div className="space-y-4">
      {sortedDates.map((dateString) => (
        <EventDateSection
          key={dateString}
          dateString={dateString}
          events={groupedEvents[dateString]}
          onEventClick={handleEventClick}
        />
      ))}
    </div>
  );
}
