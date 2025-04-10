
import { useMemo } from "react";
import { CalendarEvent } from "@/types/oni-agencia";

export function useServiceCounts(events: CalendarEvent[]) {
  const serviceCounts = useMemo(() => {
    const counts: Record<string, { count: number; name: string; color: string }> = {};
    
    events.forEach(event => {
      if (event.service) {
        const { id, name, color } = event.service;
        
        if (!counts[id]) {
          counts[id] = { count: 0, name, color };
        }
        
        counts[id].count++;
      }
    });
    
    // Filter out services with zero count and sort by count (descending)
    return Object.values(counts)
      .filter(service => service.count > 0)
      .sort((a, b) => b.count - a.count);
      
  }, [events]);
  
  return serviceCounts;
}
