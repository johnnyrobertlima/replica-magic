
import { supabase } from "@/integrations/supabase/client";
import { clientCodeToString } from "./client-orders/clientUtils";

export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('pt-BR');
};

export const fetchTitulosVencidos = async (clientCode: string | number): Promise<number> => {
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

export const calculateClientFinancialValues = (cliente: any, titulo: any, today: Date) => {
  if (!titulo) return;
  
  const valorTitulo = Number(titulo.VLRTITULO) || 0;
  const valorSaldo = Number(titulo.VLRSALDO) || 0;
  
  cliente.valoresTotais += valorTitulo;
  
  if (titulo.STATUS === '1' || titulo.STATUS === '2') {
    cliente.valoresEmAberto += valorSaldo;
    
    const dataVencimento = new Date(titulo.DTVENCIMENTO);
    if (dataVencimento < today) {
      cliente.valoresVencidos += valorSaldo;
    }
  }
};

export const getSeparacoesPendentes = (separacoes: any[], hiddenCards: Set<string>) => {
  return separacoes.filter(sep => 
    sep.status === 'pendente' && !hiddenCards.has(sep.id)
  );
};

export const getClientesCodigos = (separacoesPendentes: any[]): Array<string | number> => {
  return Array.from(new Set(
    separacoesPendentes.map(sep => sep.cliente_codigo)
  ));
};

export const updateVolumeSaudavel = async (clienteCodigo: string | number, valor: number) => {
  try {
    const clienteCodigoStr = clientCodeToString(clienteCodigo);
    
    const { error } = await supabase
      .from('BLUEBAY_PESSOA')
      .update({ volume_saudavel_faturamento: valor })
      .eq('PES_CODIGO', clienteCodigoStr);
      
    if (error) {
      console.error('Erro ao atualizar volume saudável:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Exceção ao atualizar volume saudável:', err);
    return { success: false, error: err };
  }
};
