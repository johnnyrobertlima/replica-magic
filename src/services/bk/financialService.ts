
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

export const fetchBkFaturamentoData = async (
  startDate?: string,
  endDate?: string
): Promise<BkFaturamento[]> => {
  console.log("Fetching B&K faturamento data...", { startDate, endDate });
  
  // Step 1: Query BLUEBAY_FATURAMENTO with date filtering
  let query = supabase
    .from('BLUEBAY_FATURAMENTO')
    .select('*');
  
  // Apply date filters if provided
  if (startDate) {
    query = query.gte('DATA_EMISSAO', startDate);
  }
  
  if (endDate) {
    query = query.lte('DATA_EMISSAO', endDate);
  }
  
  const { data: faturamentoData, error: faturamentoError } = await query;

  if (faturamentoError) {
    console.error("Error fetching B&K faturamento data:", faturamentoError);
    throw faturamentoError;
  }

  console.log(`Fetched ${faturamentoData?.length || 0} faturamento records`);
  
  // Step 2: Now get all BK pedidos to filter the faturamento
  const { data: pedidosData, error: pedidosError } = await supabase
    .from('BLUEBAY_PEDIDO')
    .select('PED_NUMPEDIDO, PED_ANOBASE')
    .eq('CENTROCUSTO', 'BK');
  
  if (pedidosError) {
    console.error("Error fetching BK pedidos:", pedidosError);
    throw pedidosError;
  }
  
  console.log(`Fetched ${pedidosData?.length || 0} BK pedidos`);
  
  // Create a map of pedidos for faster lookup
  const bkPedidosMap = new Map();
  pedidosData.forEach(pedido => {
    const key = `${pedido.PED_NUMPEDIDO}-${pedido.PED_ANOBASE}`;
    bkPedidosMap.set(key, true);
  });
  
  // Step 3: Filter faturamento data to only include those related to BK pedidos
  const filteredData = faturamentoData.filter(item => {
    if (!item.PED_NUMPEDIDO || !item.PED_ANOBASE) return false;
    const key = `${item.PED_NUMPEDIDO}-${item.PED_ANOBASE}`;
    return bkPedidosMap.has(key);
  });
  
  console.log(`Filtered to ${filteredData.length} faturamento records related to BK pedidos`);
  
  // Let's separately get the cliente names
  if (filteredData && filteredData.length > 0) {
    const clienteIds = filteredData
      .map(item => item.PES_CODIGO)
      .filter((id): id is number => id !== null && !isNaN(Number(id)));
    
    if (clienteIds.length > 0) {
      const { data: clientesData, error: clientesError } = await supabase
        .from('BLUEBAY_PESSOA')
        .select('PES_CODIGO, APELIDO, RAZAOSOCIAL')
        .in('PES_CODIGO', clienteIds);
      
      if (!clientesError && clientesData) {
        // Create a map of cliente IDs to their names
        const clienteMap = new Map<number, { APELIDO: string | null, RAZAOSOCIAL: string | null }>();
        clientesData.forEach(cliente => {
          clienteMap.set(cliente.PES_CODIGO, {
            APELIDO: cliente.APELIDO,
            RAZAOSOCIAL: cliente.RAZAOSOCIAL
          });
        });
        
        // Attach cliente info to each faturamento record
        filteredData.forEach(item => {
          if (item.PES_CODIGO !== null) {
            const clienteInfo = clienteMap.get(item.PES_CODIGO);
            if (clienteInfo) {
              // Adding cliente info to the faturamento item
              (item as any).CLIENTE_INFO = clienteInfo;
            }
          }
        });
      }
    }
  }
  
  return filteredData;
};

export const fetchInvoiceItems = async (nota: string): Promise<any[]> => {
  console.log("Fetching invoice items for nota:", nota);
  const { data, error } = await supabase
    .from('BLUEBAY_FATURAMENTO')
    .select('NOTA, ITEM_CODIGO, QUANTIDADE, VALOR_UNITARIO')
    .eq('NOTA', nota);
  
  if (error) {
    console.error("Error fetching invoice items:", error);
    throw error;
  }
  
  console.log(`Fetched ${data?.length} items for nota ${nota}`);
  return data || [];
};

export const consolidateByNota = (data: BkFaturamento[]): ConsolidatedInvoice[] => {
  const invoiceMap = new Map<string, ConsolidatedInvoice>();
  
  data.forEach(item => {
    if (!item.NOTA) return;
    
    // Calculate the item value as QUANTIDADE * VALOR_UNITARIO
    const itemValue = (item.QUANTIDADE || 0) * (item.VALOR_UNITARIO || 0);
    
    const existingInvoice = invoiceMap.get(item.NOTA);
    
    if (existingInvoice) {
      // Update the existing invoice
      existingInvoice.ITEMS_COUNT += 1;
      // Add the calculated item value to the invoice total
      existingInvoice.VALOR_NOTA = (existingInvoice.VALOR_NOTA || 0) + itemValue;
    } else {
      // Get cliente name if available
      const clienteInfo = (item as any).CLIENTE_INFO;
      const clienteNome = clienteInfo ? 
        (clienteInfo.APELIDO || clienteInfo.RAZAOSOCIAL || null) : null;
      
      // Create a new invoice entry with the calculated value
      invoiceMap.set(item.NOTA, {
        NOTA: item.NOTA,
        DATA_EMISSAO: item.DATA_EMISSAO ? new Date(item.DATA_EMISSAO).toISOString() : null,
        PES_CODIGO: item.PES_CODIGO,
        STATUS: item.STATUS,
        VALOR_NOTA: itemValue,  // Use the calculated value
        ITEMS_COUNT: 1,
        CLIENTE_NOME: clienteNome
      });
    }
  });
  
  return Array.from(invoiceMap.values());
};
