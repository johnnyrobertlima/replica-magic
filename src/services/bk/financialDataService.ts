
import { supabase } from "@/integrations/supabase/client";
import { BkFaturamento, InvoiceItem } from "./types/financialTypes";

/**
 * Fetches faturamento data with date range filtering
 */
export const fetchBkFaturamentoData = async (
  startDate?: string,
  endDate?: string
): Promise<BkFaturamento[]> => {
  console.log("Fetching B&K faturamento data...", { startDate, endDate });
  
  // Use the RPC function to get filtered data with joins
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_bk_faturamento', {
    start_date: startDate,
    end_date: endDate
  });

  if (rpcError) {
    console.error("Error fetching B&K faturamento data via RPC:", rpcError);
    
    // Fallback to direct query on the BLUEBAY_FATURAMENTO table if RPC fails
    // Join with BLUEBAY_PEDIDO to filter by CENTROCUSTO = 'BK'
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('BLUEBAY_FATURAMENTO')
      .select(`
        *,
        BLUEBAY_PEDIDO!inner(CENTROCUSTO)
      `)
      .eq('BLUEBAY_PEDIDO.CENTROCUSTO', 'BK')
      .gte(startDate ? 'DATA_EMISSAO' : 'created_at', startDate || '1900-01-01')
      .lte(endDate ? 'DATA_EMISSAO' : 'created_at', endDate || '2100-12-31');
    
    if (fallbackError) {
      console.error("Error in fallback query:", fallbackError);
      throw fallbackError;
    }
    
    console.log(`Fetched ${fallbackData?.length || 0} faturamento records via fallback`);
    return processFaturamentoData(fallbackData || []);
  }

  console.log(`Fetched ${rpcData?.length || 0} faturamento records via RPC`);
  return processFaturamentoData(rpcData || []);
};

/**
 * Fetches items for a specific invoice
 */
export const fetchInvoiceItems = async (nota: string): Promise<InvoiceItem[]> => {
  console.log("Fetching invoice items for nota:", nota);
  
  // Query all items for this invoice, joining with BLUEBAY_PEDIDO to filter by CENTROCUSTO
  const { data, error } = await supabase
    .from('BLUEBAY_FATURAMENTO')
    .select(`
      *,
      BLUEBAY_PEDIDO!inner(CENTROCUSTO)
    `)
    .eq('NOTA', nota)
    .eq('TIPO', 'S')
    .eq('BLUEBAY_PEDIDO.CENTROCUSTO', 'BK');
  
  if (error) {
    console.error("Error fetching invoice items:", error);
    throw error;
  }
  
  console.log(`Fetched ${data?.length} items for nota ${nota}`);

  const items: InvoiceItem[] = data || [];

  // Get client correction factor if available
  if (items.length > 0 && items[0].PES_CODIGO) {
    const pesCode = items[0].PES_CODIGO;
    const { data: clienteData, error: clienteError } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('fator_correcao')
      .eq('PES_CODIGO', pesCode)
      .single();

    if (!clienteError && clienteData) {
      const fatorCorrecao = clienteData.fator_correcao;
      items.forEach(item => {
        item.FATOR_CORRECAO = fatorCorrecao;
      });
    }
  }
  
  return items;
};

/**
 * Processes raw faturamento data by adding client information and correction factors
 */
const processFaturamentoData = async (data: BkFaturamento[]): Promise<BkFaturamento[]> => {
  const filteredData = data?.filter(item => item.TIPO === 'S') || [];
  console.log(`Filtered to ${filteredData.length} records with TIPO = 'S'`);
  
  if (filteredData.length > 0) {
    const clienteIds = filteredData
      .map(item => item.PES_CODIGO)
      .filter((id): id is number => id !== null && !isNaN(Number(id)));
    
    if (clienteIds.length > 0) {
      const { data: clientesData, error: clientesError } = await supabase
        .from('BLUEBAY_PESSOA')
        .select('PES_CODIGO, APELIDO, RAZAOSOCIAL, fator_correcao')
        .in('PES_CODIGO', clienteIds);
      
      if (!clientesError && clientesData) {
        const clienteMap = new Map<number, { 
          APELIDO: string | null, 
          RAZAOSOCIAL: string | null,
          FATOR_CORRECAO: number | null 
        }>();
        
        clientesData.forEach(cliente => {
          clienteMap.set(cliente.PES_CODIGO, {
            APELIDO: cliente.APELIDO,
            RAZAOSOCIAL: cliente.RAZAOSOCIAL,
            FATOR_CORRECAO: cliente.fator_correcao
          });
        });
        
        filteredData.forEach(item => {
          if (item.PES_CODIGO !== null) {
            const clienteInfo = clienteMap.get(item.PES_CODIGO);
            if (clienteInfo) {
              (item as any).CLIENTE_INFO = clienteInfo;
              (item as any).FATOR_CORRECAO = clienteInfo.FATOR_CORRECAO;
            }
          }
        });
      }
    }
  }
  
  return filteredData;
};
