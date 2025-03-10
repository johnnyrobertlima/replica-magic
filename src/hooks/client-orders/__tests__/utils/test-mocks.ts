
import { vi } from 'vitest';

// Common mock implementations
export const mockClientOrdersState = () => ({
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

export const mockJabOrdersResponse = {
  orders: [],
  totalCount: 0,
  itensSeparacao: {}
};

export const mockTotals = {
  valorTotalSaldo: 0,
  valorFaturarComEstoque: 0
};

export const mockItemSelection = {
  totalSelecionado: 0,
  handleItemSelect: vi.fn(),
  exportSelectedItemsToExcel: vi.fn()
};

export const mockSeparationOperations = {
  handleEnviarParaSeparacao: vi.fn()
};
