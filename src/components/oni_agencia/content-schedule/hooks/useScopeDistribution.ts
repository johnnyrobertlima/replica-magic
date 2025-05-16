
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent } from "@/types/oni-agencia";
import { format, startOfMonth, endOfMonth, getDaysInMonth, addDays } from "date-fns";

interface ClientScope {
  id: string;
  client_id: string;
  service_id: string;
  service_name: string;
  quantity: number;
}

interface DistributeParams {
  clientId: string;
  month: number;
  year: number;
  incompleteScopes: ClientScope[];
  existingEvents: CalendarEvent[];
}

interface DistributeResult {
  success: boolean;
  createdCount: number;
  error?: string;
}

// Helper function to get random editorial line
const getRandomEditorialLine = async () => {
  const { data, error } = await supabase
    .from('editorial_lines')
    .select('*');
  
  if (error || !data || data.length === 0) {
    console.error("Error fetching editorial lines:", error);
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex].id;
};

/**
 * Function to distribute client scope items across the calendar month
 */
export async function distributeClientScope(params: DistributeParams): Promise<DistributeResult> {
  const { clientId, month, year, incompleteScopes, existingEvents } = params;
  
  try {
    console.log(`Starting scope distribution for client ${clientId}, month ${month}, year ${year}`);
    
    // Basic validations
    if (!clientId || incompleteScopes.length === 0) {
      return { 
        success: false, 
        createdCount: 0,
        error: "Dados insuficientes para distribuição do escopo" 
      };
    }

    // Calculate the month range
    const monthStartDate = startOfMonth(new Date(year, month - 1));
    const monthEndDate = endOfMonth(monthStartDate);
    const daysInMonth = getDaysInMonth(monthStartDate);
    
    // Get random editorial line to use for distributed events
    const editorialLineId = await getRandomEditorialLine();
    if (!editorialLineId) {
      return {
        success: false,
        createdCount: 0,
        error: "Não foi possível encontrar linhas editoriais"
      };
    }
    
    // Track what days already have events for each service
    const existingEventDays: Record<string, Set<string>> = {};
    
    // Group existing events by date and service
    existingEvents.forEach(event => {
      if (!event.service_id || !event.scheduled_date) return;
      
      if (!existingEventDays[event.service_id]) {
        existingEventDays[event.service_id] = new Set();
      }
      
      existingEventDays[event.service_id].add(event.scheduled_date);
    });
    
    let createdCount = 0;
    
    // Process each incomplete scope item
    for (const scope of incompleteScopes) {
      const existing = existingEvents.filter(ev => ev.service_id === scope.service_id).length;
      const needed = scope.quantity - existing;
      
      if (needed <= 0) continue;
      
      console.log(`Need to create ${needed} events for service ${scope.service_name}`);
      
      // Initialize days set for this service if not already done
      if (!existingEventDays[scope.service_id]) {
        existingEventDays[scope.service_id] = new Set();
      }
      
      // Evenly distribute the events across available days
      const step = Math.max(1, Math.floor(daysInMonth / (needed + 1)));
      
      for (let i = 0; i < needed; i++) {
        // Find an appropriate day to schedule this event
        let dayOffset = (i + 1) * step;
        let targetDate = addDays(monthStartDate, dayOffset - 1);
        
        // If this day already has an event for this service, find the next available day
        let attempts = 0;
        const formattedDate = format(targetDate, 'yyyy-MM-dd');
        
        while (
          existingEventDays[scope.service_id].has(formattedDate) && 
          attempts < daysInMonth
        ) {
          dayOffset = (dayOffset + 1) % daysInMonth || 1; // Wrap around to 1 if we hit 0
          targetDate = addDays(monthStartDate, dayOffset - 1);
          attempts++;
        }
        
        // Create the event
        const { data, error } = await supabase
          .from('oni_agencia_content_schedules')
          .insert({
            client_id: clientId,
            service_id: scope.service_id,
            title: `${scope.service_name} ${i + 1}`,
            scheduled_date: format(targetDate, 'yyyy-MM-dd'),
            editorial_line_id: editorialLineId,
            is_all_day: true
          })
          .select();
          
        if (error) {
          console.error(`Error creating event for service ${scope.service_name}:`, error);
          continue;
        }
        
        // Mark this day as used
        existingEventDays[scope.service_id].add(format(targetDate, 'yyyy-MM-dd'));
        createdCount++;
      }
    }
    
    return {
      success: true,
      createdCount
    };
  } catch (error) {
    console.error("Error in distributeClientScope:", error);
    return {
      success: false,
      createdCount: 0,
      error: "Erro ao distribuir o escopo do cliente"
    };
  }
}
