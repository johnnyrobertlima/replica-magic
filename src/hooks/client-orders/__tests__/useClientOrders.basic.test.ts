
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

describe('useClientOrders - Basic Properties', () => {
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

  it('should return all required properties and methods', () => {
    const { result } = renderHook(() => useClientOrders());
    
    // Check that all expected properties are returned
    expect(result.current).toHaveProperty('date');
    expect(result.current).toHaveProperty('setDate');
    expect(result.current).toHaveProperty('searchQuery');
    expect(result.current).toHaveProperty('setSearchQuery');
    expect(result.current).toHaveProperty('searchType');
    expect(result.current).toHaveProperty('setSearchType');
    expect(result.current).toHaveProperty('showZeroBalance');
    expect(result.current).toHaveProperty('setShowZeroBalance');
    expect(result.current).toHaveProperty('showOnlyWithStock');
    expect(result.current).toHaveProperty('setShowOnlyWithStock');
    expect(result.current).toHaveProperty('selectedItems');
    expect(result.current).toHaveProperty('expandedClients');
    expect(result.current).toHaveProperty('isSending');
    expect(result.current).toHaveProperty('ordersData');
    expect(result.current).toHaveProperty('totals');
    expect(result.current).toHaveProperty('separacoes');
    expect(result.current).toHaveProperty('filteredGroups');
    expect(result.current).toHaveProperty('totalSelecionado');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('toggleExpand');
    expect(result.current).toHaveProperty('handleSearch');
    expect(result.current).toHaveProperty('handleItemSelect');
    expect(result.current).toHaveProperty('handleEnviarParaSeparacao');
    expect(result.current).toHaveProperty('exportSelectedItemsToExcel');
  });
});
