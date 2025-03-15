
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type BkFaturamento = Database["public"]["Tables"]["BLUEBAY_FATURAMENTO"]["Row"];

interface ConsolidatedInvoice {
  NOTA: string;
  DATA_EMISSAO: string | null;
  PES_CODIGO: number | null;
  STATUS: string | null;
  VALOR_NOTA: number | null;
  ITEMS_COUNT: number;
  CLIENTE_NOME?: string | null;
}

export const fetchBkFaturamentoData = async (): Promise<BkFaturamento[]> => {
  console.log("Fetching B&K faturamento data...");
  
  const { data, error } = await supabase
    .from('BLUEBAY_FATURAMENTO')
    .select(`
      *,
      BLUEBAY_PESSOA:PES_CODIGO (APELIDO, RAZAOSOCIAL)
    `)
    .in('PED_NUMPEDIDO', (
      supabase
        .from('BLUEBAY_PEDIDO')
        .select('PED_NUMPEDIDO')
        .eq('CENTROCUSTO', 'BK')
    ));

  if (error) {
    console.error("Error fetching B&K faturamento data:", error);
    throw error;
  }

  console.log(`Fetched ${data?.length} faturamento records`);
  return data || [];
};

export const consolidateByNota = (data: BkFaturamento[]): ConsolidatedInvoice[] => {
  const invoiceMap = new Map<string, ConsolidatedInvoice>();
  
  data.forEach(item => {
    if (!item.NOTA) return;
    
    const existingInvoice = invoiceMap.get(item.NOTA);
    
    if (existingInvoice) {
      // Update the existing invoice
      existingInvoice.ITEMS_COUNT += 1;
    } else {
      // Create a new invoice entry
      invoiceMap.set(item.NOTA, {
        NOTA: item.NOTA,
        DATA_EMISSAO: item.DATA_EMISSAO ? new Date(item.DATA_EMISSAO).toISOString() : null,
        PES_CODIGO: item.PES_CODIGO,
        STATUS: item.STATUS,
        VALOR_NOTA: item.VALOR_NOTA,
        ITEMS_COUNT: 1
      });
    }
  });
  
  return Array.from(invoiceMap.values());
};
