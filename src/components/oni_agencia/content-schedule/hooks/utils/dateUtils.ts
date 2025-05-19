
import { format, parse } from "date-fns";

/**
 * Converts a string date to a Date object
 * Handles different date formats including ISO strings with time
 */
export const parseStringToDate = (dateString: string): Date | null => {
  if (!dateString) return null;

  try {
    if (dateString.includes('T')) {
      // If ISO format with time, use parse with a different format
      return parse(dateString, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", new Date());
    }
    
    // Parse YYYY-MM-DD format to Date object using parse to avoid timezone issues
    return parse(dateString, 'yyyy-MM-dd', new Date());
  } catch (e) {
    console.error("Error parsing date string:", dateString, e);
    return null;
  }
};

/**
 * Format a Date object to YYYY-MM-DD string
 */
export const formatDateToString = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};
