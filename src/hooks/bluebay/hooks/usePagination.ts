
import { useState, useCallback, useMemo } from "react";

export interface PaginationState {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToPage: (page: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  updateTotalCount: (count: number) => void;
  totalPages: number; // Added property
}

export const usePagination = (initialPageSize: number = 1000): PaginationState => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(initialPageSize);

  const goToNextPage = useCallback(() => {
    if (currentPage * pageSize < totalCount) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, pageSize, totalCount]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const goToPage = useCallback((page: number) => {
    if (page > 0 && (page * pageSize <= totalCount || totalCount === 0)) {
      setCurrentPage(page);
    }
  }, [pageSize, totalCount]);

  const updateTotalCount = useCallback((count: number) => {
    setTotalCount(count);
  }, []);

  // Calculate totalPages
  const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);

  return {
    currentPage,
    totalCount,
    pageSize,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    hasNextPage: currentPage * pageSize < totalCount,
    hasPreviousPage: currentPage > 1,
    updateTotalCount,
    totalPages // Return the calculated totalPages
  };
};
