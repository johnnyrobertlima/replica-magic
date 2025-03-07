
import { renderHook, act } from '@testing-library/react-hooks';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSeparationOperations } from '../useSeparationOperations';
import { sendOrdersForSeparation } from '@/services/clientSeparationService';

// Mock the services and React Query
vi.mock('@/services/clientSeparationService', () => ({
  sendOrdersForSeparation: vi.fn()
}));

const mockInvalidateQueries = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries
  })
}));

describe('useSeparationOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call sendOrdersForSeparation with correct parameters', async () => {
    const state = {
      selectedItems: ['item1', 'item2']
    } as any;
    
    const setState = vi.fn();
    const groupedOrders = {
      client1: {
        allItems: [
          { ITEM_CODIGO: 'item1', pedido: 'pedido1' },
          { ITEM_CODIGO: 'item2', pedido: 'pedido1' }
        ]
      }
    };
    
    (sendOrdersForSeparation as jest.Mock).mockResolvedValue({ success: true });
    
    const { result } = renderHook(() => 
      useSeparationOperations(state, setState, groupedOrders)
    );
    
    await act(async () => {
      await result.current.handleEnviarParaSeparacao();
    });
    
    expect(sendOrdersForSeparation).toHaveBeenCalledWith(
      ['item1', 'item2'],
      groupedOrders
    );
  });

  it('should set isSending to true during operation and false after completion', async () => {
    const state = {
      selectedItems: ['item1']
    } as any;
    
    const setState = vi.fn();
    const groupedOrders = {};
    
    (sendOrdersForSeparation as jest.Mock).mockResolvedValue({ success: true });
    
    const { result } = renderHook(() => 
      useSeparationOperations(state, setState, groupedOrders)
    );
    
    await act(async () => {
      await result.current.handleEnviarParaSeparacao();
    });
    
    // Check that isSending was set to true at the beginning
    expect(setState).toHaveBeenCalledWith(expect.objectContaining({
      isSending: true
    }));
    
    // Check that isSending was set to false at the end
    expect(setState).toHaveBeenLastCalledWith(expect.objectContaining({
      isSending: false
    }));
  });

  it('should reset selection state when operation succeeds', async () => {
    const state = {
      selectedItems: ['item1', 'item2'],
      selectedItemsDetails: {
        item1: { qtde: 1, valor: 100 },
        item2: { qtde: 2, valor: 200 }
      },
      expandedClients: new Set(['client1'])
    } as any;
    
    const setState = vi.fn();
    const groupedOrders = {};
    
    (sendOrdersForSeparation as jest.Mock).mockResolvedValue({ success: true });
    
    const { result } = renderHook(() => 
      useSeparationOperations(state, setState, groupedOrders)
    );
    
    await act(async () => {
      await result.current.handleEnviarParaSeparacao();
    });
    
    // Check that selection state was reset
    expect(setState).toHaveBeenCalledWith(expect.objectContaining({
      selectedItems: [],
      selectedItemsDetails: {},
      expandedClients: new Set()
    }));
  });

  it('should invalidate queries when operation succeeds', async () => {
    const state = {
      selectedItems: ['item1']
    } as any;
    
    const setState = vi.fn();
    const groupedOrders = {};
    
    (sendOrdersForSeparation as jest.Mock).mockResolvedValue({ success: true });
    
    const { result } = renderHook(() => 
      useSeparationOperations(state, setState, groupedOrders)
    );
    
    await act(async () => {
      await result.current.handleEnviarParaSeparacao();
    });
    
    // Check that queries were invalidated
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['separacoes'] });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['jabOrders'] });
  });

  it('should set isSending to false even if operation fails', async () => {
    const state = {
      selectedItems: ['item1']
    } as any;
    
    const setState = vi.fn();
    const groupedOrders = {};
    
    (sendOrdersForSeparation as jest.Mock).mockRejectedValue(new Error('Operation failed'));
    
    const { result } = renderHook(() => 
      useSeparationOperations(state, setState, groupedOrders)
    );
    
    await act(async () => {
      try {
        await result.current.handleEnviarParaSeparacao();
      } catch (error) {
        // Ignore error
      }
    });
    
    // Check that isSending was set to false at the end
    expect(setState).toHaveBeenLastCalledWith(expect.objectContaining({
      isSending: false
    }));
  });
});
