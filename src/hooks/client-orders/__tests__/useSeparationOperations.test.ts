import { renderHook, act } from '@testing-library/react-hooks';
import { vi } from 'vitest';
import { useSeparationOperations } from '../useSeparationOperations';
import { createSeparacao } from '@/services/clientSeparationService';

// Mock the dependencies
vi.mock('@/services/clientSeparationService', () => ({
  createSeparacao: vi.fn()
}));

vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

describe('useSeparationOperations', () => {
  it('should call createSeparacao with correct parameters and handle success', async () => {
    const mockCreateSeparacao = vi.mocked(createSeparacao);
    mockCreateSeparacao.mockResolvedValue({ id: '123' });

    const mockPush = vi.fn();
    vi.mock('react-router-dom', () => ({
      useRouter: () => ({
        push: mockPush
      })
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
    expect(mockPush).toHaveBeenCalledWith('/client-area/bluebay/separacoes/123');
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
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Erro ao enviar para separação', description: 'Error: Failed to create separation' }));
  });
});
