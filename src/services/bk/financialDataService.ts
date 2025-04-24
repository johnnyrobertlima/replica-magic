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
    const query = supabase
      .from('BLUEBAY_FATURAMENTO')
      .select('*')
      .neq('TRANSACAO', 1011); // Filter out TRANSACAO = 1011
    
    if (startDate) {
      query.gte('DATA_EMISSAO', startDate);
    }
    
    if (endDate) {
      query.lte('DATA_EMISSAO', endDate);
    }
    
    const { data: fallbackData, error: fallbackError } = await query;
    
    if (fallbackError) {
      console.error("Error in fallback query:", fallbackError);
      throw fallbackError;
    }
    
    console.log(`Fetched ${fallbackData?.length || 0} faturamento records via fallback`);
    return processFaturamentoData(fallbackData || []);
  }

  // Filter out TRANSACAO = 1011 from RPC results
  const filteredRpcData = rpcData?.filter(item => item.TRANSACAO !== 1011) || [];

  console.log(`Fetched ${filteredRpcData?.length || 0} faturamento records via RPC`);
  return processFaturamentoData(filteredRpcData);
};

/**
 * Fetches items for a specific invoice
 */
export const fetchInvoiceItems = async (nota: string): Promise<InvoiceItem[]> => {
  console.log("Fetching invoice items for nota:", nota);
  
  // Query all items for this invoice
  const { data, error } = await supabase
    .from('BLUEBAY_FATURAMENTO')
    .select('NOTA, ITEM_CODIGO, QUANTIDADE, VALOR_UNITARIO, TIPO, PES_CODIGO')
    .eq('NOTA', nota)
    .eq('TIPO', 'S');
  
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
              (item as any).FATOR_CORRECAO = clienteInfo.FATOR_CORRECAO; // Adiciona o fator de correção diretamente no item
            }
          }
        });
      }
    }
  }
  
  return filteredData;
};
