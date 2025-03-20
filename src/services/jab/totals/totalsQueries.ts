
import { supabase } from '../base/supabaseClient';
import { JabTotalsResponse } from '@/types/jabOrders';

// Function to fetch order totals
export async function fetchTotals(centrocusto: string = 'JAB'): Promise<JabTotalsResponse> {
  try {
    // Fetch total saldo value
    const valorTotalSaldoResult = await supabase.rpc('calcular_valor_total_por_centrocusto', {
      centro_custo: centrocusto
    });

    // Fetch total faturável com estoque value
    const valorFaturarComEstoqueResult = await supabase.rpc('calcular_valor_faturar_com_estoque_por_centrocusto', {
      centro_custo: centrocusto
    });

    // Check for errors in both queries
    if (valorTotalSaldoResult.error) {
      console.error('Erro ao buscar valor total do saldo:', valorTotalSaldoResult.error);
      return { valorTotalSaldo: 0, valorFaturarComEstoque: 0 };
    }

    if (valorFaturarComEstoqueResult.error) {
      console.error('Erro ao buscar valor a faturar com estoque:', valorFaturarComEstoqueResult.error);
      return { valorTotalSaldo: 0, valorFaturarComEstoque: 0 };
    }

    // Extract values from results
    const valorTotalSaldo = valorTotalSaldoResult.data?.[0]?.valor_total_saldo || 0;
    const valorFaturarComEstoque = valorFaturarComEstoqueResult.data?.[0]?.valor_total_faturavel || 0;

    return {
      valorTotalSaldo,
      valorFaturarComEstoque
    };
  } catch (error) {
    console.error('Exceção ao buscar totais:', error);
    return { valorTotalSaldo: 0, valorFaturarComEstoque: 0 };
  }
}
