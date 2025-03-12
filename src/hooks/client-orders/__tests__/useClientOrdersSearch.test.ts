
import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useClientOrdersSearch } from '../useClientOrdersSearch';
import { act } from 'react-dom/test-utils';

describe('useClientOrdersSearch', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useClientOrdersSearch());
    
    expect(result.current.date).toEqual({
      from: expect.any(Date),
      to: expect.any(Date)
    });
    expect(result.current.searchDate).toEqual({
      from: expect.any(Date),
      to: expect.any(Date)
    });
    expect(result.current.searchQuery).toBe('');
    expect(result.current.searchType).toBe('pedido');
    expect(result.current.isSearching).toBe(false);
  });

  it('should initialize with custom date range', () => {
    const { result } = renderHook(() => useClientOrdersSearch());
    
    const customDate = {
      from: new Date(2023, 0, 1),
      to: new Date(2023, 0, 31)
    };
    
    act(() => {
      result.current.setDate(customDate);
    });
    
    expect(result.current.date).toEqual(customDate);
  });

  it('should update date when setDate is called', () => {
    const { result } = renderHook(() => useClientOrdersSearch());
    
    const newDate = {
      from: new Date(2023, 1, 1),
      to: new Date(2023, 1, 28)
    };
    
    act(() => {
      result.current.setDate(newDate);
    });
    
    expect(result.current.date).toEqual(newDate);
  });

  it('should update searchQuery when setSearchQuery is called', () => {
    const { result } = renderHook(() => useClientOrdersSearch());
    
    act(() => {
      result.current.setSearchQuery('test query');
    });
    
    expect(result.current.searchQuery).toBe('test query');
  });

  it('should update searchType when setSearchType is called', () => {
    const { result } = renderHook(() => useClientOrdersSearch());
    
    act(() => {
      result.current.setSearchType('cliente');
    });
    
    expect(result.current.searchType).toBe('cliente');
  });

  it('should update isSearching and searchDate when handleSearch is called', () => {
    const { result } = renderHook(() => useClientOrdersSearch());
    
    const newDate = {
      from: new Date(2023, 1, 1),
      to: new Date(2023, 1, 28)
    };
    
    act(() => {
      result.current.setDate(newDate);
    });
    
    act(() => {
      result.current.handleSearch();
    });
    
    expect(result.current.isSearching).toBe(true);
    expect(result.current.searchDate).toEqual(newDate);
  });
});
