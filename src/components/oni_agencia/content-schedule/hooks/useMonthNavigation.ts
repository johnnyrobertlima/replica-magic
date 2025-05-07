
import { useCallback } from "react";

export function useMonthNavigation(
  month: number,
  year: number,
  onMonthChange: (month: number, year: number) => void
) {
  const handlePrevMonth = useCallback(() => {
    let newMonth = month - 1;
    let newYear = year;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    
    onMonthChange(newMonth, newYear);
  }, [month, year, onMonthChange]);
  
  const handleNextMonth = useCallback(() => {
    let newMonth = month + 1;
    let newYear = year;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    
    onMonthChange(newMonth, newYear);
  }, [month, year, onMonthChange]);
  
  return {
    handlePrevMonth,
    handleNextMonth
  };
}
