
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useClientOrders } from '../../useClientOrders';
import { useClientOrdersState } from '../useClientOrdersState';
import { useAllJabOrders, useTotals } from '../../useJabOrders';
import { useSeparacoes } from '../../useSeparacoes';
import { useItemSelection } from '../useItemSelection';
import { useSeparationOperations } from '../useSeparationOperations';
import { mockClientOrdersState, mockJabOrdersResponse, mockTotals, mockItemSelection, mockSeparationOperations } from './utils/test-mocks';

// Mock all the dependent hooks
vi.mock('../useClientOrdersState', () => ({
  useClientOrdersState: vi.fn()
}));

vi.mock('../../useJabOrders', () => ({
  useAllJabOrders: vi.fn(),
  useTotals: vi.fn()
}));

vi.mock('../../useSeparacoes', () => ({
  useSeparacoes: vi.fn()
}));

vi.mock('../useItemSelection', () => ({
  useItemSelection: vi.fn()
}));

vi.mock('../useSeparationOperations', () => ({
  useSeparationOperations: vi.fn()
}));

vi.mock('@/utils/clientOrdersUtils', () => ({
  groupOrdersByClient: vi.fn(data => ({})),
  filterGroupsBySearchCriteria: vi.fn((groups, isSearching, query, type) => ({}))
}));

describe('useClientOrders - Data Fetching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock return values
    (useClientOrdersState as ReturnType<typeof vi.fn>).mockReturnValue(mockClientOrdersState());
    
    (useAllJabOrders as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockJabOrdersResponse,
      isLoading: false
    });
    
    (useTotals as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockTotals,
      isLoading: false
    });
    
    (useSeparacoes as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      isLoading: false
    });
    
    (useItemSelection as ReturnType<typeof vi.fn>).mockReturnValue(mockItemSelection);
    
    (useSeparationOperations as ReturnType<typeof vi.fn>).mockReturnValue(mockSeparationOperations);
  });

  it('should pass searchDate to useAllJabOrders', () => {
    const mockSearchDate = { from: new Date(2023, 0, 1), to: new Date(2023, 0, 31) };
    
    const mockState = mockClientOrdersState();
    mockState.searchDate = mockSearchDate;
    
    (useClientOrdersState as ReturnType<typeof vi.fn>).mockReturnValue(mockState);
    
    renderHook(() => useClientOrders());
    
    expect(useAllJabOrders).toHaveBeenCalledWith({
      dateRange: mockSearchDate
    });
  });

  it('should handle loading states correctly', () => {
    (useAllJabOrders as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true
    });
    
    const { result } = renderHook(() => useClientOrders());
    
    expect(result.current.isLoading).toBe(true);
  });

  it('should combine loading states from all data fetching hooks', () => {
    (useAllJabOrders as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockJabOrdersResponse,
      isLoading: false
    });
    
    (useTotals as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockTotals,
      isLoading: true
    });
    
    (useSeparacoes as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      isLoading: false
    });
    
    const { result } = renderHook(() => useClientOrders());
    
    expect(result.current.isLoading).toBe(true);
  });
});
