
import { ClienteFinanceiro } from "@/types/financialClient";
import { supabase } from "@/integrations/supabase/client";

export const getSeparacoesPendentes = (separacoes: any[], hiddenCards: Set<string>) => {
  return separacoes.filter(sep => !hiddenCards.has(sep.id));
};

export const getClientesCodigos = (separacoes: any[]) => {
  return Array.from(new Set(separacoes.map(sep => sep.cliente_codigo)));
};

export const updateVolumeSaudavel = async (clienteCodigo: number | string, valor: number) => {
  try {
    const { data, error } = await supabase
      .from('BLUEBAY_PESSOA')
      .update({ volume_saudavel_faturamento: valor })
      .eq('PES_CODIGO', String(clienteCodigo))
      .select();

    if (error) {
      console.error("Erro ao atualizar o volume saudável:", error);
      return { success: false, error: error };
    }

    return { success: true, data: data };
  } catch (error) {
    console.error("Erro ao atualizar o volume saudável:", error);
    return { success: false, error: error };
  }
};

export const fetchTitulosVencidos = async (clienteCodigo: number | string): Promise<number> => {
  try {
    let { data, error } = await supabase
      .from('BLUEBAY_TITULO')
      .select('VLRSALDO')
      .eq('PES_CODIGO', String(clienteCodigo))
      .lt('DTVENCIMENTO', new Date().toISOString());

    if (error) throw error;

    return data?.reduce((acc, titulo) => acc + (titulo.VLRSALDO || 0), 0) || 0;
  } catch (error) {
    console.error('Error fetching titulos vencidos:', error);
    return 0;
  }
};
