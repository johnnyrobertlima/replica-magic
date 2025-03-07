
import { renderHook } from '@testing-library/react-hooks';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useClientOrders } from '../../useClientOrders';
import { useClientOrdersState } from '../useClientOrdersState';
import { useAllJabOrders, useTotals } from '../../useJabOrders';
import { useSeparacoes } from '../../useSeparacoes';
import { useItemSelection } from '../useItemSelection';
import { useSeparationOperations } from '../useSeparationOperations';

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

describe('useClientOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock return values
    (useClientOrdersState as ReturnType<typeof vi.fn>).mockReturnValue({
      state: {
        date: { from: new Date(), to: new Date() },
        searchDate: { from: new Date(), to: new Date() },
        searchQuery: '',
        searchType: 'pedido',
        isSearching: false,
        expandedClients: new Set(),
        showZeroBalance: false,
        showOnlyWithStock: false,
        selectedItems: [],
        isSending: false
      },
      setState: vi.fn(),
      date: { from: new Date(), to: new Date() },
      searchDate: { from: new Date(), to: new Date() },
      expandedClients: new Set(),
      searchQuery: '',
      searchType: 'pedido',
      isSearching: false,
      showZeroBalance: false,
      showOnlyWithStock: false,
      selectedItems: [],
      isSending: false,
      setDate: vi.fn(),
      setSearchQuery: vi.fn(),
      setSearchType: vi.fn(),
      setShowZeroBalance: vi.fn(),
      setShowOnlyWithStock: vi.fn(),
      toggleExpand: vi.fn(),
      handleSearch: vi.fn()
    });
    
    (useAllJabOrders as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { orders: [], totalCount: 0, itensSeparacao: {} },
      isLoading: false
    });
    
    (useTotals as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { valorTotalSaldo: 0, valorFaturarComEstoque: 0 },
      isLoading: false
    });
    
    (useSeparacoes as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      isLoading: false
    });
    
    (useItemSelection as ReturnType<typeof vi.fn>).mockReturnValue({
      totalSelecionado: 0,
      handleItemSelect: vi.fn(),
      exportSelectedItemsToExcel: vi.fn()
    });
    
    (useSeparationOperations as ReturnType<typeof vi.fn>).mockReturnValue({
      handleEnviarParaSeparacao: vi.fn()
    });
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

  it('should pass searchDate to useAllJabOrders', () => {
    const mockSearchDate = { from: new Date(2023, 0, 1), to: new Date(2023, 0, 31) };
    
    (useClientOrdersState as ReturnType<typeof vi.fn>).mockReturnValue({
      state: {
        date: { from: new Date(), to: new Date() },
        searchDate: mockSearchDate,
        searchQuery: '',
        searchType: 'pedido',
        isSearching: false,
        expandedClients: new Set(),
        showZeroBalance: false,
        showOnlyWithStock: false,
        selectedItems: [],
        isSending: false
      },
      setState: vi.fn(),
      date: { from: new Date(), to: new Date() },
      searchDate: mockSearchDate,
      expandedClients: new Set(),
      searchQuery: '',
      searchType: 'pedido',
      isSearching: false,
      showZeroBalance: false,
      showOnlyWithStock: false,
      selectedItems: [],
      isSending: false,
      setDate: vi.fn(),
      setSearchQuery: vi.fn(),
      setSearchType: vi.fn(),
      setShowZeroBalance: vi.fn(),
      setShowOnlyWithStock: vi.fn(),
      toggleExpand: vi.fn(),
      handleSearch: vi.fn()
    });
    
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
      data: { orders: [], totalCount: 0, itensSeparacao: {} },
      isLoading: false
    });
    
    (useTotals as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { valorTotalSaldo: 0, valorFaturarComEstoque: 0 },
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
