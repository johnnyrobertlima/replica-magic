
import { supabase } from "@/integrations/supabase/client";

export const fetchTotals = async () => {
  try {
    const { data: valorTotalSaldo, error: saldoError } = await supabase.rpc('calcular_valor_total_jab');
    if (saldoError) throw saldoError;

    const { data: valorFaturarComEstoque, error: estoqueError } = await supabase.rpc('calcular_valor_faturar_com_estoque');
    if (estoqueError) throw estoqueError;

    return {
      valorTotalSaldo: valorTotalSaldo?.[0]?.valor_total_saldo || 0,
      valorFaturarComEstoque: valorFaturarComEstoque?.[0]?.valor_total_faturavel || 0
    };
  } catch (error) {
    console.error('Erro ao buscar totais:', error);
    throw error;
  }
};
