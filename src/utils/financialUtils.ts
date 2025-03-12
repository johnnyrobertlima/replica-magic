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

export const getSeparacoesPendentes = (separacoes: any[], hiddenCards: Set<string>): any[] => {
  return separacoes.filter(sep => 
    !hiddenCards.has(sep.id) && 
    sep.status === 'pendente'
  );
};

export const getClientesCodigos = (separacoesPendentes: any[]): number[] => {
  return Array.from(new Set(
    separacoesPendentes.map(sep => 
      typeof sep.cliente_codigo === 'string' 
        ? parseInt(sep.cliente_codigo, 10) 
        : sep.cliente_codigo
    )
  )).filter(codigo => !isNaN(codigo));
};

export const updateVolumeSaudavel = async (clienteCodigo: number | string, valor: number) => {
  try {
    const clienteCodigoStr = clientCodeToString(clienteCodigo);
    const { data, error } = await supabase
      .from('BLUEBAY_PESSOA')
      .update({ volume_saudavel_faturamento: valor })
      .eq('PES_CODIGO', clienteCodigoStr)
      .select();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Erro ao atualizar volume saudável:', error);
    return { success: false, error };
  }
};

export const calculateClientFinancialValues = (
  cliente: any, 
  titulo: any, 
  today: Date
) => {
  const valorTitulo = parseFloat(titulo.VLRTITULO) || 0;
  cliente.valoresTotais += valorTitulo;

  const valorSaldo = parseFloat(titulo.VLRSALDO) || 0;
  if (valorSaldo > 0) {
    cliente.valoresEmAberto += valorSaldo;

    if (titulo.DTVENCIMENTO) {
      const vencimento = new Date(titulo.DTVENCIMENTO);
      vencimento.setHours(0, 0, 0, 0);
      
      if (vencimento < today) {
        cliente.valoresVencidos += valorSaldo;
      }
    }
  }
};
