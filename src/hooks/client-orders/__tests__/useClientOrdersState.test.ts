
import { renderHook, act } from '@testing-library/react-hooks';
import { describe, it, expect, vi } from 'vitest';
import { useClientOrdersState } from '../useClientOrdersState';

// Mock the useClientOrdersSearch hook
vi.mock('../useClientOrdersSearch', () => ({
  useClientOrdersSearch: () => ({
    date: { from: new Date(), to: new Date() },
    searchDate: { from: new Date(), to: new Date() },
    searchQuery: '',
    searchType: 'pedido',
    isSearching: false,
    setDate: vi.fn(),
    setSearchQuery: vi.fn(),
    setSearchType: vi.fn(),
    handleSearch: vi.fn()
  })
}));

describe('useClientOrdersState', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useClientOrdersState());
    
    expect(result.current.expandedClients).toBeInstanceOf(Set);
    expect(result.current.expandedClients.size).toBe(0);
    expect(result.current.showZeroBalance).toBe(false);
    expect(result.current.showOnlyWithStock).toBe(false);
    expect(result.current.selectedItems).toEqual([]);
    expect(result.current.isSending).toBe(false);
  });

  it('should toggle client expansion when toggleExpand is called', () => {
    const { result } = renderHook(() => useClientOrdersState());
    
    act(() => {
      result.current.toggleExpand('client1');
    });
    
    expect(result.current.expandedClients.has('client1')).toBe(true);
    
    act(() => {
      result.current.toggleExpand('client1');
    });
    
    expect(result.current.expandedClients.has('client1')).toBe(false);
  });

  it('should update showZeroBalance when setShowZeroBalance is called', () => {
    const { result } = renderHook(() => useClientOrdersState());
    
    act(() => {
      result.current.setShowZeroBalance(true);
    });
    
    expect(result.current.showZeroBalance).toBe(true);
  });

  it('should update showOnlyWithStock when setShowOnlyWithStock is called', () => {
    const { result } = renderHook(() => useClientOrdersState());
    
    act(() => {
      result.current.setShowOnlyWithStock(true);
    });
    
    expect(result.current.showOnlyWithStock).toBe(true);
  });

  it('should update state via the setState function with function updater', () => {
    const { result } = renderHook(() => useClientOrdersState());
    
    act(() => {
      result.current.setState(prev => ({
        ...prev,
        showZeroBalance: true,
        showOnlyWithStock: true,
        selectedItems: ['item1'],
        expandedClients: new Set(['client1']),
        isSending: true,
        selectedItemsDetails: { item1: { qtde: 1, valor: 100 } }
      }));
    });
    
    expect(result.current.showZeroBalance).toBe(true);
    expect(result.current.showOnlyWithStock).toBe(true);
    expect(result.current.selectedItems).toEqual(['item1']);
    expect(result.current.expandedClients.has('client1')).toBe(true);
    expect(result.current.isSending).toBe(true);
  });

  it('should update state via the setState function with object updater', () => {
    const { result } = renderHook(() => useClientOrdersState());
    
    act(() => {
      result.current.setState({
        date: { from: new Date(), to: new Date() },
        searchDate: { from: new Date(), to: new Date() },
        searchQuery: 'test',
        searchType: 'cliente',
        isSearching: true,
        showZeroBalance: true,
        showOnlyWithStock: true,
        selectedItems: ['item2'],
        expandedClients: new Set(['client2']),
        isSending: true,
        selectedItemsDetails: { item2: { qtde: 2, valor: 200 } }
      });
    });
    
    expect(result.current.showZeroBalance).toBe(true);
    expect(result.current.showOnlyWithStock).toBe(true);
    expect(result.current.selectedItems).toEqual(['item2']);
    expect(result.current.expandedClients.has('client2')).toBe(true);
    expect(result.current.isSending).toBe(true);
  });
});
