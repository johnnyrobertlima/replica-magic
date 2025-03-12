
import { supabase } from "@/integrations/supabase/client";

export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('pt-BR');
};

// Função para calcular valores financeiros do cliente
export const calculateClientFinancialValues = (cliente: any, titulo: any, today: Date) => {
  if (!titulo || !titulo.VLRSALDO) return;
  
  const saldo = parseFloat(titulo.VLRSALDO) || 0;
  cliente.valoresTotais += saldo;
  
  // Verificar se está em aberto
  if (titulo.STATUS === '1' || titulo.STATUS === '2') {
    cliente.valoresEmAberto += saldo;
  }
  
  // Verificar se está vencido
  if (titulo.DTVENCIMENTO) {
    const vencimento = new Date(titulo.DTVENCIMENTO);
    vencimento.setHours(0, 0, 0, 0);
    if (vencimento < today) {
      cliente.valoresVencidos += saldo;
    }
  }
};

// Convert client code to string for database queries
export const clientCodeToString = (clientCode: string | number): string => {
  return String(clientCode);
};

export const fetchTitulosVencidos = async (clientCode: number | string): Promise<number> => {
  const today = new Date().toISOString().split('T')[0];
  const clienteCodigoStr = clientCodeToString(clientCode);

  try {
    const { data, error } = await supabase
      .from('BLUEBAY_TITULO')
      .select('VLRSALDO')
      .eq('PES_CODIGO', clienteCodigoStr)
      .lt('DTVENCIMENTO', today)
      .not('VLRSALDO', 'is', null);

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    return data.reduce((total, titulo) => {
      const saldo = parseFloat(titulo.VLRSALDO) || 0;
      return total + saldo;
    }, 0);
  } catch (error) {
    console.error('Erro ao buscar títulos vencidos:', error);
    return 0;
  }
};

// Função para obter separações pendentes, filtrando cards escondidos
export const getSeparacoesPendentes = (separacoes: any[], hiddenCards: Set<string>) => {
  return separacoes.filter(sep => 
    sep.status === 'pendente' && 
    !hiddenCards.has(sep.id)
  );
};

// Função para obter códigos de clientes únicos das separações
export const getClientesCodigos = (separacoesPendentes: any[]) => {
  return Array.from(new Set(
    separacoesPendentes.map(sep => sep.cliente_codigo)
  ));
};

// Função para atualizar o volume saudável de um cliente
export const updateVolumeSaudavel = async (clienteCodigo: string | number, valor: number) => {
  try {
    const { data, error } = await supabase
      .from('BLUEBAY_PESSOA')
      .update({ volume_saudavel_faturamento: valor })
      .eq('PES_CODIGO', clientCodeToString(clienteCodigo))
      .select();
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao atualizar volume saudável:', error);
    return { success: false, error };
  }
};
