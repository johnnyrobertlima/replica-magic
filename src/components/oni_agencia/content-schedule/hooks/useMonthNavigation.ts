
import { useState, useEffect, useCallback } from "react";

export function useMonthNavigation(
  initialMonth: number, 
  initialYear: number,
  onMonthYearChange?: (month: number, year: number) => void
) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [currentYear, setCurrentYear] = useState(initialYear);
  const currentDate = new Date(currentYear, currentMonth - 1, 1);

  // Update internal state when props change
  useEffect(() => {
    setCurrentMonth(initialMonth);
    setCurrentYear(initialYear);
  }, [initialMonth, initialYear]);

  const handleNextMonth = useCallback(() => {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    
    if (onMonthYearChange) {
      onMonthYearChange(newMonth, newYear);
    }
  }, [currentMonth, currentYear, onMonthYearChange]);

  const handlePrevMonth = useCallback(() => {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    
    if (onMonthYearChange) {
      onMonthYearChange(newMonth, newYear);
    }
  }, [currentMonth, currentYear, onMonthYearChange]);

  return {
    currentMonth,
    currentYear,
    currentDate,
    handleNextMonth,
    handlePrevMonth
  };
}
