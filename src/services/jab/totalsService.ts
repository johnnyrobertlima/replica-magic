
import { supabase } from "@/integrations/supabase/client";
import type { JabTotalsResponse } from "@/types/jabOrders";

/**
 * Fetches totals for JAB orders
 */
export async function fetchTotals(): Promise<JabTotalsResponse> {
  const valorTotalResponse = await supabase.rpc('calcular_valor_total_jab');
  const valorFaturarResponse = await supabase.rpc('calcular_valor_faturar_com_estoque');

  if (valorTotalResponse.error) {
    console.error('Erro ao calcular valor total:', valorTotalResponse.error);
    throw valorTotalResponse.error;
  }

  if (valorFaturarResponse.error) {
    console.error('Erro ao calcular valor para faturar:', valorFaturarResponse.error);
    throw valorFaturarResponse.error;
  }

  const valorTotalSaldo = valorTotalResponse.data?.[0]?.valor_total_saldo || 0;
  const valorFaturarComEstoque = Number(valorFaturarResponse.data?.[0]?.valor_total_faturavel || 0);

  console.log('Valores calculados:', { valorTotalSaldo, valorFaturarComEstoque });

  return {
    valorTotalSaldo,
    valorFaturarComEstoque
  };
}
