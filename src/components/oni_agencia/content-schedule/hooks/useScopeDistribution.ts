
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
    
    // Track occupied days for even distribution
    const daysWithEvents: Record<string, number> = {};
    
    // Initialize days count for tracking distribution density
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const formattedDate = format(date, 'yyyy-MM-dd');
      daysWithEvents[formattedDate] = 0;
    }
    
    // Pre-populate days with existing events to avoid too many events on the same day
    existingEvents.forEach(event => {
      if (event.scheduled_date) {
        if (daysWithEvents[event.scheduled_date] !== undefined) {
          daysWithEvents[event.scheduled_date]++;
        }
      }
    });
    
    let createdCount = 0;
    
    // Process each incomplete scope item
    for (const scope of incompleteScopes) {
      const existing = existingEvents.filter(ev => ev.service_id === scope.service_id).length;
      const needed = scope.quantity - existing;
      
      if (needed <= 0) continue;
      
      console.log(`Need to create ${needed} events for service ${scope.service_name}`);
      
      // If we need more events than days in month, we'll need to distribute multiple per day
      const eventsPerDay = Math.ceil(needed / daysInMonth);
      
      // Create needed events
      for (let i = 0; i < needed; i++) {
        // Find the day with the least events currently scheduled
        let leastBusyDate = '';
        let minEvents = Number.MAX_SAFE_INTEGER;
        
        // Find the day with the fewest events
        Object.entries(daysWithEvents).forEach(([date, count]) => {
          if (count < minEvents) {
            minEvents = count;
            leastBusyDate = date;
          }
        });
        
        // If all days are equally busy or this is weird, use a randomized approach
        if (leastBusyDate === '' || minEvents === Number.MAX_SAFE_INTEGER) {
          const randomDayOffset = Math.floor(Math.random() * daysInMonth) + 1;
          const randomDate = new Date(year, month - 1, randomDayOffset);
          leastBusyDate = format(randomDate, 'yyyy-MM-dd');
        }
        
        // Create the event on the least busy day
        const { data, error } = await supabase
          .from('oni_agencia_content_schedules')
          .insert({
            client_id: clientId,
            service_id: scope.service_id,
            title: `${scope.service_name} ${i + 1}`,
            scheduled_date: leastBusyDate,
            editorial_line_id: editorialLineId,
            is_all_day: true
          })
          .select();
          
        if (error) {
          console.error(`Error creating event for service ${scope.service_name}:`, error);
          continue;
        }
        
        // Increment the count for this date since we added an event
        daysWithEvents[leastBusyDate]++;
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
