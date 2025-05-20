
import { format } from 'date-fns';

/**
 * Formats a Date object as YYYY-MM-DD string
 */
export function formatDateToString(date: Date): string {
  try {
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date:', error);
    return format(new Date(), 'yyyy-MM-dd'); // Fallback to current date
  }
}

/**
 * Safely parses a date string to Date object
 */
export function parseDateString(dateString: string): Date | null {
  try {
    if (!dateString) return null;
    return new Date(dateString);
  } catch (error) {
    console.error('Error parsing date string:', error);
    return null;
  }
}
