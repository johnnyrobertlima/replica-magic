
import { createContext, useContext, useState, ReactNode } from 'react';
import { subMonths } from 'date-fns';

export interface DashboardFilters {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  brand: string | null;
  status: string | null;
}

interface FiltersContextType {
  filters: DashboardFilters;
  updateDateRange: (startDate: Date, endDate: Date) => void;
  updateBrand: (brand: string | null) => void;
  updateStatus: (status: string | null) => void;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export const FiltersProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: {
      startDate: subMonths(new Date(), 6),
      endDate: new Date(),
    },
    brand: null,
    status: null,
  });

  const updateDateRange = (startDate: Date, endDate: Date) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: { startDate, endDate },
    }));
  };

  const updateBrand = (brand: string | null) => {
    setFilters((prev) => ({
      ...prev,
      brand,
    }));
  };

  const updateStatus = (status: string | null) => {
    setFilters((prev) => ({
      ...prev,
      status,
    }));
  };

  return (
    <FiltersContext.Provider
      value={{
        filters,
        updateDateRange,
        updateBrand,
        updateStatus,
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FiltersContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
};
