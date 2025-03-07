
import { useState, useCallback } from 'react';
import { MonthSelection } from './types';

export const useMonthSelection = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  // Handle month selection
  const handleMonthSelect = useCallback((year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  }, []);

  return {
    selectedYear,
    selectedMonth,
    handleMonthSelect
  };
};
