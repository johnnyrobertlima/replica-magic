
import { supabase } from "@/integrations/supabase/client";
import { getBaseQuery, TABLE_NAME } from "./baseQuery";
import { CalendarEvent } from "@/types/oni-agencia";

export const getCaptureSchedules = async (
  clientId: string | null,
  year: number,
  month: number,
  collaboratorId: string | null = null
): Promise<CalendarEvent[]> => {
  try {
    // Calculate first and last day of the month
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    // Format dates as ISO strings for Postgres
    const startDate = firstDay.toISOString().split("T")[0];
    const endDate = lastDay.toISOString().split("T")[0];

    // Build the query step by step using proper method chaining
    let query = supabase.from(TABLE_NAME).select(`
      *,
      service:service_id(*),
      collaborator:collaborator_id(*),
      editorial_line:editorial_line_id(*),
      product:product_id(*),
      status:status_id(*),
      client:client_id(*),
      capture:oniagencia_capturas(
        id,
        is_all_day,
        capture_date,
        capture_end_date,
        location
      )
    `);
    
    // Add status filter
    query = query.eq('status_id', 'f0593677-1afb-486d-80a8-a24cb6fb7071');
    
    // Apply client filter if provided
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    // Add date range filters
    query = query.gte('scheduled_date', startDate);
    query = query.lte('scheduled_date', endDate);
    
    // Add collaborator filter if specified
    if (collaboratorId) {
      query = query.or(`collaborator_id.eq.${collaboratorId},creators.cs.{${collaboratorId}}`);
    }
    
    // Execute the query and order results
    const { data, error } = await query.order("scheduled_date", { ascending: true });
    
    if (error) {
      throw error;
    }

    // Type assertion to help TypeScript understand the structure
    const typedData = data as any[];

    // Transform the data to include capture_date directly in the event object
    const transformedData = typedData.map(item => {
      // If there's a capture object, extract its properties
      if (item.capture && item.capture.length > 0) {
        const capture = item.capture[0];
        return {
          ...item,
          capture_date: capture?.capture_date || null,
          capture_end_date: capture?.capture_end_date || null,
          is_all_day: capture?.is_all_day || false,
          location: capture?.location || null,
          capture_id: capture?.id || null
        } as CalendarEvent;
      }
      return {
        ...item,
        capture_date: null,
        capture_end_date: null,
        is_all_day: false,
        location: null,
        capture_id: null
      } as CalendarEvent;
    });

    // Only include events with a capture_date AND status "Liberado para Captura"
    return transformedData.filter(event => 
      event.capture_date && 
      event.status?.name === "Liberado para Captura"
    );
  } catch (error) {
    console.error("Error fetching capture schedules:", error);
    throw error;
  }
};

// Function to get paginated capture schedules
export const getCaptureSchedulesPaginated = async (
  clientId: string | null,
  year: number,
  month: number,
  collaboratorId: string | null = null,
  page = 1,
  pageSize = 30
) => {
  try {
    // Calculate first and last day of the month
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    // Format dates as ISO strings for Postgres
    const startDate = firstDay.toISOString().split("T")[0];
    const endDate = lastDay.toISOString().split("T")[0];

    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Build the query step by step using proper method chaining
    let query = supabase.from(TABLE_NAME).select(`
      *,
      service:service_id(*),
      collaborator:collaborator_id(*),
      editorial_line:editorial_line_id(*),
      product:product_id(*),
      status:status_id(*),
      client:client_id(*),
      capture:oniagencia_capturas(
        id,
        is_all_day,
        capture_date,
        capture_end_date,
        location
      )
    `, { count: 'exact' });
    
    // Add status filter
    query = query.eq('status_id', 'f0593677-1afb-486d-80a8-a24cb6fb7071');
    
    // Apply client filter if provided
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    // Add date range filters
    query = query.gte('scheduled_date', startDate);
    query = query.lte('scheduled_date', endDate);
    
    // Add collaborator filter if specified
    if (collaboratorId) {
      query = query.or(`collaborator_id.eq.${collaboratorId},creators.cs.{${collaboratorId}}`);
    }
    
    // Execute the query with pagination and ordering
    const { data, error, count } = await query
      .order("scheduled_date", { ascending: true })
      .range(from, to);
    
    if (error) {
      throw error;
    }

    // Type assertion to help TypeScript understand the structure
    const typedData = data as any[];

    // Transform the data to include capture_date directly in the event object
    const transformedData = typedData.map(item => {
      // If there's a capture object, extract its properties
      if (item.capture && item.capture.length > 0) {
        const capture = item.capture[0];
        return {
          ...item,
          capture_date: capture?.capture_date || null,
          capture_end_date: capture?.capture_end_date || null,
          is_all_day: capture?.is_all_day || false,
          location: capture?.location || null,
          capture_id: capture?.id || null
        } as CalendarEvent;
      }
      return {
        ...item,
        capture_date: null,
        capture_end_date: null,
        is_all_day: false,
        location: null,
        capture_id: null
      } as CalendarEvent;
    });

    // Only include events with a capture_date AND status "Liberado para Captura"
    const filteredData = transformedData.filter(event => 
      event.capture_date && 
      event.status?.name === "Liberado para Captura"
    );

    return {
      data: filteredData,
      count,
      page,
      pageSize,
      hasMore: from + pageSize < (count || 0)
    };
  } catch (error) {
    console.error("Error fetching paginated capture schedules:", error);
    throw error;
  }
};
