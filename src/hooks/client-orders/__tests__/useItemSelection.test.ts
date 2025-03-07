
import { renderHook, act } from '@testing-library/react-hooks';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useItemSelection } from '../useItemSelection';
import { useToast } from '@/hooks/use-toast';

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

// Mock document.createElement and URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();
const mockCreateElement = vi.fn().mockReturnValue({
  setAttribute: vi.fn(),
  click: mockClick,
});

Object.defineProperty(global.document, 'createElement', {
  value: mockCreateElement,
  writable: true
});

Object.defineProperty(global.document.body, 'appendChild', {
  value: mockAppendChild,
  writable: true
});

Object.defineProperty(global.document.body, 'removeChild', {
  value: mockRemoveChild,
  writable: true
});

describe('useItemSelection', () => {
  const mockToast = { toast: vi.fn() };
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as ReturnType<typeof vi.fn>).mockReturnValue(mockToast);
  });

  it('should calculate total selected amount correctly', () => {
    const initialState = {
      selectedItems: ['item1', 'item2'],
      selectedItemsDetails: {
        item1: { qtde: 2, valor: 100 },
        item2: { qtde: 3, valor: 200 }
      }
    } as any;
    
    const setState = vi.fn();
    const filteredGroups = {};
    
    const { result } = renderHook(() => useItemSelection(initialState, setState, filteredGroups));
    
    // 2 * 100 + 3 * 200 = 200 + 600 = 800
    expect(result.current.totalSelecionado).toBe(800);
  });

  it('should handle item selection correctly', () => {
    const initialState = {
      selectedItems: ['item1'],
      selectedItemsDetails: {
        item1: { qtde: 2, valor: 100 }
      }
    } as any;
    
    const setState = vi.fn();
    const filteredGroups = {};
    
    const { result } = renderHook(() => useItemSelection(initialState, setState, filteredGroups));
    
    // Add a new item
    const newItem = {
      ITEM_CODIGO: 'item2',
      QTDE_SALDO: 3,
      VALOR_UNITARIO: 200
    };
    
    act(() => {
      result.current.handleItemSelect(newItem);
    });
    
    expect(setState).toHaveBeenCalled();
    const updaterFn = setState.mock.calls[0][0];
    const newState = updaterFn(initialState);
    
    expect(newState.selectedItems).toContain('item2');
    expect(newState.selectedItemsDetails.item2).toEqual({
      qtde: 3,
      valor: 200
    });
    
    // Remove an existing item
    const existingItem = {
      ITEM_CODIGO: 'item1',
      QTDE_SALDO: 2,
      VALOR_UNITARIO: 100
    };
    
    act(() => {
      result.current.handleItemSelect(existingItem);
    });
    
    expect(setState).toHaveBeenCalledTimes(2);
    const removerFn = setState.mock.calls[1][0];
    const stateAfterRemove = removerFn(initialState);
    
    expect(stateAfterRemove.selectedItems).not.toContain('item1');
    expect(stateAfterRemove.selectedItemsDetails.item1).toBeUndefined();
  });

  it('should show error toast when trying to export with no items selected', () => {
    const initialState = {
      selectedItems: [],
      selectedItemsDetails: {}
    } as any;
    
    const setState = vi.fn();
    const filteredGroups = {};
    
    const { result } = renderHook(() => useItemSelection(initialState, setState, filteredGroups));
    
    act(() => {
      result.current.exportSelectedItemsToExcel();
    });
    
    expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Nenhum item selecionado',
      variant: 'destructive'
    }));
  });

  it('should create and download CSV file when exporting items', () => {
    const initialState = {
      selectedItems: ['item1', 'item2'],
      selectedItemsDetails: {
        item1: { qtde: 2, valor: 100 },
        item2: { qtde: 3, valor: 200 }
      }
    } as any;
    
    const setState = vi.fn();
    const filteredGroups = {
      'Client A': {
        representante: 'Rep X',
        allItems: [
          {
            ITEM_CODIGO: 'item1',
            pedido: 'pedido1',
            DESCRICAO: 'Product 1',
            QTDE_PEDIDA: 10,
            QTDE_ENTREGUE: 8,
            QTDE_SALDO: 2,
            FISICO: 5,
            VALOR_UNITARIO: 100
          }
        ]
      },
      'Client B': {
        representante: 'Rep Y',
        allItems: [
          {
            ITEM_CODIGO: 'item2',
            pedido: 'pedido2',
            DESCRICAO: 'Product 2',
            QTDE_PEDIDA: 5,
            QTDE_ENTREGUE: 2,
            QTDE_SALDO: 3,
            FISICO: 10,
            VALOR_UNITARIO: 200
          }
        ]
      }
    };
    
    const { result } = renderHook(() => useItemSelection(initialState, setState, filteredGroups));
    
    act(() => {
      result.current.exportSelectedItemsToExcel();
    });
    
    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockClick).toHaveBeenCalled();
    expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Exportação concluída',
      description: '2 itens exportados com sucesso'
    }));
  });
});
