
export function useMonthNavigation(
  month: number, 
  year: number, 
  onMonthChange: (month: number, year: number) => void
) {
  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(12, year - 1);
    } else {
      onMonthChange(month - 1, year);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(1, year + 1);
    } else {
      onMonthChange(month + 1, year);
    }
  };
  
  return {
    handlePrevMonth,
    handleNextMonth
  };
}
