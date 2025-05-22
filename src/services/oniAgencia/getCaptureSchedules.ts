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
    const startDate = firstDay.toISOString();
    const endDate = lastDay.toISOString();

    // Start with the base query
    let query = getBaseQuery();
    
    // Add filters first - very important for the TypeScript typing
    if (clientId) {
      query = query.eq("client_id", clientId);
    }
    
    // Add date filters
    query = query.gte("scheduled_date", startDate.split("T")[0]);
    query = query.lte("scheduled_date", endDate.split("T")[0]);
    
    // Filter by collaborator if specified (must be before select to keep proper typing)
    if (collaboratorId) {
      query = query.or(`collaborator_id.eq.${collaboratorId},creators.cs.{${collaboratorId}}`);
    }
    
    // Now add the select statement (after all filters)
    query = query.select(`
      *,
      status(*),
      capture:oniagencia_capturas!left(
        id,
        is_all_day, 
        capture_date,
        capture_end_date,
        location
      )
    `);
    
    // Add ordering last
    query = query.order("scheduled_date", { ascending: true });
    
    // Execute the query
    const { data, error } = await query;

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
    const startDate = firstDay.toISOString();
    const endDate = lastDay.toISOString();

    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Start with the base query
    let query = getBaseQuery();
    
    // Apply filters first - critical for TypeScript typing
    if (clientId) {
      query = query.eq("client_id", clientId);
    }
    
    // Add date filters
    query = query.gte("scheduled_date", startDate.split("T")[0]);
    query = query.lte("scheduled_date", endDate.split("T")[0]);
    
    // Filter by collaborator if specified (must be before select to keep proper typing)
    if (collaboratorId) {
      query = query.or(`collaborator_id.eq.${collaboratorId},creators.cs.{${collaboratorId}}`);
    }
    
    // Now add the select statement (after all filters)
    query = query.select(`
      *,
      status(*),
      capture:oniagencia_capturas!left(
        id,
        is_all_day, 
        capture_date,
        capture_end_date,
        location
      )
    `);
    
    // Add ordering and pagination last
    query = query.order("scheduled_date", { ascending: true });
    query = query.range(from, to);
    
    // Execute the query
    const { data, error, count } = await query;

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
