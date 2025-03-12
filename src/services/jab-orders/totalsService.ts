
import { supabase } from "@/integrations/supabase/client";
import { JabTotalsResponse } from "@/types/jabOrders";

export const fetchTotals = async (): Promise<JabTotalsResponse> => {
  try {
    // Fetch totals for valor total saldo
    const { data: valorTotalSaldoData, error: valorTotalSaldoError } = await supabase
      .rpc('calcular_valor_total_jab');

    if (valorTotalSaldoError) throw valorTotalSaldoError;

    // Fetch totals for valor faturar com estoque
    const { data: valorFaturarComEstoqueData, error: valorFaturarComEstoqueError } = await supabase
      .rpc('calcular_valor_faturar_com_estoque');

    if (valorFaturarComEstoqueError) throw valorFaturarComEstoqueError;

    return {
      valorTotalSaldo: valorTotalSaldoData ? valorTotalSaldoData[0]?.valor_total_saldo || 0 : 0,
      valorFaturarComEstoque: valorFaturarComEstoqueData ? valorFaturarComEstoqueData[0]?.valor_total_faturavel || 0 : 0
    };
  } catch (error) {
    console.error('Erro ao buscar totais:', error);
    return {
      valorTotalSaldo: 0,
      valorFaturarComEstoque: 0
    };
  }
};
