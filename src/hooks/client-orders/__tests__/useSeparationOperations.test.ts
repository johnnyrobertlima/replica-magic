
import { renderHook, act } from '@testing-library/react-hooks';
import { vi, describe, it, expect } from 'vitest';
import { useSeparationOperations } from '../useSeparationOperations';
import { createSeparacao } from '@/services/clientSeparationService';
import { useNavigate } from 'react-router-dom';

// Mock the dependencies
vi.mock('@/services/clientSeparationService', () => ({
  createSeparacao: vi.fn()
}));

vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

describe('useSeparationOperations', () => {
  it('should call createSeparacao with correct parameters and handle success', async () => {
    const mockCreateSeparacao = vi.mocked(createSeparacao);
    mockCreateSeparacao.mockResolvedValue({ 
      id: '123',
      cliente_codigo: 123,
      cliente_nome: 'Test Client',
      status: 'pendente',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      quantidade_itens: 1,
      valor_total: 100
    });

    const mockPush = vi.fn();
    vi.mock('react-router-dom', () => ({
      useNavigate: () => mockPush
    }));

    const setState = vi.fn();
    const clientGroups = {
      'Client A': {
        allItems: [
          { ITEM_CODIGO: 'item1', pedido: 'pedido1', QTDE_SALDO: 10, VALOR_UNITARIO: 5 },
          { ITEM_CODIGO: 'item2', pedido: 'pedido2', QTDE_SALDO: 5, VALOR_UNITARIO: 10 }
        ]
      }
    };
    const { result } = renderHook(() => useSeparationOperations({ selectedItems: { 'pedido1:item1': true } }, setState, clientGroups));

    await act(async () => {
      await result.current.handleEnviarParaSeparacao();
    });

    expect(mockCreateSeparacao).toHaveBeenCalledWith({ 'pedido1:item1': { qtde: 10, valor: 5 } }, clientGroups, undefined);
    expect(setState).toHaveBeenCalledWith(expect.objectContaining({ isSending: false, selectedItems: {} }));
  });

  it('should handle createSeparacao failure and display an error toast', async () => {
    const mockCreateSeparacao = vi.mocked(createSeparacao);
    mockCreateSeparacao.mockRejectedValue(new Error('Failed to create separation'));

    const mockToast = vi.fn();
    vi.mock('@/components/ui/use-toast', () => ({
      toast: mockToast
    }));

    const setState = vi.fn();
    const clientGroups = {
      'Client A': {
        allItems: [
          { ITEM_CODIGO: 'item1', pedido: 'pedido1', QTDE_SALDO: 10, VALOR_UNITARIO: 5 },
          { ITEM_CODIGO: 'item2', pedido: 'pedido2', QTDE_SALDO: 5, VALOR_UNITARIO: 10 }
        ]
      }
    };
    const { result } = renderHook(() => useSeparationOperations({ selectedItems: { 'pedido1:item1': true } }, setState, clientGroups));

    await act(async () => {
      await result.current.handleEnviarParaSeparacao();
    });

    expect(mockCreateSeparacao).toHaveBeenCalled();
    expect(setState).toHaveBeenCalledWith(expect.objectContaining({ isSending: false }));
  });
});
